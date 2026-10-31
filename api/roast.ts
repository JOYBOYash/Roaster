import { handleRoastRequest } from '../src/server/roastHandler';

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  json(body: unknown): ApiResponse;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

function getErrorName(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error && typeof error.name === 'string') {
    return error.name.slice(0, 80);
  }
  return 'UnknownError';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const requestId = `roast-${Date.now().toString(36)}`;
  let stage = 'method-check';

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Roastie-Request-Id', requestId);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.',
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
      return res.status(400).json({
        success: false,
        error: 'Request body must contain valid JSON.',
        requestId,
        code: 'INVALID_JSON',
        stage,
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: 'Request body must be a JSON object.',
      requestId,
      code: 'INVALID_BODY',
      stage,
    });
  }

  try {
    // This must remain a static import: Vercel's bundler needs to include the
    // TypeScript handler in the serverless function. A runtime dynamic import
    // leaves an extensionless path that Node ESM cannot resolve in /var/task.
    stage = 'shared-handler-execution';
    const result = await handleRoastRequest(body);

    if (result.status >= 500) {
      return res.status(result.status).json({
        ...result.body,
        requestId,
        code: 'ROAST_HANDLER_FAILURE',
        stage,
      });
    }

    return res.status(result.status).json({
      ...result.body,
      requestId,
      stage: 'completed',
    });
  } catch (error) {
    const errorName = getErrorName(error);
    console.error(`[api/roast] requestId=${requestId} stage=${stage} errorName=${errorName}`, error);

    return res.status(500).json({
      success: false,
      error: 'The roast API failed before it could complete. Use the reference ID and stage when checking Vercel logs.',
      requestId,
      code: 'ROAST_API_INVOCATION_FAILURE',
      stage,
      errorName,
    });
  }
}
