import { NextResponse } from 'next/server';
import { fetchSchedule } from '@/lib/schedule';

export const dynamic = 'force-dynamic'; // Ensure this runs on every request

export async function GET() {
    try {
        const schedule = await fetchSchedule();
        return NextResponse.json(schedule);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}
