# Rayeva AI Commerce Console

Production-style full-stack Next.js application built for the **Rayeva AI Systems Assignment**.

This project implements fully working versions of:
- Module 1: AI Auto-Category & Tag Generator
- Module 2: AI B2B Proposal Generator

It also includes architecture-only documented stubs for:
- Module 3: AI Impact Reporting Generator
- Module 4: AI WhatsApp Support Bot

## Project Overview

Rayeva AI Commerce Console is a dashboard-first web app for sustainable commerce workflows.

It provides:
- Dark-mode-first modern interface with manual theme toggle
- Animated dashboard and result panels
- Strict schema-driven AI JSON outputs
- Prompt/response logging and run history
- PostgreSQL persistence via Prisma
- Zod validation and robust API error handling

## Implemented Modules

### Module 1: Auto-Category & Tag Generator

Implemented features:
- Auto-assigns **primary category** from predefined list
- Suggests **sub-category**
- Generates **5-10 SEO tags**
- Suggests sustainability filters from approved enum:
  - plastic-free
  - compostable
  - vegan
  - recycled
  - reusable
  - biodegradable
  - local-sourcing
- Returns structured JSON
- Stores run input, prompt, raw response, parsed output, status, timestamps
- Supports regenerate, copy JSON, and recent history

### Module 2: AI B2B Proposal Generator

Implemented features:
- Suggests a sustainable product mix
- Performs budget-aware allocation within budget limit
- Generates cost breakdown
- Generates impact positioning summary
- Returns structured JSON
- Stores proposal + prompt/response logs in database
- Supports regenerate, download JSON, copy summary, and proposal history

## Architecture Overview

Layered architecture with clear AI/business separation:

- `app/api/*`: HTTP endpoints and request lifecycle
- `lib/validators/*`: Zod request/response schemas
- `lib/ai/*`: prompt construction, OpenAI calls, structured output parsing
- `lib/business/*`: deterministic grounding and rule enforcement
- `lib/db/*`: Prisma client and repository operations
- `app/(console)/*`: dashboard pages and module UIs
- `components/*`: reusable UI and shared presentation components

## Folder Structure

```txt
app/
  (console)/
    dashboard/
    module-1/
    module-2/
    logs/
    architecture/
  api/
    module1/classify/
    module1/history/
    module2/proposal/
    module2/history/
    dashboard/stats/
    logs/
components/
  shared/
  ui/
lib/
  ai/
  business/
  db/
  validators/
  utils/
prisma/
  schema.prisma
  seed.ts
docs/
  sample-prompts.md
  screenshots/
README.md
.env.example
```

## Data Models (Prisma)

Implemented models:
- `ProductClassificationRun`
- `ProposalRun`
- `AiLog`

With enums:
- `RunStatus` (`PENDING | SUCCESS | FAILURE`)
- `ModuleType` (`MODULE_1 | MODULE_2 | MODULE_3 | MODULE_4`)

JSON columns are used for `inputJson`, `parsedOutputJson`, and `parsedResponseJson`.

## AI Prompt Design

Prompt generation is centralized in:
- `lib/ai/module1.ts`
- `lib/ai/module2.ts`

Design approach:
- Task-specific system instructions
- Explicit business context and output constraints
- JSON-schema response format (`response_format: json_schema`)
- Low-temperature deterministic behavior for consistency

Sample prompt templates are documented in:
- `docs/sample-prompts.md`

## Schema Validation Strategy

Validation is applied at multiple layers:

1. **Request validation** with Zod (API boundary)
2. **AI response validation** with Zod after JSON parse
3. **Business output validation** after deterministic grounding
4. **Database-safe persistence** using validated payloads only

If parsing/validation fails, APIs return structured errors and log failures.

## AI and Business Logic Separation

AI layer responsibilities:
- Prompt building
- OpenAI invocation
- Raw response retrieval
- JSON parsing and schema validation

Business layer responsibilities:
- Category whitelist enforcement and mapping fallback
- SEO tag dedupe + min/max normalization
- Sustainability filter normalization
- Budget rebalance/clamping for proposals
- Total recomputation and consistency checks

