import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST() {
  try {
    // Try a simple completion with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello and describe how you can help write emails."
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || 'No response';
    
    return NextResponse.json({ 
      result: `API Key Test Result:\n\n${content}\n\nAPI Response:\n${JSON.stringify(completion, null, 2)}` 
    });
  } catch (error: any) {
    console.error('Error testing Groq API:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to test Groq API',
        details: JSON.stringify(error, null, 2)
      },
      { status: 500 }
    );
  }
} 