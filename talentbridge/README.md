# TalentBridge

AI-Augmented SME Recruitment Platform — Web Technologies course project (Group 6).

TalentBridge helps small and medium businesses run a faster, more consistent hiring process by
automating the slow parts of recruitment with AI: writing job descriptions, screening CVs,
preparing interviewers, and drafting offer letters.

## Tech Stack

- **Frontend:** React
- **Backend:** NestJS
- **Database:** PostgreSQL
- **Auth:** JWT (role-guarded routes)
- **Real-time:** WebSocket (pipeline stage notifications)
- **AI:** LLM API, proxied through the NestJS backend (never called directly from the frontend)

## Repository Structure

```
talentbridge/
├── frontend/     # React app (candidate, recruiter, hiring manager, admin dashboards)
├── backend/      # NestJS API (auth, jobs, pipeline, CV parsing, AI proxy, WebSocket gateway)
├── docs/         # System design docs, ER diagram, API contract, AI integration report
├── docker-compose.yml
└── .env.example
```

## Core Modules

1. Multi-role authentication (Candidate / Recruiter / Hiring Manager / Admin)
2. Job posting management (Draft → Published → Closed → Archived)
3. Candidate pipeline (Applied → Screened → Shortlisted → Interview Scheduled → Offer → Hired/Rejected)
4. CV upload & server-side PDF text extraction
5. Interview scheduler with conflict detection
6. Offer management & admin analytics

## AI Features

1. Job Description Generator
2. CV Screening & Scorer
3. Interview Question Suggester
4. Offer Letter Drafter (bonus)

Each AI feature has a documented fallback path for when the AI service is unavailable.

## Getting Started

Setup instructions will be added here once the backend and frontend scaffolds are in place.

## Team

Group 6 — Web Technologies

## License

For academic use as part of a university course project.