Fallback sample outputs are included in:
- `lib/business/fallbacks.ts`

## API Endpoints

Implemented:
- `POST /api/module1/classify`
- `POST /api/module2/proposal`
- `GET /api/logs`
- `GET /api/dashboard/stats`
- `GET /api/module1/history`
- `GET /api/module2/history`

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure `.env` values:
- `DATABASE_URL`
- `GROQ_API_KEY`
- optional: `OPENAI_MODEL`, `OPENAI_TIMEOUT_MS`, `NEXT_PUBLIC_APP_NAME`

4. Create database schema:
```bash
npm run db:migrate
```

5. Seed demo data (optional):
```bash
npm run db:seed
```

6. Run the app:
```bash
npm run dev
```

7. Production build check:
```bash
npm run lint
npm run build
```

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL=` PostgreSQL connection string
- `GROQ_API_KEY=` Groq API key (server-side only)
- `OPENAI_MODEL=` default `openai/gpt-oss-20b`
- `OPENAI_TIMEOUT_MS=` request timeout in ms
- `NEXT_PUBLIC_APP_NAME=` UI app title

## Secure Groq Environment Setup

1. Create local env file:
```bash
cp .env.example .env
```

2. Add your real key only in `.env`:
```bash
GROQ_API_KEY=your_key_here
```

3. Never commit secrets:
- `.env`, `.env.local`, and `.env.*.local` are git-ignored.
- The key is consumed only on the server in `lib/ai/client.ts`.

4. Verify `.env` is ignored by git:
```bash
git check-ignore -v .env .env.local .env.production.local
```

5. Verify key exists without printing it:
```bash
[ -n "$GROQ_API_KEY" ] && echo "GROQ_API_KEY loaded" || echo "GROQ_API_KEY missing"
```

## How to Demo Module 1 and Module 2

### Demo Module 1

1. Open `/module-1`
2. Fill product form (or click **Load Sample**)
3. Click **Generate Category & Tags**
4. Verify:
   - primary category
   - sub-category
   - SEO tags (5-10)
   - sustainability filters
   - structured JSON panel
5. Check saved run under history and `/logs`

### Demo Module 2

1. Open `/module-2`
2. Fill client brief (or click **Load Sample**)
3. Click **Generate Proposal**
4. Verify:
   - recommended product mix
   - budget allocation <= budget limit
   - cost breakdown
   - impact summary
   - structured JSON panel
5. Use **Download JSON**, **Copy Summary**, and inspect `/logs`

## Screenshots Placeholders

Add screenshots to:
- `docs/screenshots/dashboard.png`
- `docs/screenshots/module1.png`
- `docs/screenshots/module2.png`
- `docs/screenshots/logs.png`

## Module 3 and Module 4 Architecture Outline

Implemented as architecture documentation on `/architecture` page:
- Data flow definitions
- Suggested endpoints
- Schema ideas
- AI/business split strategy
- WhatsApp escalation logic
- Order-linked impact reporting design

## Why This Meets Assignment Criteria

### Structured AI Outputs
- OpenAI JSON-schema response format
- Zod validation of parsed outputs
- Strict structured response rendering in UI

### Business Logic Grounding
- Category whitelist enforcement
- Sustainability enum normalization
- SEO tag uniqueness and range enforcement
- Budget clamping and recomputation

### Clean Architecture
- Distinct AI, business, validation, DB, and API layers
- Reusable componentized frontend
- Clear model and endpoint boundaries

### Practical Usefulness
- End-to-end form -> AI -> validation -> persistence workflow
- History and logs visibility for traceability
- Admin/logs page for operational monitoring

### Creativity and Reasoning
- Premium dark dashboard UX with Framer Motion
- Assignment-ready architecture docs for next modules
- Balanced AI + deterministic rule application

## Tech Stack

- Frontend: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- UI foundation: shadcn-style component primitives
- Animations: Framer Motion
- Backend: Next.js route handlers
- Database: PostgreSQL + Prisma
- Validation: Zod
- AI: OpenAI API with strict JSON schema outputs
- Data fetching/state: React Query
