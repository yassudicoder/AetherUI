# UI DNA Backend

Express API for UI DNA analysis.

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
