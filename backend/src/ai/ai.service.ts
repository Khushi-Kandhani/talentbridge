import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GenerateJobDescriptionDto } from './dto/generate-job-description.dto';

export type JobDescriptionResult = {
  roleSummary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  whatWeOffer: string[];
  source: 'ai' | 'fallback';
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private buildPrompt(dto: GenerateJobDescriptionDto): string {
    return `You are an expert technical recruiter. Write a complete, bias-aware, gender-neutral job description as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{
  "roleSummary": "string, 2-3 sentences",
  "responsibilities": ["5 to 7 bullet strings"],
  "requiredQualifications": ["bullet strings"],
  "preferredQualifications": ["bullet strings"],
  "whatWeOffer": ["bullet strings"]
}

Job title: ${dto.title}
Department: ${dto.department}
Level: ${dto.level}
Required skills: ${dto.requiredSkills.join(', ')}
Culture notes: ${dto.cultureNotes || 'none provided'}

Use inclusive, gender-neutral language throughout. Return ONLY the JSON object.`;
  }

  private fallbackTemplate(dto: GenerateJobDescriptionDto): JobDescriptionResult {
    return {
      roleSummary: `We are hiring a ${dto.level}-level ${dto.title} to join our ${dto.department} team. [Fill in role summary manually]`,
      responsibilities: ['[Add responsibility]', '[Add responsibility]', '[Add responsibility]'],
      requiredQualifications: dto.requiredSkills.map((skill) => `Experience with ${skill}`),
      preferredQualifications: ['[Add preferred qualification]'],
      whatWeOffer: ['[Add benefit]', '[Add benefit]'],
      source: 'fallback',
    };
  }

  async generateJobDescription(dto: GenerateJobDescriptionDto): Promise<JobDescriptionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — using fallback template');
      return this.fallbackTemplate(dto);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: this.buildPrompt(dto) }] }],
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
        },
        { timeout: 15000 },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      return {
        roleSummary: parsed.roleSummary,
        responsibilities: parsed.responsibilities || [],
        requiredQualifications: parsed.requiredQualifications || [],
        preferredQualifications: parsed.preferredQualifications || [],
        whatWeOffer: parsed.whatWeOffer || [],
        source: 'ai',
      };
    } catch (error) {
      this.logger.error(`Gemini call failed, falling back to template: ${error}`);
      return this.fallbackTemplate(dto);
    }
  }
}
