interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  json(body: unknown): ApiResponse;
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const key = process.env.GEMINI_API_KEY?.trim();
  return res.status(200).json({
    ok: true,
    service: 'roastie-api',
    aiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
}
