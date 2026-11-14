import type { Request, Response } from 'express';
import { createApiExpressApp } from './serverApp';

let cachedApp: ReturnType<typeof createApiExpressApp> | null = null;
let bootError: Error | null = null;

function getApp() {
  if (cachedApp) return cachedApp;
  if (bootError) throw bootError;
  try {
    cachedApp = createApiExpressApp();
    return cachedApp;
  } catch (err: any) {
    bootError = err instanceof Error ? err : new Error(String(err));
    throw bootError;
  }
}

export default function vercelHandler(req: Request, res: Response) {
  try {
    const app = getApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Boot Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        code: 'VERCEL_HANDLER_INIT_ERROR',
        message: err?.message || 'فشل تشغيل دالة الخادم على Vercel',
      });
    }
  }
}
