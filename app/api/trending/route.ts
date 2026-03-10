import { NextResponse } from 'next/server';
import { getTrendingCoins } from '@/lib/coingecko.actions';

export async function GET() {
  try {
    const trending = await getTrendingCoins();
    return NextResponse.json(trending);
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
