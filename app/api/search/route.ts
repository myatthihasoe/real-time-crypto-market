import {NextRequest, NextResponse} from 'next/server';
import {searchCoins} from '@/lib/coingecko.actions';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q') ?? '';
    if (!q || q.trim().length === 0) {
        return NextResponse.json([], {status: 200});
    }

    try {
        const results = await searchCoins(q);
        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            {error: 'Failed to search coins'},
            {status: 502}
        );
    }
}
