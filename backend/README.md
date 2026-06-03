# AetherUI Backend

Express API for premium UI design intelligence analysis.

## Routes

- GET /health
- POST /api/analyze

## Run

```bash
npm run dev
```

or

```bash
npm start
```

## AI Provider Selection

Set in .env:

- AI_PROVIDER=openai uses OpenAI only and requires OPENAI_API_KEY
- AI_PROVIDER=mock uses fallback generator
- AI_PROVIDER=auto selects OpenAI if key exists, else mock

The analysis payload includes design DNA, landing-page DNA, why-this-works summaries, style personality, scorecards, similarity prompts, and export text for Cursor, v0, ChatGPT, Claude, React, Tailwind, and JSON.
