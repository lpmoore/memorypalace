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

    return NextResponse.json({ enhancedAssociation });
  } catch (error: any) {
    console.error('Error enhancing imagery:', error);
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded', code: 'INSUFFICIENT_QUOTA' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to enhance imagery' },
      { status: 500 }
    );
  }
}
