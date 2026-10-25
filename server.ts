import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Helper to check for private or unsafe IP address
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
      throw new Error(`Website returned HTTP status ${response.status}`);
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

    // Clean body text (strip scripts, styles, nav, footer, header)
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
      throw new Error('Website request timed out after 6 seconds');
    }
    throw new Error(err.message || 'Failed to fetch website content');
  }
}

// Deterministic humor score calculation
function calculateEntertainmentScore(text: string, domain: string): { score: number; verdict: string } {
  const combined = (text + ' ' + domain).toLowerCase();
  
  // Buzzword frequency penalty/boost
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

  // Hash seed for domain uniqueness
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }

  // Calculate score (range 12 - 94 out of 100)
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

// Fallback roast generator when AI provider is unavailable
function generateDeterministicFallbackRoast(domain: string, score: number, verdict: string): { roast: string; punchline: string } {
  const fallbacks = [
    {
      roast: `A website so generic it reads like it was written by an AI that was fed a steady diet of LinkedIn influencer posts and corporate mission statements. You promised the world in the header and delivered vague promises in the body.`,
      punchline: `If buzzwords were currency, you'd be a billionaire; instead, you just have a high bounce rate.`
    },
    {
      roast: `This site tries so hard to sound like a Fortune 500 company that it forgot to explain what it actually builds. Every sentence is a masterclass in saying nothing with maximum confidence.`,
      punchline: `Built for investors who read headers and users who never return.`
    },
    {
      roast: `A classic specimen of modern web design: floating shapes, zero clarity, and copy that promises to "democratize" something that was already free. It's not a landing page; it's a digital cry for help.`,
      punchline: `More gradient effects than actual customers.`
    }
  ];

  const index = Math.abs(domain.length + score) % fallbacks.length;
  return fallbacks[index];
}

interface TrendingItem {
  domain: string;
  score: number;
  verdict: string;
  roast: string;
  punchline: string;
  reportId: string;
  roastCount: number;
  category?: string;
  createdAt: string;
  inputMethod: 'url' | 'pasted';
}

const trendingRoasts: TrendingItem[] = [
  {
    domain: 'synergy-ai-cloud.io',
    score: 23,
    verdict: 'CERTIFIED INTERNET CRIME',
    roast: 'You managed to fit "paradigm shift", "seamless synergy", and "AI-driven empowerment" into a single hero paragraph without once explaining what your app actually does. It reads like a tech buzzword generator threw up on a dark background.',
    punchline: "Your website doesn't sell software; it sells corporate hallucinations.",
    reportId: 'RST-7702',
    roastCount: 512,
    category: 'AI Fluff',
    createdAt: '2026-10-24',
    inputMethod: 'url',
  },
  {
    domain: 'producthunt.com',
    score: 31,
    verdict: 'TERMINALLY UNINSPIRED',
    roast: 'A daily parade of AI wrappers, Discord bots with Stripe accounts, and founders desperately begging their college roommates for upvotes at 12:01 AM PST. It is a digital swap meet of unfinished SaaS MVPs.',
    punchline: "Silicon Valley's annual science fair, but every single project is ChatGPT in a trenchcoat.",
    reportId: 'RST-8109',
    roastCount: 389,
    category: 'Startup Launch',
    createdAt: '2026-10-23',
    inputMethod: 'url',
  },
  {
    domain: 'notion.so',
    score: 48,
    verdict: 'SAAS CLONE #4812',
    roast: 'Started as a simple notes app and morphed into an all-in-one productivity hydra where knowledge workers spend 40 hours building aesthetic Kanban dashboards to avoid doing actual work.',
    punchline: 'Democratizing relational databases for grocery lists and existential dread.',
    reportId: 'RST-5421',
    roastCount: 264,
    category: 'Productivity',
    createdAt: '2026-10-22',
    inputMethod: 'url',
  },
  {
    domain: 'linear.app',
    score: 74,
    verdict: 'MILDLY COOKED',
    roast: 'A dark mode shrine to issue tracking where every engineer pretends keyboard shortcuts will fix organizational dysfunction. Clean design, but no Jira alternative can save your Q3 sprint.',
    punchline: 'The fastest way to file a bug ticket you will never fix.',
    reportId: 'RST-9032',
    roastCount: 195,
    category: 'Dev Tools',
    createdAt: '2026-10-21',
    inputMethod: 'url',
  },
  {
    domain: 'craigslist.org',
    score: 89,
    verdict: 'SURPRISINGLY TOLERABLE',
    roast: 'Refusing to change HTML since 1995 while billion-dollar web design studios go bankrupt around you is the ultimate internet power move. Zero CSS animations, 100% utility.',
    punchline: 'The only site where raw blue hyperlinks command respect.',
    reportId: 'RST-1995',
    roastCount: 430,
    category: 'Classifieds',
    createdAt: '2026-10-20',
    inputMethod: 'url',
  },
  {
    domain: 'future-fintech-vault.com',
    score: 38,
    verdict: 'TERMINALLY UNINSPIRED',
    roast: 'With three overlapping gradient circles, 47 floating icons of lock padlocks, and a headline promising to "democratize wealth creation", your landing page feels less like a bank and more like an elaborate exit scheme.',
    punchline: 'Democratizing wealth by spending all yours on 3D pastel floating spheres.',
    reportId: 'RST-9104',
    roastCount: 178,
    category: 'Fintech',
    createdAt: '2026-10-19',
    inputMethod: 'url',
  }
];

