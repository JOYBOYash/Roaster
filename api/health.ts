import { handleRoastRequest } from './_roastHandler';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type DiagnosticCheck = {
  ok: boolean;
  error?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  const sendJson = (status: number, data: unknown) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'GET') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'GET');
    }
    return sendJson(405, { ok: false, error: 'Method not allowed. Use GET.' });
  }

  const rawKey = process.env.GEMINI_API_KEY?.trim() || (process.env as any).VITE_GEMINI_API_KEY?.trim();
  const geminiKeyConfigured = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY');

  const checks: Record<string, DiagnosticCheck> = {
    apiFunction: { ok: true },
    geminiKeyConfigured: {
      ok: geminiKeyConfigured,
      ...(geminiKeyConfigured
        ? {}
        : {
            error:
              'GEMINI_API_KEY environment variable is missing in Vercel. Go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY, and redeploy.',
          }),
    },
  };

  // Static import is required here. Vercel traces static imports into the
  // function bundle; a runtime dynamic import('./_roastHandler') is left as
  // an extensionless Node ESM path and fails at /var/task/api/_roastHandler.
  checks.sharedHandler = {
    ok: typeof handleRoastRequest === 'function',
    ...(typeof handleRoastRequest === 'function'
      ? {}
      : { error: 'handleRoastRequest export not found in _roastHandler' }),
  };

  // Check @google/genai SDK
  try {
    const sdk = await import('@google/genai');
    checks.geminiSdk = {
      ok: typeof sdk.GoogleGenAI === 'function' && Boolean(sdk.Type?.OBJECT),
      ...(typeof sdk.GoogleGenAI === 'function' && Boolean(sdk.Type?.OBJECT)
        ? {}
        : { error: 'GoogleGenAI or Type.OBJECT is missing from @google/genai export' }),
    };
  } catch (err: any) {
    checks.geminiSdk = {
      ok: false,
      error: `Failed to load @google/genai package: ${err?.message || 'Unknown error'}`,
    };
  }

  // Check Gemini client construction if key is available
  if (geminiKeyConfigured && checks.geminiSdk.ok) {
    try {
      const sdk = await import('@google/genai');
      new sdk.GoogleGenAI({ apiKey: rawKey as string });
      checks.geminiClient = { ok: true };
    } catch (err: any) {
      checks.geminiClient = {
        ok: false,
        error: `GoogleGenAI client initialization failed: ${err?.message || 'Unknown error'}`,
      };
    }
  } else if (!geminiKeyConfigured) {
    checks.geminiClient = {
      ok: false,
      error: 'Cannot initialize Gemini client because GEMINI_API_KEY is not configured.',
    };
  }

  const allReady = Object.values(checks).every((c) => c.ok);

  return sendJson(200, {
    ok: allReady,
    service: 'roastie-api',
    apiVersion: 'roast-v4-static-helper',
    runtime: process.version,
    aiConfigured: geminiKeyConfigured,
    deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    checks,
    timestamp: new Date().toISOString(),
  });
}
