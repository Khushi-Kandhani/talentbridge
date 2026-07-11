# TalentBridge

### AI-Augmented SME Recruitment Platform

TalentBridge is an AI-powered recruitment platform built to help Small and Medium Enterprises (SMEs) streamline hiring through intelligent automation, secure architecture, and real-time collaboration. Built as a full-stack Web Technologies project, it transforms traditional recruitment into a faster, data-driven, and AI-assisted hiring experience.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-Academic%20Use-blue)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20NestJS%20%7C%20PostgreSQL-informational)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [AI Features](#ai-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Security Highlights](#security-highlights)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Objectives](#project-objectives)
- [Academic Context](#academic-context)
- [License](#license)

---

## Overview

Hiring for SMEs is often slowed down by manual resume screening, inconsistent evaluations, fragmented communication, and lengthy recruitment cycles.

TalentBridge addresses these challenges by combining modern web technologies with Large Language Models (LLMs) to automate repetitive recruitment tasks — while keeping recruiters in full control of hiring decisions.

The platform provides secure role-based workspaces, AI-assisted candidate evaluation, real-time hiring workflows, and intelligent document processing, all within a scalable, enterprise-grade architecture.

---

## Key Features

### 🔐 Secure Multi-Role Platform

Role-based dashboards with JWT authentication for:

| Role | Description |
|---|---|
| 👤 Candidate | Applies to jobs, tracks application status |
| 💼 Recruiter | Manages postings, screens candidates |
| 📋 Hiring Manager | Reviews shortlists, approves decisions |
| 🛡️ Administrator | Manages platform, users, and permissions |

Each role has isolated permissions and a dedicated workflow.

### 📈 Intelligent Hiring Pipeline

Recruitment is tracked end-to-end, with every status change synchronized across the platform in real time.

**Job Lifecycle**

```
Draft → Published → Closed → Archived
```

**Candidate Lifecycle**

```
Applied → Screened → Shortlisted → Interview Scheduled → Offer → Hired / Rejected
```

### ⚡ Real-Time Collaboration

Powered by **Socket.io**, with role-isolated rooms for:

- Instant application updates
- Live hiring stage changes
- Interview reminders
- Recruiter notifications
- Hiring manager updates
- Candidate status synchronization

### 🤖 AI-Augmented Recruitment

TalentBridge integrates enterprise-grade LLMs while keeping all AI communication secure. Instead of exposing API keys to the browser, **every AI request passes through the NestJS backend.**

**Benefits:**
- Zero client-side API exposure
- Secure request validation
- Centralized prompt management
- Future AI provider flexibility

### 📄 Smart Resume Processing

Uploaded PDF resumes are processed automatically, server-side.

**Capabilities:**
- PDF text extraction
- Resume parsing
- Candidate profile generation
- Skills identification
- Experience analysis
- Education extraction

> **Maximum upload size:** 5 MB

---

## AI Features

### ✍️ AI Job Description Generator

Generates professional, bias-aware job descriptions from minimal recruiter input, including:

- Job summary
- Responsibilities
- Required skills
- Qualifications
- Preferred experience
- Benefits
- Gender-neutral language

**Fallback:** If AI becomes unavailable, the system automatically switches to a standardized corporate template.

### 📑 AI CV Screening

Analyzes resumes against job requirements and outputs:

- Candidate summary
- Match score (0–100)
- Key strengths
- Missing skills
- Improvement suggestions

**Fallback:** Uses a traditional recruiter-first chronological resume evaluation.

### 🎤 AI Interview Question Generator

Creates personalized interview questions based on the candidate resume, job description, skill gaps, and experience level.

**Produces:**
- Technical questions
- Behavioral questions
- Follow-up questions

**Fallback:** Loads a predefined interview question bank, categorized by role.

### 📄 AI Offer Letter Generator *(Bonus)*

Automatically drafts professional offer letters using salary package, benefits, probation period, company information, and employment terms.

**Fallback:** Switches to recruiter-assisted manual drafting with validation.

---

## System Architecture

```
                    +----------------+
                    |   React Client |
                    +-------+--------+
                            |
                         REST API
                            |
                            ▼
                  +-------------------+
                  |    NestJS API     |
                  +-------------------+
                  | Authentication    |
                  | AI Proxy          |
                  | Resume Parser     |
                  | Hiring Pipeline   |
                  | WebSockets        |
                  +---------+---------+
                            |
          +-----------------+------------------+
          |                                    |
          ▼                                    ▼
   PostgreSQL Database                  OpenAI / Claude
                                          (via Backend)
```

---

## Technology Stack

| Layer | Technology | Implementation |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Vite, React Router v6, Axios, Zustand / React Context |
| **Backend** | NestJS + TypeScript | Modular Architecture, REST APIs, Swagger |
| **Database** | PostgreSQL 15 | TypeORM / Prisma with Migrations |
| **Authentication** | JWT | Role-Based Access Control |
| **Real-Time** | Socket.io | Role-Isolated Rooms |
| **AI Services** | OpenAI GPT-4o / Claude | Secure Backend Proxy |
| **Documentation** | Swagger | `/api` Endpoint |

---

## Security Highlights

- JWT authentication
- Password hashing
- Protected API routes
- Role-based authorization
- Server-side AI proxy
- No exposed API keys
- Secure file uploads
- Input validation
- Environment variable isolation

---

## Project Structure

```
talentbridge/
│
├── frontend/              # React application
│   ├── Candidate Portal
│   ├── Recruiter Dashboard
│   ├── Hiring Manager Portal
│   └── Admin Dashboard
│
├── backend/                # NestJS Backend
│   ├── Authentication
│   ├── AI Proxy
│   ├── Resume Parser
│   ├── Hiring Pipeline
│   ├── WebSockets
│   └── REST APIs
│
├── docs/                   # Documentation
│   ├── ER Diagrams
│   ├── API Contracts
│   ├── AI Prompt Reports
│   └── Architecture
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

> Project setup instructions will be published after the frontend and backend scaffolding are finalized.

The repository will include:

- Docker-based setup
- Environment configuration
- Database migrations
- Backend initialization
- Frontend startup
- API documentation
- Local development guide

---

## API Documentation

Once the backend is running, interactive Swagger documentation is available for every REST endpoint at:

```
http://localhost:<PORT>/api
```

---

## Project Objectives

TalentBridge was built to:

- Reduce manual recruitment effort
- Improve hiring consistency
- Accelerate candidate screening
- Provide AI-assisted decision support
- Enable secure, enterprise-ready architecture
- Deliver real-time collaboration across recruitment teams

---

## Academic Context

This project was developed as part of the **Web Technologies – Full Stack Track** curriculum, demonstrating practical implementation of:

- Modern full-stack development
- Enterprise backend design
- RESTful API architecture
- Real-time communication
- AI integration
- Secure authentication
- Database design
- Software engineering best practices

---

## License

Developed exclusively for academic evaluation under the Web Technologies – Full-Stack Track curriculum.

© 2026 TalentBridge Project Team. All rights reserved.
