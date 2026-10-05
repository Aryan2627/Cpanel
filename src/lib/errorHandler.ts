/**
 * Global error handler for Next.js API routes.
 * Wraps any route handler to catch uncaught errors and report to Sentry.
 * 
 * Usage:
 *   export const GET = withErrorHandling(async (req) => { ... });
 */
import { NextResponse } from "next/server";

// Lazy Sentry import so it doesn't crash if SENTRY_DSN is not set
async function captureError(error: unknown, context?: string) {
  try {
    const Sentry = await import("@sentry/nextjs").catch(() => null);
    if (Sentry && process.env.SENTRY_DSN) {
      Sentry.captureException(error, { tags: { context } });
    }
  } catch {}
}

export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error(`[API Error] ${request.method} ${request.url}:`, error);
      await captureError(error, request.url);
      return NextResponse.json(
        { error: error?.message || "An unexpected server error occurred." },
        { status: 500 }
      );
    }
  };
}

/**
 * Simple console-based logger with levels.
 * Falls back gracefully if Sentry is not configured.
 */
export const logger = {
  info: (msg: string, data?: object) => console.log(`[INFO] ${msg}`, data || ""),
  warn: (msg: string, data?: object) => console.warn(`[WARN] ${msg}`, data || ""),
  error: async (msg: string, error?: unknown, data?: object) => {
    console.error(`[ERROR] ${msg}`, error, data || "");
    if (error) await captureError(error, msg);
  },
};
