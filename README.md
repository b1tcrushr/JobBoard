# Job & Co-op Portal Project

> CP476: Internet Computing (Spring 2026)

**Team:** Tiara Bhakat, Talal Tariq, Rahnuma Haque, Aidan MacLeod, Reid Harrington, Andrew Pejko, Carson Yee, Baajdeep Boparai, Zach Pereira

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [User Roles](#user-roles)
- [Milestones](#milestones)
- [Team](#team)

---

## Project Overview

A centralized web portal connecting university students + recent graduates with employers looking for early-career talent. Streamlines the job and Co-op search process by giving applicants tools to discover, save, and apply to postings, while giving employers a dedicated space to post, manage, and review applications.

**Problem:** Existing platforms like LinkedIn and Indeed serve millions of users, its difficult for students and new grads with limited experience to stand out.

**Solution:** University-oriented job board tailored to the needs of students, recent graduates, and recruiters actively hiring early-career candidates.

---

## Features

### Must Have
- User registration and login for job seekers and employers (email validation, password confirmation)
- Job search and filtering by keyword, location, experience level, role type (full-time, part-time, co-op), and pay grade
- Detailed job listing page with description, requirements, responsibilities, pay range, and employer info
- In-portal job application with resume and cover letter upload
- Applicant dashboard — view all applications and their statuses (Applied, Under Review, Interview, Rejected, Accepted)
- Employer dashboard — create, edit, close, and delete postings; view and manage applicants

### Should Have
- Sort job listings by date posted
- Save job postings for later review

### Could Have
- Guest browsing (view listings without an account; prompted to register before applying)
- Email verification on registration

### Out of Scope
- Mobile application (web only for this phase)
- Payment processing for premium listings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js / Express |
| Database | MySQL |
| Authentication | JWT / bcrypt |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/b1tcrushr/JobBoard
cd JobBoard

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client/navigator
npm install
```

### Configuration

1. In `server/`, copy the example env file and fill in your database credentials:
```bash
cp env.example .env
```
Edit `.env` with your MySQL host, user, password, and database name.

2. Create the database by running the schema:
```bash
mysql -u root -p < server/database/schemas.sql
```

### Running the App

```bash
# Start the backend (from /server)
node server.js

# Start the frontend (from /client/navigator)
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:3000`.

---

## Project Structure

```
/
├── client/         # client-side code
├── server/          # server-side code + API
├── database/         # schema, migrations + seed data
├── docs/             # design documents, wireframes + meeting notes
└── README.md
```

---

## Data Model

Five core entities:

- **Candidate** — job seekers w/ profile and resume info
- **Employer** — recruiters tied to a company
- **Company** — organization posting jobs
- **Job Posting** — individual listings w/ title, type, location, pay, and status
- **Application** — links a candidate to a job posting; tracks status

**Key relationships:**
- A Company has many Employers; each Employer belongs to one Company
- An Employer creates many Job Postings; each Posting belongs to one Employer
- A Candidate submits many Applications; each Application belongs to one Candidate
- A Job Posting receives many Applications; each Application is tied to one Posting

---

## User Roles

| Role | Description |
|---|---|
| **Guest** | Can browse and view job listings without an account |
| **Job Seeker** | Registered applicant who can search, save, and apply to postings |
| **Employer** | Registered recruiter who can post, manage listings, and review applicants |

---

## Milestones

| Milestone | Description | Status |
|---|---|---|
| M1 — Planning & Design | Project planning, wireframes, and database design | Complete |
| M2 — Front-End Implementation & Database Design | React pages, routing, component styling | Complete |
| M3 — Full-Stack Integration, Testing Report, Final Demo & Presentation | Backend API, authentication, database integration | Complete |

---

## Team

| Name | Role |
|---|---|
| Tiara Bhakat | Scrum Master |
| Aidan MacLeod | Developer |
| Carson Yee | Developer |
| Reid Harrington | Developer |
| Talal Tariq | Designer |
| Andrew Pejko | Designer |
| Rahnuma Haque | Designer |
| Baajdeep Boparai | QA |
| Zach Pereira | QA |

---

> Last updated: July 22, 2026
