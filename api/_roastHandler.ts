interface RoastRequestBody {
  url?: unknown;
  pastedText?: unknown;
  mode?: unknown;
  musicText?: unknown;
  roastStyleId?: unknown;
}

interface RoastResponseBody {
  success: boolean;
  data?: {
    domain: string;
    headline: string;
    roast: string;
    inputMethod: 'url' | 'pasted' | 'music';
    roastStyleId: string;
  };
  error?: string;
  canPasteFallback?: boolean;
}

export interface RoastHandlerResult {
  status: number;
  body: RoastResponseBody;
}

const ROAST_STYLE_INSTRUCTIONS: Record<string, string> = {
  'roast-master': 'Use a precise setup, escalating sarcasm, an unexpected comparison, and one memorable final punchline. Keep it original and tightly edited.',
  'rapid-fire': 'Use compact, rapid-fire one-liners and quick reversals. Cut every setup word that is not needed.',
  'deadpan': 'Deliver the joke with calm, dry understatement. Make the contrast do the work; avoid shouting or explaining the punchline.',
  'absurdist': 'Use one surprising, vivid comparison and let the logic escalate into playful absurdity without inventing facts.',
  'storyteller': 'Use a conversational setup followed by a sharp, surprising payoff. Keep the miniature story short and grounded in the input.',
  'crowd-work': 'Address the input playfully and directly, as if riffing with a friendly audience. Be teasing, specific, and never cruel about sensitive traits.',
};

function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower === '::1' ||
    lower === '0.0.0.0' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('ff') ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.')
  ) {
    return true;
  }

  const ipV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipV4);
  if (match) {
    const octets = match.slice(1).map((value) => Number(value));
    if (octets.some((octet) => octet < 0 || octet > 255)) return true;
    const [a, b] = octets;
    if (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51) ||
      (a === 203 && b === 0) ||
      a >= 224
    ) return true;
  }
  return false;
}

