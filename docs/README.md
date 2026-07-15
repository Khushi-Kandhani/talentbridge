
This folder contains documentation artifacts for the TalentBridge platform.

## Deliverable 1: System Design Document
The primary artifact is **`TalentBridge_SDD.docx`**, which serves as the source of truth for the platform's current state based on direct system inspection. It covers:

* **System Architecture:** Full stack details (NestJS, Prisma, React) and role-based hiring pipeline rules.
* **Incident Reports:** Root-cause analysis and fixes for critical backend errors (e.g., the JWT token configuration 500 error).
* **Frontend Routing & Component Tree:** Detailed mapping of routes, role-based dashboards, and data dependencies.
* **Data Model (ERD):** Core database schema, entity relationships, and architectural observations.

## Deliverable 4: AI Integration Report
The next artifact is **`TalentBridge_AI_Integration_Report.docx`**, which documents the backend AI Proxy Module (as of commit `a18e1c8`). It covers:

* **Prompt Templates:** Exact system prompts, inputs, and temperature settings for the JD Generator, CV Scorer, Interview Suggester, and Offer Letter Drafter.
* **Context Management:** Details on stateless, per-request context assembly and strict JSON output validation.
* **Fallback Behavior:** The 3-tier fallback chain (Gemini → Groq → Static Template) ensuring graceful degradation across all features.
* **Prompt Iterations:** Historical context on prompt evolution and the addition of the multi-provider fallback.
* **Data Privacy:** Constraints and considerations regarding candidate data sent to third-party LLMs.
