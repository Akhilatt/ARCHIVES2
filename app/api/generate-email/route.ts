import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { context, tone, numVariations = 3, wordCount } = await request.json();

    if (!context || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Always generate exactly 3 versions
    const variations = 3;
    
    // Build the length instruction if wordCount is provided
    let lengthInstruction = '';
    if (wordCount && !isNaN(Number(wordCount))) {
      lengthInstruction = `Each email should be approximately ${wordCount} words in length. `;
    }

    const prompt = `Write exactly ${variations} different versions of a ${tone} email about the following: ${context}. 
    Each email version should maintain the exact same ${tone} tone throughout. Do not vary the tone between versions.
    All emails should be well-structured and clear, but vary in structure, wording, and approach.
    ${lengthInstruction}Include a proper greeting and closing in each version.
    
    Important formatting instructions:
    1. Clearly separate each version with "VERSION X:" (where X is the version number 1-3).
    2. Do not include any explanatory text or comments before or after the emails.
    3. Do not include any introduction or conclusion text.
    4. Each email should be complete and ready to use.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional email writing assistant. Generate exactly 3 clear, concise, and well-structured emails with different structures and approaches, but always maintaining the exact same tone that the user selected. ${lengthInstruction}Never mix tones. Include only the email content without explanations or comments.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 1500,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from Groq API');
    }

    const fullResponse = completion.choices[0]?.message?.content;
    
    if (!fullResponse) {
      throw new Error('Empty response from Groq API');
    }

    // Parse the response into multiple emails by splitting on version markers
    let emails: string[] = [];
    
    const versionRegex = /VERSION\s*\d+\s*:/gi;
    if (versionRegex.test(fullResponse)) {
      // If the response contains version markers, split by them
      emails = fullResponse.split(versionRegex)
        .filter(email => email.trim().length > 0)
        .map(email => email.trim());
        
      // Ensure we have exactly 3 emails
      if (emails.length > 3) {
        emails = emails.slice(0, 3); // Keep only the first 3
      } else if (emails.length < 3) {
        // If we have fewer than 3, repeat the last one to fill
        const lastEmail = emails[emails.length - 1] || '';
        while (emails.length < 3) {
          emails.push(lastEmail);
        }
      }
    } else {
      // If no version markers, try to split the content into 3 roughly equal parts
      const parts = fullResponse.split('\n\n\n');
      if (parts.length >= 3) {
        emails = [parts[0], parts[1], parts[2]];
      } else {
        // Just use the whole response and duplicate it
        emails = [fullResponse, fullResponse, fullResponse];
      }
    }

    // Remove any "VERSION X:" text that might be within the emails
    emails = emails.map(email => email.replace(/VERSION\s*\d+\s*:/gi, '').trim());

    // For backward compatibility
    return NextResponse.json({ 
      emails,
      email: emails[0] 
    });
  } catch (error: any) {
    console.error('Error generating emails:', error);
    
    const errorMessage = error.message || 'Failed to generate emails';
    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
} 