# UI DNA Extractor

UI DNA Extractor is a Chrome Extension (Manifest V3) that translates website UI into structured design intelligence and AI-friendly prompts.

## Product Positioning

This is an AI UI inspiration translator.

- It analyzes design language, visual systems, and motion behavior.
- It generates reusable prompts and guidance for building fresh interfaces.
- It does not clone websites or copy raw source designs.

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

## Live Hover Intelligence

When selection mode is enabled, the extension now renders a live AI-style hover overlay instead of only a border highlight.

- Floating glassmorphism inspector card near the hovered section
- Realtime section type, layout, typography, color, spacing, motion, and framework hints
- Animated overlay and expanded analysis mode
- Hotkeys: `Q` quick analyze, `W` toggle overlay, `E` expand analysis, `C` copy prompt, `ESC` exit selection
- Copy actions for prompt, design DNA, build pattern, motion, tokens, and full analysis

## Analysis Model

The popup now uses an eight-tab intelligence console:

- AI Prompt
- Design DNA
- Build Pattern
- Motion
- Tokens
- Typography
- Layout
- Components

The generated output emphasizes cinematic, premium, AI-native design language instead of raw CSS or DOM dumps.

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
