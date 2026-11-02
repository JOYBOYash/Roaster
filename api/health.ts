import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  // Keep liveness independent of the roast handler and Gemini SDK.
  // A health check must not import the code whose health it is checking.
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  const aiConfigured = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY');

  return res.status(200).json({
    ok: true,
    service: 'roastie-api',
    apiVersion: 'roast-v5-lightweight-health',
    aiConfigured,
    deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    timestamp: new Date().toISOString(),
  });
}
