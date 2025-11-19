import { NextResponse } from 'next/server';
import { createClient } from 'pexels';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const client = createClient(process.env.PEXELS_API_KEY || '');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get('style');
  const color = searchParams.get('color');
  const query = `A ${style} palace exterior with ${color} accents`;

  try {
    // Use a random page to get different results
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const pexelsResponse = await client.photos.search({ 
      query, 
      per_page: 1,
      page: randomPage 
    });

    if ('photos' in pexelsResponse && pexelsResponse.photos.length > 0) {
      return NextResponse.json({ 
        url: pexelsResponse.photos[0].src.large,
        provider: 'pexels'
      });
    }
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
  }

  return NextResponse.json(
    { error: 'Failed to fetch image from provider' },
    { status: 500 }
  );
}
