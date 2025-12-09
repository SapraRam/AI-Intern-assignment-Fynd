# AI Feedback System

Dual-dashboard application for collecting public reviews, generating AI-powered responses, and streaming insights to an internal operations console.

## Highlights

- **User dashboard (public)** – modern intake form with star rating, validation, and instant AI reply preview.
- **Admin dashboard (restricted)** – live feed powered by SWR polling, analytics tiles (avg rating, positive share, backlog, critical queue) and detailed action summaries.
- **Shared datastore** – lightweight JSON persistence via Node `fs`, making it easy to deploy to hobby platforms.
- **OpenAI integration** – server-only call to `gpt-4o-mini` for response, summary, and recommended actions; deterministic fallback keeps UX functional without a key.

## Architecture

```
src/
 ├─ app/
 │   ├─ page.tsx            # user dashboard
 │   ├─ admin/page.tsx      # admin console shell
 │   └─ api/submissions     # GET + POST endpoint
 ├─ components/             # UserFeedbackForm, AdminDashboard
 ├─ lib/                    # ai.ts (LLM call) + storage.ts (JSON persistence)
 └─ types/                  # Submission interfaces
```

- **Data flow:** User form → `POST /api/submissions` → `generateSubmissionInsights` → `data/submissions.json` → `GET /api/submissions` → Admin dashboard + client-side confirmation.
- **Polling:** Admin dashboard refreshes every 5 seconds via SWR `refreshInterval`.

## Getting started

```bash
pnpm install   # or npm install
pnpm dev       # http://localhost:3000
```

### Environment variables

Create `.env.local` inside `ai-feedback-dash/`:

```
OPENAI_API_KEY=sk-...
```

If omitted or when quota is exhausted, the app automatically falls back to templated responses so the UI still works.

### API endpoints

| Method | Route                 | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/submissions`    | Returns all stored submissions     |
| POST   | `/api/submissions`    | Validates, triggers AI, persists   |

POST body:

```json
{
  "rating": 1-5,
  "review": "string >= 10 chars"
}
```

## Deployment

1. Set `OPENAI_API_KEY` in your hosting provider (Vercel, Render, etc.).
2. Ensure `data/` is writable for file-based persistence (for serverless platforms, swap to hosted storage or Supabase).
3. Deploy with `vercel deploy`, `npm run build && npm run start`, or containerize as needed.

## Submission checklist

- [x] GitHub repo (this project)
- [ ] Report / PDF link – document architecture + screenshots
- [ ] User dashboard URL – e.g., `https://<project>.vercel.app`
- [ ] Admin dashboard URL – same deployment, `/admin` path

Update the placeholders above once deployments are live. Let ops know that admin access should be distributed privately since the link is hidden from the public UI.
