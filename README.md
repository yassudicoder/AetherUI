# AetherUI

AetherUI is a premium freemium AI design intelligence platform for Chrome that translates modern interfaces into reusable design systems, premium prompts, and export-ready frontend guidance.

## Product Positioning

AetherUI is not a DevTools clone or CSS copier.

- It analyzes design language, visual systems, motion, and landing-page storytelling.
- It generates reusable prompts, similarity ideas, and AI export workflows.
- It keeps the free tier useful while reserving deeper analysis and exports for Pro.

## Tech Stack

- Extension frontend: React + TypeScript + Tailwind CSS + Vite
- Browser extension runtime: Manifest V3, content scripts, background service worker, Chrome Storage API
- Backend: Node.js + Express
- AI: OpenAI (optional) with modular provider architecture and local fallback

## Project Structure

- extension/
  - public/manifest.json
  - src/content/
  - src/background/
  - src/popup/
  - src/ai/
  - src/utils/
  - src/styles/
- backend/
  - src/ai/providers/
  - src/routes/
  - src/server.js

## Core Workflow

1. Open any site.
2. Click Select in popup and choose a section.
3. Run Analyze.
4. Review tabs:
  - AI Prompt
  - Design DNA
  - Build Pattern
  - Motion
  - Tokens
  - Typography
  - Layout
  - Components

## Freemium Experience

- Free plan: 5 AI analyses per day, 3 full-page captures per day, limited exports.
- Pro plan: unlimited analysis, landing-page DNA, similarity generation, and export workflows.
- Account state, history, and favorites are stored locally in the extension shell.

## Live Hover Intelligence

When selection mode is enabled, the extension now renders a live AI-style hover overlay instead of only a border highlight.

- Floating glassmorphism inspector card near the hovered section
- Realtime section type, layout, typography, color, spacing, motion, and framework hints
- Animated overlay and expanded analysis mode
- Hotkeys: `Q` quick analyze, `W` toggle overlay, `E` expand analysis, `C` copy prompt, `ESC` exit selection
- Copy actions for prompt, design DNA, build pattern, motion, tokens, and full analysis

## Analysis Model

The popup now uses a premium intelligence console:

- AI Prompt
- Aether Score
- Landing Page DNA
- Why This Works
- Style Personality
- Color DNA
- Similar Design
- Cursor
- v0
- Build Pattern
- Motion
- Tokens
- Typography
- Layout
- Components

The generated output emphasizes cinematic, premium, AI-native design language instead of raw CSS or DOM dumps.

Key premium outputs include:

- Landing Page DNA
- Why This Works
- Style Personality
- AetherUI Score
- Similar Design generation prompts
- Cursor, v0, ChatGPT, Claude, React, Tailwind, and JSON export text

## Setup

### 1) Install dependencies

From workspace root:

```bash
npm install
```

### 2) Configure backend environment

Copy backend/.env.example to backend/.env and set values as needed.

Environment options:

- PORT=8787
- AI_PROVIDER=auto | openai | mock
- OPENAI_API_KEY=...
- OPENAI_MODEL=gpt-4.1-mini

If no OPENAI_API_KEY is provided, backend uses mock provider fallback.

### 3) Run backend

```bash
npm run dev:backend
```

### 4) Build extension

```bash
npm run build:extension
```

Build output will be in extension/dist.

## Load in Chrome

1. Open chrome://extensions
2. Enable Developer mode
3. Click Load unpacked
4. Select extension/dist

## Notes on Framework Detection

Detection is heuristic and based on script/class/DOM pattern clues for:

- Tailwind CSS
- React
- Next.js
- GSAP
- Framer Motion
- Bootstrap

## Future-Ready Areas

Architecture leaves room for:

- screenshot analysis
- Figma export
- Framer export
- AI redesign suggestions
- style similarity search
- motion timeline extraction
- design system generation
