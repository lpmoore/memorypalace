import { NextResponse } from 'next/server';
import { createClient } from 'pexels';

const client = createClient(process.env.PEXELS_API_KEY || '');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get('style');
  const color = searchParams.get('color');
  const query = `A ${style} palace exterior with ${color} accents`;

  try {
    const unsplashResponse = await fetch(
      `https://source.unsplash.com/800x600/?${query}&t=${Date.now()}`
    );
    if (unsplashResponse.ok) {
      return NextResponse.json({ url: unsplashResponse.url });
    }
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
  }

  try {
    const pexelsResponse = await client.photos.search({ query, per_page: 1 });
    if ('photos' in pexelsResponse && pexelsResponse.photos.length > 0) {
      return NextResponse.json({ url: pexelsResponse.photos[0].src.large });
    }
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
  }

  return NextResponse.json(
    { error: 'Failed to fetch image from all providers' },
    { status: 500 }
  );
}
