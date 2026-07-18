# QuickDesk

QuickDesk is a small AI-assisted helpdesk application. Employees can submit support tickets, while agents can review all tickets, see AI-suggested category/priority, use a knowledge-base grounded AI draft reply, override suggestions when needed, and resolve the ticket with a final response.

This repository contains both apps:

- `quickdesk-frontend` - React frontend
- `quickdesk-backend` - NestJS backend

## Tech Stack

| Layer | Choice |
|------|--------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT |
| Password Hashing | bcrypt |
| LLM Provider | Groq free tier, Llama 3.3 model |
| RAG / Knowledge Base | LangChain MemoryVectorStore with simple local embeddings |

## Features

### Employee

- Register and login
- Submit ticket with title, description, and optional attachment filename
- Preview AI category and priority suggestion
- View only their own tickets
- Track ticket status
- View final reply after resolution

### Agent

- Login as an agent
- View all tickets
- Filter by status, category, and priority
- Search by title
- Open ticket detail
- View employee information
- View AI-suggested category and priority
- Override category or priority
- View override audit log
- View AI draft reply and citations
- Edit final reply
- Resolve ticket

## How To Run Locally

### 1. Clone Repository

```powershell
git clone <your-repo-url>
cd Quickdesk
```

### 2. Setup PostgreSQL

Create a PostgreSQL database:

```text
quickdesk_db
```

### 3. Backend Environment

Create `quickdesk-backend/.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/quickdesk_db"
JWT_SECRET="your_jwt_secret"
GROQ_API_KEY="your_groq_api_key"
```

`GROQ_API_KEY` is optional for local testing. If it is missing or fails, the backend falls back to simple local logic for category/priority and draft reply.

### 4. Install Backend

```powershell
cd quickdesk-backend
npm install
npx.cmd prisma generate
npx.cmd prisma migrate dev
npx.cmd prisma db seed
npm.cmd run start:dev
```

Backend runs on:

```text
http://localhost:3000
```

Seeded agent account:

```text
email: agent@quickdesk.com
password: 123456
```

Note: the seed currently creates the sample agent. A sample employee and database-seeded KB articles are listed in limitations.

### 5. Install Frontend

Open a second terminal:

```powershell
cd quickdesk-frontend
npm install
npm run dev
```

Frontend runs on the Vite URL shown in terminal, usually:

```text
http://localhost:5173
```

## Architecture Diagram

```text
React Frontend
   |
   | Axios + JWT Bearer Token
   v
NestJS Backend
   |
   | Guards
   | - JwtAuthGuard
   | - RolesGuard
   v
Controllers
   |
   v
Services
   |
   | Ticket Service
   | AI Service
   v
Prisma ORM
   |
   v
PostgreSQL

AI Flow:
Ticket text
   -> AI Service
   -> Groq LLM if API key exists
   -> Local fallback if Groq fails
   -> Category / Priority / Draft Reply

RAG Flow:
Ticket text
   -> LangChain draft-reply chain
   -> MemoryVectorStore similarity search
   -> Matching knowledge-base articles + citations
   -> Groq prompt with retrieved articles
   -> Short AI draft reply + citations
```

## API Endpoints

| Method | Path | Purpose | Auth Required |
|--------|------|---------|---------------|
| POST | `/auth/register` | Register employee user | No |
| POST | `/auth/login` | Login and receive JWT | No |
| GET | `/ai/category-priority` | Preview AI category and priority | JWT |
| POST | `/tickets` | Create ticket | Employee |
| GET | `/tickets/my` | Get logged-in user's tickets | JWT |
| GET | `/tickets` | Get all tickets | Agent |
| GET | `/tickets/:id` | Get ticket detail | JWT, owner or agent |
| PATCH | `/tickets/:id/override` | Override category/priority | Agent |
| PATCH | `/tickets/:id/reply` | Save final reply and resolve ticket | Agent |

## Example Ticket For Testing

```text
Title:
Cannot connect to VPN

Description:
I am working remotely and cannot connect to the company VPN. The VPN client fails after login and MFA approval. I am blocked from accessing internal tools.

Attachment filename:
vpn-error.png
```

