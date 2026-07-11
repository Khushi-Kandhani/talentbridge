import { InterviewType } from '../dto/generate-interview-questions.dto';

export interface FallbackQuestion {
  question: string;
  listenFor: string;
}

export const INTERVIEW_QUESTION_FALLBACKS: Record<InterviewType, FallbackQuestion[]> = {
  [InterviewType.TECHNICAL]: [
    { question: 'Walk me through how you would design a core system relevant to this role from scratch.', listenFor: 'Structured reasoning, trade-off awareness, and whether they ask clarifying questions before diving in.' },
    { question: 'Describe a technical decision you made that you would reconsider today.', listenFor: 'Self-awareness and ability to evaluate past decisions with new information, not just what went wrong.' },
    { question: 'How do you approach debugging a production issue you cannot immediately reproduce?', listenFor: 'A systematic process — logs, monitoring, isolating variables — rather than guesswork.' },
    { question: 'Tell me about a time you had to learn a new technology quickly to ship something.', listenFor: 'Learning strategy and how fast they got to a working, tested solution.' },
    { question: 'How would you approach optimizing a slow-performing part of a system?', listenFor: 'Whether they measure before optimizing and understand the relevant bottleneck class (I/O, CPU, network).' },
    { question: "What is your process for reviewing a teammate's code?", listenFor: 'Balance between thoroughness and being constructive; attention to correctness vs. style.' },
    { question: 'Describe the trickiest bug you have fixed and how you found the root cause.', listenFor: 'Depth of technical investigation and persistence rather than a lucky guess.' },
    { question: 'How do you decide when to write automated tests versus rely on manual testing?', listenFor: 'Pragmatic judgment about risk and cost, not a one-size-fits-all answer.' },
    { question: 'Tell me about a time you disagreed with a technical approach on your team. What did you do?', listenFor: 'How they handle technical disagreement — advocating with evidence versus digging in unproductively.' },
  ],
  [InterviewType.BEHAVIOURAL]: [
    { question: 'Tell me about a time you had to deliver difficult feedback to a teammate.', listenFor: 'Empathy combined with directness; whether the feedback led to a real change.' },
    { question: 'Describe a situation where you had conflicting priorities. How did you decide what to focus on?', listenFor: 'A clear prioritization framework, not just "I worked harder."' },
    { question: 'Tell me about a project that did not go as planned. What happened and what did you do?', listenFor: 'Ownership of the outcome and concrete lessons applied afterward.' },
    { question: 'Describe a time you had to work with someone whose working style was very different from yours.', listenFor: 'Adaptability and specific strategies used to collaborate effectively.' },
    { question: 'Tell me about a time you took initiative without being asked.', listenFor: 'Genuine proactivity with a measurable outcome, not a generic example.' },
    { question: 'Describe a time you made a mistake that affected others. How did you handle it?', listenFor: 'Accountability, transparency, and what changed afterward to prevent recurrence.' },
    { question: 'Tell me about a time you had to persuade someone who disagreed with your approach.', listenFor: 'Use of evidence and listening, versus just pushing harder.' },
    { question: 'Describe how you have handled a period of high workload or tight deadlines.', listenFor: 'Realistic prioritization and communication with stakeholders, not just working more hours.' },
    { question: 'Tell me about a time you received critical feedback. How did you respond?', listenFor: 'Openness to feedback and evidence of behavior change afterward.' },
  ],
  [InterviewType.FINAL]: [
    { question: 'What drew you to apply for this specific role, beyond the job title?', listenFor: 'Genuine, specific motivation tied to the role or company, not a generic answer.' },
    { question: 'Where do you want to be in your career three years from now, and how does this role fit?', listenFor: 'Realistic alignment between their goals and what the role can actually offer.' },
    { question: 'What kind of team environment do you do your best work in?', listenFor: "Fit with the actual team culture, and self-awareness about their own working style." },
    { question: 'What questions do you still have about the role or the company?', listenFor: 'Depth and specificity of questions — a signal of genuine engagement.' },
    { question: 'Tell me about a time you had to balance quality with shipping speed. How did you decide?', listenFor: 'Judgment under real-world constraints rather than an idealized answer.' },
    { question: 'What would your current or most recent manager say is your biggest growth area?', listenFor: 'Honesty and self-awareness, versus a deflected non-answer.' },
    { question: 'How do you like to receive feedback and recognition?', listenFor: 'Useful, specific information a manager could actually act on.' },
    { question: 'Is there anything about this process, the role, or the team that would affect your decision to accept an offer?', listenFor: 'Surfacing any last-minute blockers before an offer is issued.' },
  ],
};