async function fetchAndExtractWebsiteContent(targetUrl: string): Promise<{ title: string; metaDesc: string; headings: string[]; text: string; domain: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(/^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are supported');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('URLs containing embedded credentials are not supported');
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
        'User-Agent': 'Mozilla/5.0 (compatible; Roastie/1.0; +https://roastie.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'manual',
    });

    clearTimeout(timeoutId);

    // Do not follow redirects blindly: validate every new destination before fetching.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Target returned a redirect without a destination');
      const redirectedUrl = new URL(location, parsedUrl);
      if (redirectedUrl.protocol !== 'http:' && redirectedUrl.protocol !== 'https:') {
        throw new Error('Target redirected to an unsupported protocol');
      }
      if (redirectedUrl.username || redirectedUrl.password || isPrivateHost(redirectedUrl.hostname)) {
        throw new Error('Target redirected to a private or unsupported destination');
      }
      throw new Error('Target redirected. Enter the final public URL directly.');
    }

    if (!response.ok) {
      throw new Error(`Target returned HTTP status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('Target destination did not return HTML content');
    }

    const html = (await response.text()).slice(0, 500000);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const metaMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';
    const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
    const headings = headingMatches
      .map((match) => match[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(0, 10);

    const bodyClean = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title,
      metaDesc,
      headings,
      text: bodyClean.slice(0, 2500),
      domain: parsedUrl.hostname.replace(/^www\./, ''),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Target website timed out after 6 seconds');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to retrieve website content');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function handleRoastRequest(body: unknown): Promise<RoastHandlerResult> {
  try {
    const request = (body && typeof body === 'object' ? body : {}) as RoastRequestBody;
    const { url, pastedText, mode, musicText, roastStyleId: requestedStyleId } = request;
    const isMusicMode = mode === 'music';
    const roastStyleId = typeof requestedStyleId === 'string' && Object.prototype.hasOwnProperty.call(ROAST_STYLE_INSTRUCTIONS, requestedStyleId)
      ? requestedStyleId
      : 'roast-master';
    const roastStyleInstruction = ROAST_STYLE_INSTRUCTIONS[roastStyleId];

    if (isMusicMode) {
      if (typeof musicText !== 'string' || !musicText.trim()) {
        return { status: 400, body: { success: false, error: 'Spotify did not return any tracks. Connect again and retry.' } };
      }
      const musicItems = musicText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      if (musicItems.length < 3) {
        return { status: 400, body: { success: false, error: 'At least three tracks are needed for a music roast.' } };
      }
      if (musicItems.length > 20) {
        return { status: 400, body: { success: false, error: 'Keep it to 20 tracks or artists per roast.' } };
      }
    } else if (!(typeof url === 'string' && url.trim()) &&
      !(typeof pastedText === 'string' && pastedText.trim())) {
      return { status: 400, body: { success: false, error: 'Please enter a website URL or paste page copy.' } };
    }

    let domain = isMusicMode ? 'Your music taste' : 'Pasted website copy';
    let extractedText = '';
    let inputMethod: 'url' | 'pasted' | 'music' = isMusicMode ? 'music' : 'pasted';

    if (isMusicMode) {
      const musicItems = (musicText as string).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      extractedText = musicItems.join('\n').slice(0, 5000);
    } else if (typeof url === 'string' && url.trim()) {
      inputMethod = 'url';
      const rawUrl = url.trim();
      try {
        const pageData = await fetchAndExtractWebsiteContent(rawUrl);
        domain = pageData.domain;
        extractedText = `Title: ${pageData.title}\nMeta Description: ${pageData.metaDesc}\nHeadings: ${pageData.headings.join(' | ')}\nContent: ${pageData.text}`;
      } catch (fetchError) {
        return {
          status: 200,
          body: {
            success: false,
            canPasteFallback: true,
            error: `Could not retrieve ${rawUrl}: ${fetchError instanceof Error ? fetchError.message : 'Connection failed or blocked'}. You can paste the website copy directly below.`,
          },
        };
      }
    } else {
      inputMethod = 'pasted';
      extractedText = (pastedText as string).trim().slice(0, 3000);
      domain = 'pasted-text';
    }

    const apiKey = (process.env.GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY)?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.error('GEMINI_API_KEY is not configured.');
      return {
        status: 503,
        body: {
          success: false,
          error: 'Gemini API key is not configured in Vercel environment variables. Add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.'
        }
      };
    }

    const sourceLabel = inputMethod === 'url' ? domain : inputMethod === 'music' ? 'the submitted Spotify music list' : 'the pasted website copy';
    const prompt = inputMethod === 'music'
      ? `Roast the person's music taste using only the artist and track names in this list.

Write:
- headline: 3 to 7 words, with a sharp, specific hook.
- roast: one sarcastic, punchy paragraph of 20 to 32 words.

Comic direction:
${roastStyleInstruction}

Rules:
- Be noticeably sarcastic, quick, vivid, and funny. Aim for one strong laugh, not a polite observation.
- Use one original comparison or a sharp reversal where it fits. Do not pad the joke.
- Joke about the actual combination of listed songs and artists.
- Do not invent songs, genres, listening history, personality traits, age, identity, relationships, or life events.
- Do not infer sensitive personal traits.
- No scores, rankings, verdict labels, advice, or a second summary.
- Never mention a preset or explain the joke.

Submitted Spotify tracks:
${extractedText}`
      : `Write one original, highly sarcastic roast based only on the supplied website text for ${sourceLabel}.

Write:
- headline: 3 to 7 words, a sharp hook that does not repeat the roast.
- roast: one punchy paragraph of 20 to 32 words.

Comic direction:
${roastStyleInstruction}

Rules:
- Be specific, sarcastic, and properly funny. Aim for a memorable punchline instead of a generic insult.
- Use one vivid comparison or reversal when useful; remove filler and repeated ideas.
- Use only details present in the supplied text.
- Never invent features, pricing, customers, metrics, visual design, bugs, performance, SEO results, or claims about the site.
- Do not imply the site was tested. This is a roast of the supplied copy only.
- If the source has too little detail, roast the vagueness itself.
- No scores, rankings, verdict labels, advice, recommendations, or second summary.
- Never mention a preset or explain the joke.

Source text:
${extractedText}`;

    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const generation = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: inputMethod === 'music'
            ? 'You are Roastie, a sarcastic original roast writer. Deliver a specific, genuinely funny punchline. Never invent songs or infer sensitive personal traits. Return JSON with exactly headline and roast.'
            : 'You are Roastie, a sarcastic original roast writer. Deliver a specific, genuinely funny punchline without inventing website facts. Return JSON with exactly headline and roast.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING, description: 'A short, specific 3-7 word headline.' },
              roast: { type: Type.STRING, description: 'One original, punchy 20-32 word roast based on supplied content.' },
            },
            required: ['headline', 'roast'],
          },
        },
      });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out after 25 seconds')), 25000)
      );
      const response = await Promise.race([generation, timeout]);
      if (!response?.text) throw new Error('AI returned an empty response');

      const parsed = JSON.parse(response.text.trim()) as { headline?: unknown; roast?: unknown };
      if (
        typeof parsed.headline !== 'string' || !parsed.headline.trim() ||
        typeof parsed.roast !== 'string' || !parsed.roast.trim()
      ) {
        throw new Error('AI returned an incomplete roast');
      }

      return {
        status: 200,
        body: {
          success: true,
          data: {
            domain,
            headline: parsed.headline.trim().replace(/\s+/g, ' ').slice(0, 80),
            roast: parsed.roast.trim().replace(/\s+/g, ' ').slice(0, 320),
            inputMethod,
            roastStyleId,
          },
        },
      };
    } catch (error: any) {
      console.error('Gemini roast generation failed:', error);
      const errorMsg = error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key not valid')
        ? 'Invalid GEMINI_API_KEY. Please verify your Gemini API key in Vercel Project Settings > Environment Variables.'
        : 'Roast generation failed. No roast was created. Please try again.';
      return { status: 503, body: { success: false, error: errorMsg } };
    }
  } catch (error) {
    console.error('Error in roast handler:', error);
    return { status: 500, body: { success: false, error: 'An unexpected error occurred while roasting. Please try again.' } };
  }
}
