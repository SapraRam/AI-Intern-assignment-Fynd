# AI Feedback System

A modern dual-dashboard application for collecting customer feedback, generating AI-powered responses, and providing real-time analytics to operations teams.

## 🚀 Live Demo

| Dashboard | URL |
|-----------|-----|
| **User Feedback Form** | [https://ai-intern-assignment-fynd.vercel.app/](https://ai-intern-assignment-fynd.vercel.app/) |

## ✨ Features

### User Dashboard (Public)
- Modern, responsive feedback form with animated star rating (1-5)
- Real-time character count validation (minimum 10 characters)
- Instant AI-generated response preview after submission
- Smooth animations and intuitive UX

### Admin Dashboard (Operations)
- **Real-time Analytics** – Live feed powered by SWR polling (5-second refresh)
- **Key Metrics** – Total feedback, average rating, satisfaction percentage, attention-needed count
- **Rating Distribution** – Visual bar chart showing breakdown by star rating
- **Sentiment Analysis** – Filter by positive, neutral, or negative feedback
- **Detailed Modal View** – Full submission details with AI response, summary, and recommended actions
- **Pagination** – Browse through submissions (8 per page)
- **Time-Ago Display** – Human-readable timestamps

### AI Integration
- Server-side OpenAI integration using `gpt-4o-mini`
- Structured JSON responses with JSON Schema validation
- Generates: personalized response, summary, and actionable recommendations
- Graceful fallback to templated responses when API is unavailable

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Custom Components
- **Data Fetching:** SWR with auto-refresh
- **AI:** OpenAI API (`gpt-4o-mini`)
- **Language:** TypeScript
- **Storage:** JSON file persistence

## 📁 Architecture

```
src/
 ├─ app/
 │   ├─ page.tsx            # User feedback form
 │   ├─ admin/page.tsx      # Admin analytics console
 │   └─ api/submissions/    # REST API endpoint
 ├─ components/
 │   ├─ UserFeedbackForm    # Star rating, validation, submission
 │   └─ AdminDashboard      # Analytics, charts, filters, modal
 ├─ lib/
 │   ├─ ai.ts               # OpenAI integration with fallback
 │   └─ storage.ts          # JSON file persistence
 └─ types/
     └─ submission.ts       # TypeScript interfaces
```

### Data Flow
```
User Form → POST /api/submissions → AI Processing → JSON Storage → GET /api/submissions → Admin Dashboard
```

## 🔌 API Endpoints

| Method | Route              | Description                      |
|--------|--------------------|----------------------------------|
| GET    | `/api/submissions` | Returns all stored submissions   |
| POST   | `/api/submissions` | Validates, triggers AI, persists |

### POST Body
```json
{
  "rating": 1-5,
  "review": "string (min 10 characters)"
}
```

### Response
```json
{
  "id": "uuid",
  "rating": 5,
  "review": "Great experience!",
  "aiResponse": "Thank you for your feedback...",
  "summary": "Positive customer experience...",
  "actions": ["Thank the user", "Share with team"],
  "createdAt": "2024-12-09T10:00:00.000Z"
}
```