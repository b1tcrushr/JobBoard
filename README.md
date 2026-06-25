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

> _To be updated after Milestone 1._

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node / express server |
| Database | MySQL |
| Authentication | JWT / bcrypt |
| Hosting | TBD |

---

## Getting Started

> _To be updated after Milestone 1._

### Prerequisites

```
# required tools, runtimes + versions here
```

### Installation

```bash
# clone repository
git clone https://github.com/b1tcrushr/JobBoard
cd YOUR_REPO

# install dependencies
# cd client
# npm i (install node dependencies)
# npm run dev (start the client)

# config environment variables
cp .env.example .env
# edit .env with local settings

# run dev server
# ...
```

### Running Tests

```bash
# test commands here
```

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

Five core entities (subject to change):

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

| Milestone | Description |
|---|---|
| M1 — Planning & Design | In Progress |
| M2 — Front-End Implementation & Database Design | Not Started |
| M3 — Full-Stack Integration, Testing Report, Final Demo & Presentation| Not Started |

---

## Team

> _To be confirmed after Milestone 1._

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

> Last updated: June 2026
