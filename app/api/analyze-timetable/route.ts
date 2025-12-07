import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert file to base64 for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      Analyze this university timetable image.
      Identify all UNIQUE subjects listed.
      Ignore time, venue, and grouping.
      
      Extract:
      1. Course Code (e.g., CSC3024)
      2. Course Name (e.g., Human Computer Interaction). Remove "(L)" or "(P)" tags.
      
      Return ONLY a raw JSON array like this:
      [{"code": "CS101", "name": "Intro to CS"}, ...]
      Do not include markdown formatting or backticks.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        // Safety parse
        let subjects = [];
        try {
            subjects = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
        }

        return NextResponse.json({ subjects });
    } catch (error) {
        console.error('AI Error:', error);
        return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }
}