import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleRoastRequest } from './_roastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = `roast-${Date.now().toString(36)}`;
  let stage = 'method-check';

  // Defensive header setting
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Roastie-Request-Id', requestId);
  }

  const sendJson = (status: number, data: unknown) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    // Fallback for raw Node ServerResponse if Vercel helpers are bypassed
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'POST');
    }
    return sendJson(405, {
      success: false,
      error: 'Method not allowed. Use POST.',
      requestId,
      code: 'METHOD_NOT_ALLOWED',
      stage,
    });
  }

  stage = 'body-validation';
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(400, {
        success: false,
        error: 'Request body must contain valid JSON.',
        requestId,
        code: 'INVALID_JSON',
        stage,
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return sendJson(400, {
      success: false,
      error: 'Request body must be a JSON object.',
      requestId,
      code: 'INVALID_BODY',
      stage,
    });
  }

  try {
    stage = 'handler-execution';
    const result = await handleRoastRequest(body);
    return sendJson(result.status, {
      ...result.body,
      requestId,
      stage: 'completed',
    });
  } catch (error: any) {
    const errorName = error?.name || 'UnknownError';
    const errorMessage = error?.message || 'Server error';
    console.error(`[api/roast] requestId=${requestId} stage=${stage} errorName=${errorName}`, error);

    return sendJson(500, {
      success: false,
      error: `Roast generation failed: ${errorMessage}`,
      requestId,
      code: 'ROAST_API_INVOCATION_FAILURE',
      stage,
      errorName,
    });
  }
}
