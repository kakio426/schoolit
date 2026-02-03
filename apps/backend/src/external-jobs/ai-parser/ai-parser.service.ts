
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiParserService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        }
    }

    async parseJobPost(text: string): Promise<any> {
        if (!this.model) {
            // Fallback or explicit error if not configured
            throw new Error('Gemini API not configured');
        }

        const prompt = `
    Extract job details from the text below and return ONLY valid JSON.
    Fields to extract: 
    - schoolName (string)
    - subject (string, e.g. Math, English)
    - salary (string)
    - closingDate (YYYY-MM-DD format if possible)

    Text:
    """
    ${text}
    """
    `;

        const result = await this.model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse AI response:', responseText);
            throw new Error('Failed to parse AI extracted JSON');
        }
    }
}
