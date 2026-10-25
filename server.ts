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

// Deterministic humor score calculation (Humorous entertainment score heuristic)
function calculateEntertainmentScore(text: string, domain: string): { score: number; verdict: string } {
  const combined = (text + ' ' + domain).toLowerCase();
  
  const buzzwords = [
    'synergy', 'empower', 'seamless', 'next-gen', 'cutting-edge', 'disrupt',
    'revolutionize', 'all-in-one', 'ai-powered', 'transform', 'unlock',
    'scalable', 'hyper-growth', 'paradigm', 'leverage', 'ecosystem',
    'frictionless', 'robust', 'groundbreaking', 'mission-critical'
  ];

  let buzzCount = 0;
  for (const bw of buzzwords) {
    const matches = combined.split(bw).length - 1;
    buzzCount += matches;
  }

  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }

  const baseScore = Math.abs(hash) % 70 + 15;
  const buzzPenalty = Math.min(buzzCount * 4, 30);
  const finalScore = Math.max(12, Math.min(94, baseScore - buzzPenalty));

  let verdict = 'AGGRESSIVELY AVERAGE';
  if (finalScore < 25) verdict = 'CERTIFIED INTERNET CRIME';
  else if (finalScore < 40) verdict = 'TERMINALLY UNINSPIRED';
  else if (finalScore < 55) verdict = 'SAAS CLONE #4812';
  else if (finalScore < 70) verdict = 'AGGRESSIVELY AVERAGE';
  else if (finalScore < 85) verdict = 'MILDLY COOKED';
  else verdict = 'SURPRISINGLY TOLERABLE';

  return { score: finalScore, verdict };
}

// Fallback comedy generator if AI provider is temporarily unavailable
function generateDeterministicFallbackRoast(domain: string, score: number): { roast: string; punchline: string } {
  const fallbacks = [
    {
      roast: `A website that reads like it was assembled from a template catalogue of corporate promises. You promised the world in the hero banner and delivered vague buzzwords in the body copy.`,
      punchline: `If empty buzzwords were currency, you'd be a billionaire.`
    },
    {
      roast: `This site works overtime to sound like an enterprise giant while carefully avoiding any clear explanation of what it actually builds or offers. Every line is a study in saying nothing with maximum confidence.`,
      punchline: `Built for investors who skim headers and visitors who bounce in three seconds.`
    },
    {
      roast: `A textbook specimen of modern landing page tropes: floating pastel geometry, zero clarity, and copy promising to "revolutionize" what was already working fine without it.`,
      punchline: `More gradient effects than actual utility.`
    }
  ];

  const index = Math.abs(domain.length + score) % fallbacks.length;
  return fallbacks[index];
}

// Core API endpoint for website roasting
app.post('/api/roast', async (req: Request, res: Response) => {
  try {
    const { url, pastedText } = req.body;

    if (!url && (!pastedText || typeof pastedText !== 'string' || !pastedText.trim())) {
      res.status(400).json({ success: false, error: 'Please enter a website URL or paste page copy.' });
      return;
    }

    let domain = 'pasted-content.com';
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

    // Entertainment Score
    const { score, verdict } = calculateEntertainmentScore(extractedText, domain);

    // Server-Side Gemini API Call with timeout guard
    let roastText = '';
    let punchlineText = '';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const prompt = `Analyze this public website copy for "${domain}". Write a witty, humorous, savage 30-60 word comedy roast about its copy, buzzwords, or marketing promises. Do NOT give advice, SEO tips, fix lists, or recommendations. Provide 1 punchy single-sentence summary punchline.
        
Website Copy:
${extractedText}`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `You are Roastie, a comedy writer who roasts public websites for entertainment. Be witty and sharp about marketing jargon and copy fluff. Never give advice, recommendations, or SEO tips. Output valid JSON with fields "roast" and "punchline".`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                roast: {
                  type: Type.STRING,
                  description: 'A 30-60 word witty comedy roast paragraph.'
                },
                punchline: {
                  type: Type.STRING,
                  description: 'A short 1-sentence punchline.'
                }
              },
              required: ['roast', 'punchline']
            }
          }
        });

        // 9-second timeout to prevent proxy 504 errors
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 9000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.roast && parsed.punchline) {
            roastText = parsed.roast;
            punchlineText = parsed.punchline;
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API call error; using fallback roast:', aiErr);
      }
    }

    // Fallback if AI call failed
    if (!roastText || !punchlineText) {
      const fallback = generateDeterministicFallbackRoast(domain, score);
      roastText = fallback.roast;
      punchlineText = fallback.punchline;
    }

    // Generate report metadata only for this real, completed analysis
    const reportId = 'RST-' + Math.floor(1000 + Math.random() * 9000);
    const createdAt = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      data: {
        domain,
        score,
        verdict,
        roast: roastText,
        punchline: punchlineText,
        reportId,
        createdAt,
        inputMethod,
        pastedTextSnippet: inputMethod === 'pasted' ? extractedText.slice(0, 100) + '...' : undefined
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
