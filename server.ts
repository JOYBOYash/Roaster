import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Helper to check for private or unsafe IP address (SSRF Protection)
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1'
  ) {
    return true;
  }

  // Regex for IP ranges
  const ipV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipV4);
  if (match) {
    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);
    // 127.0.0.0/8
    if (p1 === 127) return true;
    // 10.0.0.0/8
    if (p1 === 10) return true;
    // 172.16.0.0/12
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    // 192.168.0.0/16
    if (p1 === 192 && p2 === 168) return true;
    // 169.254.0.0/16 (AWS / GCP Metadata)
    if (p1 === 169 && p2 === 254) return true;
    // 0.0.0.0/8
    if (p1 === 0) return true;
  }
  return false;
}

// Bounded HTML scraper & text cleaner
async function fetchAndExtractWebsiteContent(targetUrl: string): Promise<{ title: string; metaDesc: string; headings: string[]; text: string; domain: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are supported');
  }

  if (isPrivateHost(parsedUrl.hostname)) {
    throw new Error('Private or internal network destinations are blocked for security');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Roastie/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Target returned HTTP status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('Target destination did not return HTML content');
    }

    const textBuffer = await response.text();
    const html = textBuffer.slice(0, 500000); // 500KB cap

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
                      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';

    // Extract h1, h2, h3 headings
    const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
    const headings = headingMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 10);

    // Clean body text (strip scripts, styles, svg, comments)
    let bodyClean = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Cap extracted text length
    const visibleText = bodyClean.slice(0, 2500);

    return {
      title,
      metaDesc,
      headings,
      text: visibleText,
      domain: parsedUrl.hostname.replace(/^www\./, '')
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Target website timed out after 6 seconds');
    }
    throw new Error(err.message || 'Failed to retrieve website content');
  }
}

// Lightweight diagnostic endpoint for hosted and AI Studio deployments.
// Never return secrets or exception details from this route.
app.get('/api/health', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const aiConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

  res.status(200).json({
    ok: true,
    service: 'roastie-api',
    aiConfigured,
    timestamp: new Date().toISOString()
  });
});

// Core API endpoint for website roasting
app.post('/api/roast', async (req: Request, res: Response) => {
  try {
    const { url, pastedText } = req.body;

    if (!url && (!pastedText || typeof pastedText !== 'string' || !pastedText.trim())) {
      res.status(400).json({ success: false, error: 'Please enter a website URL or paste page copy.' });
      return;
    }

    let domain = 'Pasted website copy';
    let extractedText = '';
    let inputMethod: 'url' | 'pasted' = 'pasted';

    if (url && typeof url === 'string' && url.trim()) {
      inputMethod = 'url';
      let rawUrl = url.trim();
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }

      try {
        const pageData = await fetchAndExtractWebsiteContent(rawUrl);
        domain = pageData.domain;
        extractedText = `Title: ${pageData.title}\nMeta Description: ${pageData.metaDesc}\nHeadings: ${pageData.headings.join(' | ')}\nContent: ${pageData.text}`;
      } catch (fetchError: any) {
        // Honest failure reporting without claiming a fetch succeeded
        res.status(200).json({
          success: false,
          canPasteFallback: true,
          error: `Could not retrieve ${rawUrl}: ${fetchError.message || 'Connection failed or blocked'}. You can paste the website copy directly below.`
        });
        return;
      }
    } else {
      inputMethod = 'pasted';
      extractedText = pastedText.trim().slice(0, 3000);
      domain = 'pasted-text';
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.error('GEMINI_API_KEY is not configured.');
      res.status(503).json({
        success: false,
        error: 'Roastie AI is not configured right now. No roast was generated.'
      });
      return;
    }

    let headlineText = '';
    let roastText = '';

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const sourceLabel = inputMethod === 'url' ? domain : 'the pasted website copy';
      const prompt = `Write one specific, funny website roast based only on the source text below for ${sourceLabel}.

Return:
- headline: 3 to 7 words, a sharp hook that does not repeat the roast.
- roast: one punchy paragraph of 18 to 30 words.

Rules:
- Use only details and phrases present in the supplied text.
- Never invent features, pricing, customers, metrics, visual design, bugs, performance, SEO results, or claims about the site.
- Do not imply the site was tested. This is a roast of the supplied copy only.
- If there is too little detail for a specific joke, say so briefly and make the joke about the copy being too vague.
- No scores, rankings, verdict labels, advice, recommendations, or second summary.
- Avoid filler, repeated points, all-caps writing, and corporate catchphrases.

Source text:
${extractedText}`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You write concise comedy about website copy. Be pointed and funny, but never claim facts that are absent from the supplied text. Return valid JSON with exactly the fields headline and roast.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: 'A short, specific 3-7 word headline, not a restatement of the roast.'
              },
              roast: {
                type: Type.STRING,
                description: 'One original, punchy 18-30 word roast based only on the supplied text.'
              }
            },
            required: ['headline', 'roast']
          }
        }
      });

      // If generation times out or fails, return an error instead of a fabricated result.
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 9000)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      if (!response?.text) {
        throw new Error('AI returned an empty response');
      }

      const parsed = JSON.parse(response.text.trim());
      if (
        typeof parsed.headline !== 'string' ||
        typeof parsed.roast !== 'string' ||
        !parsed.headline.trim() ||
        !parsed.roast.trim()
      ) {
        throw new Error('AI returned an incomplete roast');
      }

      headlineText = parsed.headline.trim().replace(/\s+/g, ' ').slice(0, 80);
      roastText = parsed.roast.trim().replace(/\s+/g, ' ').slice(0, 320);
    } catch (aiErr) {
      console.error('Gemini roast generation failed:', aiErr);
      res.status(503).json({
        success: false,
        error: 'Roast generation failed. No roast was created. Please try again.'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        domain,
        headline: headlineText,
        roast: roastText,
        inputMethod
      }
    });
  } catch (err: any) {
    console.error('Error in /api/roast:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while roasting the website. Please try again.'
    });
  }
});

// Guard against /api requests falling through to HTML SPA fallback
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Setup Vite Dev Server or Production Static Files
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, error: 'API endpoint not found' });
      }
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, error: 'API endpoint not found' });
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🔥 Roastie running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
