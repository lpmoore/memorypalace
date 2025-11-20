import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { item, association } = await request.json();

    if (!item || !association) {
      return NextResponse.json(
        { error: 'Item and association are required' },
        { status: 400 }
      );
    }

    const prompt = `
    You are a memory palace expert. Your goal is to take a simple association for an item and transform it into something vivid, exaggerated, bizarre, and memorable.
    
    Item: ${item}
    Original Association: ${association}
    
    Create a single, short, punchy sentence that describes a vivid image involving the item and the association. Make it weird, gross, funny, or violent to make it stick. Do not include any preamble or explanation. Just the sentence.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const enhancedAssociation = completion.choices[0].message.content?.trim();

    // Generate image based on the enhanced association
    let imageUrl = '';
    if (enhancedAssociation) {
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `A vivid, surreal, and memorable memory palace image: ${enhancedAssociation}. High quality, detailed, artistic style.`,
          n: 1,
          size: "1024x1024",
        });
        imageUrl = imageResponse.data[0].url || '';
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        // We don't fail the whole request if image generation fails, just return the text
      }
    }

    return NextResponse.json({ enhancedAssociation, imageUrl });
  } catch (error) {
    console.error('Error enhancing imagery:', error);
    return NextResponse.json(
      { error: 'Failed to enhance imagery' },
      { status: 500 }
    );
  }
}