Expected AI suggestion:

```text
Category: IT
Priority: HIGH
```

## Decisions And Tradeoffs

### a) Why React instead of Next.js?

I picked React with Vite because this project is an internal dashboard-style app, not a public SEO-heavy website. Vite keeps setup fast, routing simple, and makes it easy to focus on the ticket workflow instead of framework overhead.

### b) How is the RAG pipeline structured?

The current RAG flow is intentionally small. The knowledge base lives in `quickdesk-backend/src/ai/knowledge-base.ts`. Each article has an id, title, content, and keywords. When an agent opens a ticket, the backend runs a simple LangChain chain: prepare the ticket text, retrieve the top matching articles from a MemoryVectorStore, create citations, send those articles to Groq, and store the AI draft reply with citations.

Current chunk size: each article is short enough to use as one chunk, around 100-300 words.

Current retriever: LangChain MemoryVectorStore with simple local keyword-style embeddings.

Current prompt: asks the model to use only the provided articles and produce a professional 4-5 line reply.

Tradeoff: this is easy to inspect and test, but the local embeddings are still simple and weaker than production embeddings from a hosted model.

### c) What if the LLM returns an invalid category?

The backend validates AI output against the allowed Prisma enums:

- `IT`
- `HR`
- `FINANCE`
- `ADMIN`
- `OTHER`

If the model returns anything else, the backend falls back to:

```text
Category: OTHER
Priority: MEDIUM
```

This prevents bad model output from breaking the database.

### d) Where is the JWT stored on the client?

The frontend stores the JWT in `localStorage`. I chose this because it is simple for a coding assessment and easy to wire with Axios interceptors. The tradeoff is that `localStorage` is more exposed to XSS than an httpOnly cookie. For a production app, I would use httpOnly secure cookies.

### e) How is backend role access enforced?

The backend uses:

- `JwtAuthGuard` to verify the token
- `RolesGuard` to check role metadata
- `@Roles(Role.AGENT)` and `@Roles(Role.EMPLOYEE)` on protected routes

An employee cannot access an agent-only endpoint just by guessing the URL because the request must include a valid JWT and the backend checks `req.user.role` before allowing the controller method.

### f) Why Socket.io / WebSockets / SSE for real-time?

Real-time updates are not implemented yet. If I add them, I would pick Socket.io because the app needs simple dashboard updates for ticket creation and resolution, and Socket.io handles reconnection better than raw WebSockets.

Failure mode: if the socket disconnects mid-session, the user may miss a live update. The fix is to refetch tickets when the socket reconnects and also keep normal REST loading as the source of truth.

### g) Worst failure mode today

The worst failure mode today is that the AI/RAG path can produce a draft that is too generic if retrieval finds weak matches. To improve it, I would add production embeddings, confidence thresholds, and stronger fallback behavior when no article is relevant.

### h) Where did AI tools help or hurt?

AI helped most with quickly shaping repetitive code, README structure, and thinking through the ticket workflow. It was less helpful when details needed to match the actual repo exactly. The biggest risk was overclaiming features, so I kept the README tied to what the current implementation really does.

## What I Would Do With More Time

- Add Socket.io real-time updates
- Add an agent metrics dashboard
- Replace simple local embeddings with production embeddings
- Seed sample employee and KB articles through Prisma
- Add backend filtering/search query params
- Add automated e2e tests for role enforcement
- Move JWT from localStorage to httpOnly cookies
- Add refresh tokens
- Improve error handling and empty states

## Known Issues / Limitations

- Real-time updates are not implemented yet.
- Agent metrics dashboard is not implemented yet.
- RAG uses a small in-memory knowledge base instead of database-seeded articles.
- The seed script currently creates one sample agent only.
- Knowledge base articles are stored in code, not seeded into the database.
- JWT is stored in localStorage for simplicity.
- Groq API key is optional, and local fallback logic is used if the key is missing or the model call fails.
- Frontend filters are mostly client-side.



## No Secrets In Git

Do not commit real API keys. Use `.env` locally and keep `.env.example` with placeholder values only.
