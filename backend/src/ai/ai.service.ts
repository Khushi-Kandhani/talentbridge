import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GenerateJobDescriptionDto } from './dto/generate-job-description.dto';
import { ScreenCvDto } from './dto/screen-cv.dto';
import { GenerateInterviewQuestionsDto } from './dto/generate-interview-questions.dto';
import { INTERVIEW_QUESTION_FALLBACKS } from './constants/interview-question-fallbacks';

export type JobDescriptionResult = {
  roleSummary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  whatWeOffer: string[];
  source: 'ai' | 'fallback';
};

export type InterviewQuestionsResult = {
  questions: { question: string; listenFor: string }[];
  source: 'ai' | 'fallback';
};

export type CvExtraction = {
  name: string;
  yearsOfExperience: number | null;
  topSkills: string[];
  educationLevel: string;
  lastRole: string;
};

export type CvScreeningResult = {
  extraction: CvExtraction;
  matchScore: number | null;
  strengths: string[];
  gaps: string[];
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

  private buildInterviewQuestionsPrompt(dto: GenerateInterviewQuestionsDto): string {
    return `You are an expert interviewer preparing a hiring manager for a ${dto.interviewType} interview. Based on the job description and candidate summary below, generate 8 to 10 tailored interview questions as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{
  "questions": [
    { "question": "string", "listenFor": "string, one sentence on what a strong answer demonstrates" }
  ]
}

Interview type: ${dto.interviewType}
Job description: ${dto.jobDescription}
Candidate CV summary: ${dto.candidateCvSummary}

For a "technical" interview, focus on role-specific technical depth calibrated to what is in the CV. For a "behavioural" interview, focus on past behaviour and soft skills relevant to the role. For a "final" interview, focus on culture fit, motivation, and closing questions. Return ONLY the JSON object with 8 to 10 questions.`;
  }

  private fallbackInterviewQuestions(dto: GenerateInterviewQuestionsDto): InterviewQuestionsResult {
    return {
      questions: INTERVIEW_QUESTION_FALLBACKS[dto.interviewType],
      source: 'fallback',
    };
  }

  async generateInterviewQuestions(dto: GenerateInterviewQuestionsDto): Promise<InterviewQuestionsResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — using fallback interview question bank');
      return this.fallbackInterviewQuestions(dto);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: this.buildInterviewQuestionsPrompt(dto) }] }],
          generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
        },
        { timeout: 15000 },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

      if (questions.length < 3) {
        throw new Error(`Gemini returned too few questions (${questions.length})`);
      }

      return {
        questions: questions.slice(0, 10).map((q: any) => ({
          question: String(q.question ?? '').trim(),
          listenFor: String(q.listenFor ?? '').trim(),
        })),
        source: 'ai',
      };
    } catch (error) {
      this.logger.error(`Gemini call failed, falling back to question bank: ${error}`);
      return this.fallbackInterviewQuestions(dto);
    }
  }

  private buildCvScreeningPrompt(dto: ScreenCvDto): string {
    return `You are an expert technical recruiter screening a candidate's CV against a job's requirements. Extract structured information from the CV and score the match as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{
  "extraction": {
    "name": "string, candidate's full name if present in the CV, otherwise \\"Unknown\\"",
    "yearsOfExperience": number or null,
    "topSkills": ["up to 5 strings, the candidate's strongest skills relevant to this job"],
    "educationLevel": "string, e.g. Bachelor's, Master's, PhD, Bootcamp, Not specified",
    "lastRole": "string, most recent job title and company if present, otherwise Not specified"
  },
  "matchScore": number from 0 to 100,
  "strengths": ["exactly 3 strings, the candidate's top strengths for this specific role"],
  "gaps": ["exactly 2 strings, the candidate's top gaps against this specific role"]
}

Job description: ${dto.jobDescription}
Required skills: ${dto.requiredSkills.join(', ')}

Candidate CV text:
${dto.cvText}

Base the score and analysis only on evidence actually present in the CV text — do not invent experience or skills that are not mentioned. Return ONLY the JSON object.`;
  }

  private fallbackCvScreening(): CvScreeningResult {
    return {
      extraction: {
        name: 'Unknown',
        yearsOfExperience: null,
        topSkills: [],
        educationLevel: 'Not specified',
        lastRole: 'Not specified',
      },
      matchScore: null,
      strengths: [],
      gaps: [],
      source: 'fallback',
    };
  }

  async screenCv(dto: ScreenCvDto): Promise<CvScreeningResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — CV stored without AI scoring (spec §4.2 fallback)');
      return this.fallbackCvScreening();
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: this.buildCvScreeningPrompt(dto) }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        },
        { timeout: 20000 },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      const extraction = parsed.extraction || {};
      const matchScore = Number(parsed.matchScore);

      if (Number.isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
        throw new Error(`Gemini returned an invalid matchScore: ${parsed.matchScore}`);
      }

      return {
        extraction: {
          name: String(extraction.name ?? 'Unknown'),
          yearsOfExperience:
            extraction.yearsOfExperience === null || extraction.yearsOfExperience === undefined
              ? null
              : Number(extraction.yearsOfExperience),
          topSkills: Array.isArray(extraction.topSkills) ? extraction.topSkills.slice(0, 5) : [],
          educationLevel: String(extraction.educationLevel ?? 'Not specified'),
          lastRole: String(extraction.lastRole ?? 'Not specified'),
        },
        matchScore: Math.round(matchScore),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 2) : [],
        source: 'ai',
      };
    } catch (error) {
      this.logger.error(`Gemini CV screening failed, falling back to manual review: ${error}`);
      return this.fallbackCvScreening();
    }
  }
}
