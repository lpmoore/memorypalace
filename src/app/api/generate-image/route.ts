import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    try {
      // Use Pollinations.ai (Free)
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 1000000);
      const originalImageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${randomSeed}&model=flux`;
      
      let imageUrl = '';
      
      if (originalImageUrl) {
        // Download the image
        const imageRes = await fetch(originalImageUrl);
        if (!imageRes.ok) throw new Error('Failed to download image from OpenAI');
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save to local filesystem
        const fs = await import('fs');
        const path = await import('path');
        
        const fileName = `${crypto.randomUUID()}.png`;
        const publicDir = path.join(process.cwd(), 'public', 'generated-images');
        
        // Ensure directory exists
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);
        
        // Set the URL to the local path
        imageUrl = `/generated-images/${fileName}`;
      }

      return NextResponse.json({ imageUrl });

    } catch (imageError: any) {
      console.error('Error generating image:', imageError);
      throw imageError;
    }
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style') || 'modern';
    const color = searchParams.get('color') || 'blue';

    const prompt = `A ${style} style memory palace room with ${color} color tones. Architectural photography, high quality, 8k, interior design.`;

    // Use Pollinations.ai (Free)
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);
    const originalImageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${randomSeed}&model=flux`;
    
    let imageUrl = '';
    
    if (originalImageUrl) {
      // Download the image
      const imageRes = await fetch(originalImageUrl);
      if (!imageRes.ok) throw new Error('Failed to download image from Pollinations');
      
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save to local filesystem
      const fs = await import('fs');
      const path = await import('path');
      
      const fileName = `${crypto.randomUUID()}.png`;
      const publicDir = path.join(process.cwd(), 'public', 'generated-images');
      
      // Ensure directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const filePath = path.join(publicDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      // Set the URL to the local path
      imageUrl = `/generated-images/${fileName}`;
    }

    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error('Error generating palace image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
