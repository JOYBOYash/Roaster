import { handleRoastRequest } from '../src/server/roastHandler';

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  json(body: unknown): ApiResponse;
}

type Check = {
  ok: boolean;
  error?: string;
};

function errorSummary(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message.slice(0, 180)}`;
  }
  return 'Unknown error';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const key = process.env.GEMINI_API_KEY?.trim();
  const geminiKeyConfigured = Boolean(key && key !== 'MY_GEMINI_API_KEY');

  const checks: Record<string, Check> = {
    apiFunction: { ok: true },
    geminiKeyConfigured: { ok: geminiKeyConfigured },
  };

  // Static import ensures Vercel bundles the shared TypeScript handler
  // into this function instead of trying to resolve a source path at runtime.
  checks.sharedHandler = {
    ok: typeof handleRoastRequest === 'function',
    ...(typeof handleRoastRequest === 'function'
      ? {}
      : { error: 'handleRoastRequest export not found' }),
  };

  try {
    const sdk = await import('@google/genai');
    checks.geminiSdk = {
      ok: typeof sdk.GoogleGenAI === 'function' && Boolean(sdk.Type?.OBJECT),
      ...(
        typeof sdk.GoogleGenAI === 'function' && Boolean(sdk.Type?.OBJECT)
          ? {}
          : { error: 'GoogleGenAI or Type.OBJECT export is missing' }
      ),
    };
  } catch (error) {
    checks.geminiSdk = { ok: false, error: errorSummary(error) };
  }

  try {
    const sdk = await import('@google/genai');
    if (!geminiKeyConfigured) {
      checks.geminiClient = { ok: false, error: 'GEMINI_API_KEY is not configured for this deployment' };
    } else if (typeof sdk.GoogleGenAI !== 'function') {
      checks.geminiClient = { ok: false, error: 'GoogleGenAI constructor is unavailable' };
    } else {
      // Constructor validation only; this does not make a paid API request.
      new sdk.GoogleGenAI({ apiKey: key as string });
      checks.geminiClient = { ok: true };
    }
  } catch (error) {
    checks.geminiClient = { ok: false, error: errorSummary(error) };
  }

  const allReady = Object.values(checks).every((check) => check.ok);

  return res.status(200).json({
    ok: allReady,
    service: 'roastie-api',
    apiVersion: 'roast-v3-diagnostics',
    runtime: process.version,
    deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    checks,
    timestamp: new Date().toISOString(),
  });
}
