import { AiService } from '../ai.service';
import axios from 'axios';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('AiService.draftOfferLetter', () => {
  const baseDto = {
    candidateName: 'Ava Chen',
    roleTitle: 'Senior Product Designer',
    salary: '$150,000/year',
    startDate: '2026-09-01',
    benefits: 'Health insurance, 25 days PTO, remote stipend',
    companyName: 'NexGen SME Alliance',
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the AI-drafted letter when Gemini responds successfully', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    axiosMock.post.mockResolvedValue({
      data: {
        candidates: [{ content: { parts: [{ text: 'Dear Ava Chen,\n\nWe are delighted...\n\nWarm regards' }] } }],
      },
    });

    const service = new AiService();
    const result = await service.draftOfferLetter(baseDto as any);

    expect(result.source).toBe('ai');
    expect(result.letterText).toContain('Dear Ava Chen');
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
  });

  it('falls back to the template when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;

    const service = new AiService();
    const result = await service.draftOfferLetter(baseDto as any);

    expect(result.source).toBe('fallback');
    expect(axiosMock.post).not.toHaveBeenCalled();
    expect(result.letterText).toContain('Ava Chen');
    expect(result.letterText).toContain('Senior Product Designer');
    expect(result.letterText).toContain('NexGen SME Alliance');
  });

  it('falls back to the template when the Gemini call throws', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    axiosMock.post.mockRejectedValue(new Error('Gemini timeout'));

    const service = new AiService();
    const result = await service.draftOfferLetter(baseDto as any);

    expect(result.source).toBe('fallback');
  });

  it('falls back to the template when Gemini returns an empty response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    axiosMock.post.mockResolvedValue({ data: {} });

    const service = new AiService();
    const result = await service.draftOfferLetter(baseDto as any);

    expect(result.source).toBe('fallback');
  });

  it('includes a probation clause in the fallback letter when probationPeriod is given', async () => {
    delete process.env.GEMINI_API_KEY;

    const service = new AiService();
    const result = await service.draftOfferLetter({ ...baseDto, probationPeriod: '3 months' } as any);

    expect(result.letterText).toContain('probationary period of 3 months');
  });

  it('omits the probation clause from the fallback letter when probationPeriod is not given', async () => {
    delete process.env.GEMINI_API_KEY;

    const service = new AiService();
    const result = await service.draftOfferLetter(baseDto as any);

    expect(result.letterText).not.toContain('probationary period');
  });
});
