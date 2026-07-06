# CareerLens AI

A full-stack, AI-powered career platform that parses resumes, analyzes skill gaps against real job descriptions, generates role-specific interview questions, and produces tailored, ATS-optimized resume PDFs — powered by the Gemini API.

**Live app:** https://ai-assistant-iota-ten.vercel.app

---

## Features

- **Resume parsing & skill-gap analysis** — upload a resume PDF and a job description; Gemini extracts skills, scores the match, and identifies gaps.
- **AI-generated interview prep** — role-specific technical and behavioral questions, each with the interviewer's intent and a model answer, plus a 7-day preparation plan.
- **AI-driven resume generation** — submit a job description and get back a tailored, ATS-optimized resume, rendered to a polished PDF via Gemini (content) + Puppeteer (HTML → PDF).
- **JWT authentication** — secure signup/login with HTTP-only cookies and a token blacklist on logout.
- **Redis caching layer** — Gemini API responses are cached by content hash, cutting repeat-request latency by up to 98% (see [Redis Caching](#redis-caching-layer) below).

## Tech Stack

**Frontend:** React (Vite), Axios
**Backend:** Node.js, Express 5, MongoDB (Mongoose), Redis (ioredis), JWT
**AI/Infra:** Google Gemini API, Puppeteer (`puppeteer-core` + `@sparticuz/chromium`)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas, Upstash Redis

---

## Architecture

```
frontend/   React + Vite SPA, deployed on Vercel
backend/    Express REST API, deployed on Render
  src/
    config/       DB and Redis connection setup
    controllers/  Request handlers (auth, interview/report generation)
    middlewares/  JWT auth guard, file upload (multer)
    models/       Mongoose schemas (User, InterviewReport, Blacklist)
    routes/       API route definitions
    services/     Gemini API + Puppeteer PDF generation
    utils/        Redis caching helpers
```

---

## Redis Caching Layer

Gemini API calls are the slowest and most expensive part of this app — interview report generation and resume PDF generation both involve a live LLM call, and the PDF pipeline additionally launches a headless Chromium instance. To avoid paying that cost on every identical request, both endpoints check Redis before calling Gemini:

1. **Cache key** — a SHA-256 hash of the resume text + self-description + job description. Identical inputs always produce the same key, regardless of which user submitted them.
2. **Cache hit** — return the cached result immediately, skip the Gemini call entirely.
3. **Cache miss** — call Gemini (and Puppeteer, for the PDF route) as normal, store the result in Redis with a 24-hour TTL, then return it.
4. **Fail-open design** — every Redis read/write is wrapped in try/catch. If Redis is down or misconfigured, the app transparently falls back to calling Gemini directly; caching is a performance optimization, never a hard dependency.

**Measured results (production):**
| Endpoint | Cache miss | Cache hit | Improvement |
|---|---|---|---|
| Interview report generation | ~2.4s | ~46ms | ~98% faster |
| Resume PDF generation | ~22s | ~280ms | ~98% faster |

PDF results are cached as base64-encoded strings (Redis stores JSON/text natively; binary PDF buffers are converted to base64 on write and back to a `Buffer` on read).

---

## Known Limitation: Safari Cross-Site Cookies

The frontend (`vercel.app`) and backend (`onrender.com`) are hosted on fully separate domains, not subdomains of a shared parent domain. Authentication relies on an HTTP-only JWT cookie set with `SameSite=None; Secure`, which is the correct, standards-compliant way to allow a cross-site cookie.

**Chrome and most other browsers:** works correctly out of the box.

**Safari:** blocks this cookie by default via Intelligent Tracking Prevention (ITP), a privacy feature that restricts third-party/cross-site cookies regardless of their `SameSite` configuration. This means login appears to succeed in Safari, but subsequent authenticated requests return `401` because the browser never stores or resends the cookie.

This is a browser-level privacy restriction, not an application bug. The complete fix is to serve the frontend and backend from the same parent domain (e.g. `app.example.com` and `api.example.com`), which requires a custom domain and DNS configuration — planned as a future improvement. For now, **Chrome is the recommended browser for testing/demoing this app.**

---

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your own keys
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Required environment variables (`backend/.env`)

```
GOOGLE_GENAI_API_KEY=
MONGO_URI=
JWT_SECRET=
REDIS_URL=
FRONTEND_URL=http://localhost:5173
```

---

## Production Deployment Notes

A few non-obvious issues came up deploying this to Render + Vercel, worth documenting for anyone hitting the same:

- **Port binding:** Render assigns its own port via `process.env.PORT` at runtime — a hardcoded `app.listen(3000)` will fail Render's health check.
- **Missing `start` script:** Render's default deploy command is `npm start`; a `dev`-only script (using `nodemon`) isn't sufficient for production.
- **CORS origin as an exact string match:** the deployed frontend origin must match `FRONTEND_URL` byte-for-byte — a trailing newline picked up from Render's environment variable UI caused a hard-to-diagnose `ERR_INVALID_CHAR` crash on every CORS preflight request until it was explicitly trimmed and validated at startup.
- **Cross-site cookies:** `SameSite=None; Secure` is required for a JWT cookie to survive a cross-origin request between Vercel and Render; the default (`SameSite=Lax`, no `Secure`) silently drops the cookie in production while working fine in local dev over `http://localhost`.
- **Puppeteer on Render's free tier:** the standard `puppeteer` package expects to download and cache its own Chromium binary, which doesn't reliably persist between Render's build and runtime environments. Switched to `puppeteer-core` + `@sparticuz/chromium` (a Chromium build made for constrained/serverless environments) instead, pinned to a pre-v149 release since v149 dropped CommonJS support.

---

## License

MIT
