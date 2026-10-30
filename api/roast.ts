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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const requestId = `roast-${Date.now().toString(36)}`;

  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.',
      requestId,
    });
  }

  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain valid JSON.',
        requestId,
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: 'Request body must be a JSON object.',
      requestId,
    });
  }

  try {
    // Dynamic import is intentional: if server module initialization fails,
    // return a JSON diagnostic instead of Vercel's generic HTML 500 page.
    const { handleRoastRequest } = await import('../src/server/roastHandler');
    const result = await handleRoastRequest(body);
    return res.status(result.status).json({
      ...result.body,
      requestId,
    });
  } catch (error) {
    console.error(`[api/roast] ${requestId} invocation failed:`, error);

    return res.status(500).json({
      success: false,
      error: 'The roast service failed to start. Check the Vercel Function logs for this request ID.',
      requestId,
    });
  }
}
