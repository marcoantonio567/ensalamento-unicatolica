
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for demo purposes (clears on restart/redeploy)
// In production, use Vercel KV or Upstash
const ipMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const LIMIT = 20; // 20 requests per minute per IP

export function middleware(request: NextRequest) {
    // Fix: Access IP via headers or fallback (Vercel/Next.js specific handling)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // 1. Rate Limiting Logic
    const now = Date.now();
    const record = ipMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_SIZE) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count++;
    ipMap.set(ip, record);

    if (record.count > LIMIT) {
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 2. Origin/Referer Check (Prevent hotlinking/abuse from other sites)
    // Only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');

        // Allow requests with no origin (e.g. server-side calls, tools) IF secured otherwise, 
        // but for a public browser app, we expect referer/origin from our own domain.
        // We'll be permissive for localhost but strict for production.

        if (process.env.NODE_ENV === 'production') {
            // Change this to your actual production domain
            // If referer is present, it must match our domain
            if (referer && !referer.includes('ensalamento-unicatolica.vercel.app')) {
                return new NextResponse(
                    JSON.stringify({ error: 'Unauthorized origin' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
