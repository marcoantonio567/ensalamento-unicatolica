import { NextResponse } from 'next/server';
import { fetchSchedule } from '@/lib/schedule';

// 1. In-Memory Cache (Global variable persists across warm lambda invocations)
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes internal cache

export async function GET() {
    try {
        const now = Date.now();

        // 2. Check Internal Cache (Fastest)
        if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
            console.log('Serving from internal memory cache');
            return NextResponse.json(cachedData, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                    'X-Cache': 'HIT-MEMORY'
                }
            });
        }

        console.log('Fetching fresh data from source...');
        const schedule = await fetchSchedule();

        // Update Cache
        if (schedule && schedule.length > 0) {
            cachedData = schedule;
            lastFetchTime = now;
        }

        // 3. Return with Edge Cache Headers (CDN Protection)
        // s-maxage=300: Vercel Edge Cache holds it for 5min (Backends sleeps)
        // stale-while-revalidate=600: If expired, serve old data for 10 more min while fetching new in background
        return NextResponse.json(schedule, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'X-Cache': 'MISS'
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        // If error, try to serve stale cache as failover
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: { 'X-Status': 'Fallback' }
            });
        }
        return NextResponse.json(
            { error: 'Service temporarily unavailable. Please try again later.' }, // Generic error to not leak info
            { status: 503 }
        );
    }
}
