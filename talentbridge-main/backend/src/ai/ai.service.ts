import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GenerateJobDescriptionDto } from './dto/generate-job-description.dto';
import { ScreenCvDto } from './dto/screen-cv.dto';
import { GenerateInterviewQuestionsDto } from './dto/generate-interview-questions.dto';
import { DraftOfferLetterDto } from './dto/draft-offer-letter.dto';

export type JobDescriptionResult = {
  roleSummary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  whatWeOffer: string[];
  source: 'ai' | 'fallback';
};

export type CvScreeningResult = {
  extraction: {
    name: string | null;
    yearsOfExperience: number | null;
    topSkills: string[];
    educationLevel: string | null;
    lastRole: string | null;
  };
  matchScore: number | null;
  strengths: string[];
  gaps: string[];
  source: 'ai' | 'fallback';
};

export type InterviewQuestion = { question: string; whatToListenFor: string };

export type InterviewQuestionsResult = {
  questions: InterviewQuestion[];
  source: 'ai' | 'fallback';
};

export type OfferLetterResult = {
  letter: string;
  source: 'ai' | 'fallback';
};

const GENERIC_QUESTION_BANK: Record<string, InterviewQuestion[]> = {
  technical: [
    { question: 'Walk me through a project you are proud of.', whatToListenFor: 'Ownership and technical depth.' },
    { question: 'How do you approach debugging a production issue?', whatToListenFor: 'Structured problem solving.' },
    { question: 'How do you evaluate trade-offs between two technical approaches?', whatToListenFor: 'Reasoning under constraints.' },
  ],
  behavioural: [
    { question: 'Tell me about a time you disagreed with a teammate.', whatToListenFor: 'Communication and conflict resolution.' },
    { question: 'Describe a time you missed a deadline. What happened?', whatToListenFor: 'Accountability and learning.' },
  ],
  final: [
    { question: 'Why are you interested in this role specifically?', whatToListenFor: 'Motivation and role fit.' },
    { question: 'Where do you see yourself in three years?', whatToListenFor: 'Career alignment with the role.' },
  ],
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private apiKey() {
    return process.env.GEMINI_API_KEY;
  }

  private model() {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  /** Low-level helper: calls Gemini and parses the response as JSON, or throws. */
  private async callGeminiJson(prompt: string): Promise<any> {
    const apiKey = this.apiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model()}:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      },
      { timeout: 15000 },
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return JSON.parse(text);
  }

  // ---------------------------------------------------------------------
  // Feature 1: Job Description Generator
  // ---------------------------------------------------------------------

  private buildJobDescriptionPrompt(dto: GenerateJobDescriptionDto): string {
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

  private fallbackJobDescription(dto: GenerateJobDescriptionDto): JobDescriptionResult {
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
    if (!this.apiKey()) {
      this.logger.warn('GEMINI_API_KEY not set — using fallback template');
      return this.fallbackJobDescription(dto);
    }
    try {
      const parsed = await this.callGeminiJson(this.buildJobDescriptionPrompt(dto));
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
      return this.fallbackJobDescription(dto);
    }
  }

  // ---------------------------------------------------------------------
  // Feature 2: CV Screening & Scorer
  // ---------------------------------------------------------------------

  private buildCvScreeningPrompt(dto: ScreenCvDto): string {
    return `You are an expert technical recruiter. Compare the candidate CV text below against the job description and required skills, then respond as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{
  "extraction": {
    "name": "string or null",
    "yearsOfExperience": number or null,
    "topSkills": ["up to 5 strings"],
    "educationLevel": "string or null",
    "lastRole": "string or null"
  },
  "matchScore": number from 0 to 100,
  "strengths": ["exactly 3 short strings"],
  "gaps": ["exactly 2 short strings"]
}

Job description:
${dto.jobDescription}

Required skills: ${dto.requiredSkills.join(', ')}

Candidate CV text:
${dto.cvText}

Return ONLY the JSON object.`;
  }

  private fallbackCvScreening(): CvScreeningResult {
    return {
      extraction: { name: null, yearsOfExperience: null, topSkills: [], educationLevel: null, lastRole: null },
      matchScore: null,
      strengths: [],
      gaps: [],
      source: 'fallback',
    };
  }

  /**
   * Scores a candidate's CV against a job's requirements. If the AI service is
   * unavailable, falls back to storing the CV with no score so a recruiter can
   * still review it manually (per spec §4.2 fallback requirement).
   */
  async screenCv(dto: ScreenCvDto): Promise<CvScreeningResult> {
    if (!this.apiKey()) {
      this.logger.warn('GEMINI_API_KEY not set — CV stored without AI score, manual review required');
      return this.fallbackCvScreening();
    }
    try {
      const parsed = await this.callGeminiJson(this.buildCvScreeningPrompt(dto));
      return {
        extraction: {
          name: parsed.extraction?.name ?? null,
          yearsOfExperience: parsed.extraction?.yearsOfExperience ?? null,
          topSkills: parsed.extraction?.topSkills ?? [],
          educationLevel: parsed.extraction?.educationLevel ?? null,
          lastRole: parsed.extraction?.lastRole ?? null,
        },
        matchScore: typeof parsed.matchScore === 'number' ? Math.max(0, Math.min(100, parsed.matchScore)) : null,
        strengths: parsed.strengths ?? [],
        gaps: parsed.gaps ?? [],
        source: 'ai',
      };
    } catch (error) {
      this.logger.error(`Gemini CV screening failed, falling back to manual review: ${error}`);
      return this.fallbackCvScreening();
    }
  }

  // ---------------------------------------------------------------------
  // Feature 3: Interview Question Suggester
  // ---------------------------------------------------------------------

  private buildInterviewQuestionsPrompt(dto: GenerateInterviewQuestionsDto): string {
    return `You are an expert interviewer. Generate 8 to 10 interview questions tailored to this candidate and role, combining role-specific technical questions and behavioural questions. Respond as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{
  "questions": [
    { "question": "string", "whatToListenFor": "brief note on what a strong answer looks like" }
  ]
}

Job description:
${dto.jobDescription}

Candidate CV summary:
${dto.candidateCvSummary}

Interview type: ${dto.interviewType}

Return ONLY the JSON object.`;
  }

  private fallbackInterviewQuestions(dto: GenerateInterviewQuestionsDto): InterviewQuestionsResult {
    return {
      questions: GENERIC_QUESTION_BANK[dto.interviewType] || GENERIC_QUESTION_BANK.behavioural,
      source: 'fallback',
    };
  }

  async generateInterviewQuestions(dto: GenerateInterviewQuestionsDto): Promise<InterviewQuestionsResult> {
    if (!this.apiKey()) {
      this.logger.warn('GEMINI_API_KEY not set — using generic question bank');
      return this.fallbackInterviewQuestions(dto);
    }
    try {
      const parsed = await this.callGeminiJson(this.buildInterviewQuestionsPrompt(dto));
      return { questions: parsed.questions || [], source: 'ai' };
    } catch (error) {
      this.logger.error(`Gemini interview question generation failed, using generic bank: ${error}`);
      return this.fallbackInterviewQuestions(dto);
    }
  }

  // ---------------------------------------------------------------------
  // Feature 4 (Bonus): Offer Letter Drafter
  // ---------------------------------------------------------------------

  private buildOfferLetterPrompt(dto: DraftOfferLetterDto): string {
    return `You are an HR specialist. Draft a formal offer letter as strict JSON with this exact shape and nothing else (no markdown, no code fences):

{ "letter": "the full plain-text offer letter" }

The letter must include: an introduction, role details, compensation, benefits, conditions of employment, and acceptance instructions.

Candidate name: ${dto.candidateName}
Role title: ${dto.roleTitle}
Salary: ${dto.salary}
Start date: ${dto.startDate}
Probation period: ${dto.probationPeriod || 'none specified'}
Benefits: ${dto.benefits}
Company name: ${dto.companyName}

Return ONLY the JSON object.`;
  }

  private fallbackOfferLetter(dto: DraftOfferLetterDto): OfferLetterResult {
    const letter = `Dear ${dto.candidateName},

[AI drafting unavailable — please complete this letter manually.]

We are pleased to offer you the position of ${dto.roleTitle} at ${dto.companyName}, starting ${dto.startDate}, with a salary of ${dto.salary}${dto.probationPeriod ? ` and a probation period of ${dto.probationPeriod}` : ''}.

Benefits: ${dto.benefits}

[Add conditions of employment and acceptance instructions here.]

Sincerely,
${dto.companyName} Hiring Team`;
    return { letter, source: 'fallback' };
  }

  async draftOfferLetter(dto: DraftOfferLetterDto): Promise<OfferLetterResult> {
    if (!this.apiKey()) {
      this.logger.warn('GEMINI_API_KEY not set — using manual-drafting fallback');
      return this.fallbackOfferLetter(dto);
    }
    try {
      const parsed = await this.callGeminiJson(this.buildOfferLetterPrompt(dto));
      return { letter: parsed.letter, source: 'ai' };
    } catch (error) {
      this.logger.error(`Gemini offer letter drafting failed, falling back to manual template: ${error}`);
      return this.fallbackOfferLetter(dto);
    }
  }
}
