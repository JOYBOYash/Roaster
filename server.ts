import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleRoastRequest } from './src/server/roastHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// API health status for the AI Studio / Express deployment.
app.get('/api/health', (_req: Request, res: Response) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  return res.status(200).json({
    ok: true,
    service: 'roastie-api',
    apiVersion: 'roast-v2',
    aiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Shared handler is also used by api/roast.ts on Vercel so deployments behave the same.
app.post('/api/roast', async (req: Request, res: Response) => {
  const result = await handleRoastRequest(req.body);
  return res.status(result.status).json(result.body);
});

// Prevent unknown API requests from falling through to the HTML app shell.
app.all('/api/*', (_req: Request, res: Response) => {
  return res.status(404).json({ success: false, error: 'API endpoint not found' });
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
