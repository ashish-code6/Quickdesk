# QuickDesk Backend

## About

QuickDesk is the backend of an AI-assisted helpdesk system built with NestJS.

Employees can create support tickets, while agents can manage and resolve them. AI helps by suggesting the ticket category, priority, and a reply using a small knowledge base through a RAG pipeline.

The goal of the project is to reduce the agent's work while keeping the final decision in the hands of the agent.

---

# Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Passport JWT
- bcrypt
- Groq (Llama 3.3)
- LangChain
- Memory Vector Store

---

# Backend Workflow

## Authentication Flow

```text
## Registration Flow

```text
User
   │
   ▼
Register Request
(Example: name, email, password)
   │
   ▼
Validate DTO
(Check required fields, email format and password validation.)
   │
   ▼
Hash Password (bcrypt)
(Password is converted into a secure hash before saving.)
   │
   ▼
Prisma ORM
(Prisma prepares the database query for user creation.)
   │
   ▼
PostgreSQL
(User information is securely stored in the database.)
   │
   ▼
Registration Successful
(User account is created and ready for login.)
```

---
```text
User
   │
   ▼
Login Request
(Example: email and password)
   │
   ▼
Find User
(Search user by email in PostgreSQL.)
   │
   ▼
Compare Password
(Compare entered password with stored bcrypt hash.)
   │
   ▼
Generate JWT
(Create a signed access token for the authenticated user.)
   │
   ▼
Return JWT
(Client receives the token for future authenticated requests.)
```

----

## Protected API Flow


```text
Client Request
(Example: GET /tickets)
   │
   ▼
JWT Guard
(Verify token signature and check whether token is valid.)
   │
   ▼
Roles Guard
(Check whether the logged-in user has required permissions.)
   │
   ▼
Controller
(Receive the request after authentication and authorization.)
   │
   ▼
Service
(Execute business logic for the requested operation.)
   │
   ▼
Prisma ORM
(Convert service request into SQL queries.)
   │
   ▼
PostgreSQL
(Return requested data or update database records.)
```

---

## Ticket Creation Flow

```text
Employee
(Create a new support ticket.)
   │
   ▼
Ticket Controller
(Receive title, description and attachment filename.)
   │
   ▼
Ticket Service
(Process ticket creation request.)
   │
   ▼
AI Service
(Send ticket description to the LLM.)
   │
   ▼
Groq LLM
(Generate suggested category and priority.)
   │
   ▼
Prisma ORM
(Prepare ticket data for database insertion.)
   │
   ▼
PostgreSQL
(Store ticket with AI-generated suggestions.)
```

---

## RAG Pipeline

```text
Agent Opens Ticket
(Open ticket details.)
   │
   ▼
Ticket Description
(User problem is sent to the RAG pipeline.)
   │
   ▼
Retriever
(Search the most relevant knowledge base documents.)
   │
   ▼
Knowledge Base
(Return matching support articles.)
   │
   ▼
Groq LLM
(Generate a reply using retrieved context only.)
   │
   ▼
AI Draft Reply
(Return reply with citations.)
   │
   ▼
Agent Reviews
(Edit or approve the AI-generated response.)
   │
   ▼
Final Reply Saved
(Store final reply in PostgreSQL and resolve the ticket.)
```

---

## Override Flow

```text
Agent
    │
    ▼
Change Category/Priority
    │
    ▼
Update Ticket
    │
    ▼
Create Audit Log
    │
    ▼
PostgreSQL
```

---

# Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt

### Authorization

- Employee Role
- Agent Role
- JWT Guard
- Roles Guard

### Ticket Management

- Create Ticket
- View My Tickets
- View All Tickets
- Reply to Ticket
- Resolve Ticket

### AI Features

- AI Category Suggestion
- AI Priority Suggestion
- RAG-based Reply Suggestion
- Citation Support
- Override Audit Log

---

# API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register User | No |
| POST | /auth/login | Login User | No |
| GET | /ai/category-priority | AI Category & Priority Suggestion | JWT |
| POST | /tickets | Create Ticket | Employee |
| GET | /tickets/my | Employee Tickets | Employee |
| GET | /tickets | All Tickets | Agent |
| GET | /tickets/:id | Ticket Detail | Employee / Agent |
| PATCH | /tickets/:id/override | Override AI Suggestion | Agent |
| PATCH | /tickets/:id/reply | Reply & Resolve Ticket | Agent |