// API endpoint to get trending roasted websites
app.get('/api/trending', (_req: Request, res: Response) => {
  const sorted = [...trendingRoasts].sort((a, b) => b.roastCount - a.roastCount);
  res.json({ success: true, data: sorted });
});

// API endpoint for website roasting
app.post('/api/roast', async (req: Request, res: Response) => {
  try {
    const { url, pastedText } = req.body;

    if (!url && (!pastedText || typeof pastedText !== 'string' || !pastedText.trim())) {
      res.status(400).json({ success: false, error: 'Please enter a valid website URL or paste page copy.' });
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
        // If URL fetch failed, prompt the user with clean paste copy fallback
        res.status(200).json({
          success: false,
          canPasteFallback: true,
          error: `Could not inspect ${rawUrl}: ${fetchError.message || 'Access blocked or timed out'}. You can paste the site copy directly below!`
        });
        return;
      }
    } else {
      inputMethod = 'pasted';
      extractedText = pastedText.trim().slice(0, 3000);
      domain = 'custom-copy.site';
    }

    // Deterministic Score
    const { score, verdict } = calculateEntertainmentScore(extractedText, domain);

    // Gemini API call (Server-side only)
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

        const prompt = `Analyze this public website content for domain "${domain}". Write a witty, hilarious, savage, 30-60 word comedy roast about its copy, buzzwords, or marketing promises. Do NOT give advice, fixes, recommendations, or SEO tips. Provide 1 punchy single-sentence summary punchline.
        
Website Content:
${extractedText}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `You are Roastie, a world-class comedy writer who roasts public websites for entertainment. Be funny, clever, and savage about copy and marketing fluff, but never violate privacy or harass individuals. Never give advice, SEO tips, fix lists, or recommendations. Output valid JSON with fields "roast" and "punchline".`,
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
                  description: 'A short 1-sentence killer punchline.'
                }
              },
              required: ['roast', 'punchline']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.roast && parsed.punchline) {
            roastText = parsed.roast;
            punchlineText = parsed.punchline;
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API call warning/fallback:', aiErr);
      }
    }

    // If Gemini was not configured or call failed, use deterministic fallback
    if (!roastText || !punchlineText) {
      const fallback = generateDeterministicFallbackRoast(domain, score, verdict);
      roastText = fallback.roast;
      punchlineText = fallback.punchline;
    }

    const reportId = 'RST-' + Math.floor(1000 + Math.random() * 9000);
    const createdAt = new Date().toISOString().split('T')[0];

    // Update trending roasts list
    if (domain && domain !== 'pasted-content.com' && domain !== 'custom-copy.site') {
      const existing = trendingRoasts.find(t => t.domain.toLowerCase() === domain.toLowerCase());
      if (existing) {
        existing.roastCount += 1;
        existing.score = score;
        existing.verdict = verdict;
        existing.roast = roastText;
        existing.punchline = punchlineText;
        existing.reportId = reportId;
        existing.createdAt = createdAt;
      } else {
        trendingRoasts.unshift({
          domain,
          score,
          verdict,
          roast: roastText,
          punchline: punchlineText,
          reportId,
          roastCount: 1,
          category: 'Community Roast',
          createdAt,
          inputMethod
        });
        if (trendingRoasts.length > 50) trendingRoasts.pop();
      }
    }

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
    console.error('Error handling /api/roast:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while roasting the website. Please try again.'
    });
  }
});

// API endpoint for Roast Battle
app.post('/api/battle', async (req: Request, res: Response) => {
  try {
    const { urlA, urlB } = req.body;

    if (!urlA || typeof urlA !== 'string' || !urlA.trim() ||
        !urlB || typeof urlB !== 'string' || !urlB.trim()) {
      res.status(400).json({ success: false, error: 'Please enter valid URLs for both websites in the battle.' });
      return;
    }

    let cleanA = urlA.trim();
    if (!cleanA.startsWith('http://') && !cleanA.startsWith('https://')) cleanA = 'https://' + cleanA;

    let cleanB = urlB.trim();
    if (!cleanB.startsWith('http://') && !cleanB.startsWith('https://')) cleanB = 'https://' + cleanB;

    let pageA: any;
    try {
      pageA = await fetchAndExtractWebsiteContent(cleanA);
    } catch (e: any) {
      res.status(200).json({ success: false, error: `Failed to inspect Corner 1 (${cleanA}): ${e.message}` });
      return;
    }

    let pageB: any;
    try {
      pageB = await fetchAndExtractWebsiteContent(cleanB);
    } catch (e: any) {
      res.status(200).json({ success: false, error: `Failed to inspect Corner 2 (${cleanB}): ${e.message}` });
      return;
    }

    const scoreDataA = calculateEntertainmentScore(pageA.text, pageA.domain);
    const scoreDataB = calculateEntertainmentScore(pageB.text, pageB.domain);

    let loserDomain = pageA.domain;
    let winnerDomain = pageB.domain;
    let comparativeRoast = '';
    let punchline = '';
    let siteAVerdict = scoreDataA.verdict;
    let siteBVerdict = scoreDataB.verdict;

    // Pick initial worse site based on score (lower score = worse / more criminal)
    if (scoreDataA.score < scoreDataB.score) {
      loserDomain = pageA.domain;
      winnerDomain = pageB.domain;
    } else {
      loserDomain = pageB.domain;
      winnerDomain = pageA.domain;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `ROAST BATTLE: Two websites are competing head-to-head.
Corner 1: "${pageA.domain}"
Title: ${pageA.title}
Headings: ${pageA.headings.join(' | ')}
Text snippet: ${pageA.text.slice(0, 1000)}

Corner 2: "${pageB.domain}"
Title: ${pageB.title}
Headings: ${pageB.headings.join(' | ')}
Text snippet: ${pageB.text.slice(0, 1000)}

Analyze both websites' copy, tone, and marketing promises.
Decide which website is the WORSE offender (more pretentious, buzzword-laden, or useless).
Rules:
- "loserDomain" MUST be either "${pageA.domain}" or "${pageB.domain}" (the worse one).
- "winnerDomain" MUST be the other domain that was comparatively less awful.
- "comparativeRoast": 50-80 words witty comparative comedy comparing both and stating clearly why the loser takes the crown of shame.
- "punchline": 1 killer comparative punchline.
- "siteAVerdict": 2-4 word punchy verdict label for Corner 1.
- "siteBVerdict": 2-4 word punchy verdict label for Corner 2.
Output valid JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are Roastie in Roast Battle mode. You referee roast battles between two public websites, mercilessly comparing their fluff and naming the absolute worse website.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                loserDomain: { type: Type.STRING },
                winnerDomain: { type: Type.STRING },
                comparativeRoast: { type: Type.STRING },
                punchline: { type: Type.STRING },
                siteAVerdict: { type: Type.STRING },
                siteBVerdict: { type: Type.STRING },
              },
              required: ['loserDomain', 'winnerDomain', 'comparativeRoast', 'punchline', 'siteAVerdict', 'siteBVerdict']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.loserDomain && parsed.comparativeRoast && parsed.punchline) {
            loserDomain = parsed.loserDomain;
            winnerDomain = parsed.winnerDomain || (loserDomain === pageA.domain ? pageB.domain : pageA.domain);
            comparativeRoast = parsed.comparativeRoast;
            punchline = parsed.punchline;
            if (parsed.siteAVerdict) siteAVerdict = parsed.siteAVerdict;
            if (parsed.siteBVerdict) siteBVerdict = parsed.siteBVerdict;
          }
        }
      } catch (aiErr) {
        console.warn('Gemini Battle API call error, using fallback:', aiErr);
      }
    }

    if (!comparativeRoast || !punchline) {
      comparativeRoast = `In this battle of digital mediocrity, ${loserDomain} takes the crown of shame. While ${winnerDomain} at least manages to convey some semblance of purpose between its marketing adjectives, ${loserDomain} is an unadulterated masterclass in corporate gaslighting.`;
      punchline = `${winnerDomain} barely survives, but ${loserDomain} is a certified digital tragedy.`;
    }

    const battleId = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
    const createdAt = new Date().toISOString().split('T')[0];

    // Update trending counts for both
    [pageA.domain, pageB.domain].forEach((d) => {
      const existing = trendingRoasts.find(t => t.domain.toLowerCase() === d.toLowerCase());
      if (existing) {
        existing.roastCount += 1;
      } else {
        trendingRoasts.unshift({
          domain: d,
          score: d === pageA.domain ? scoreDataA.score : scoreDataB.score,
          verdict: d === pageA.domain ? siteAVerdict : siteBVerdict,
          roast: comparativeRoast,
          punchline,
          reportId: battleId,
          roastCount: 1,
          category: 'Battle Contestant',
          createdAt,
          inputMethod: 'url'
        });
      }
    });

    res.json({
      success: true,
      data: {
        id: battleId,
        siteA: {
          domain: pageA.domain,
          score: scoreDataA.score,
          verdict: siteAVerdict,
          title: pageA.title
        },
        siteB: {
          domain: pageB.domain,
          score: scoreDataB.score,
          verdict: siteBVerdict,
          title: pageB.title
        },
        loserDomain,
        winnerDomain,
        comparativeRoast,
        punchline,
        createdAt
      }
    });
  } catch (err: any) {
    console.error('Error handling /api/battle:', err);
    res.status(500).json({ success: false, error: 'Failed to complete roast battle. Please try again.' });
  }
});

// Setup Vite or Static File Server
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
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
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🔥 Roastie Server running at http://localhost:${PORT}`);
  });
}

setupServer();
