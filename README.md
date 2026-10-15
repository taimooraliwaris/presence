# Presence

**Embodied Diegetic AI Platform**  
Zero-UI 3D digital human powered by an invisible multi-LLM cognitive router.

> “Stop prompting. Start talking.”

---

## Current Status

| Module | Status |
|--------|--------|
| 1. 3D Stage & Expressive Avatar | ✅ |
| 2. FSM + Phone Mechanic | ✅ |
| 3. Real-Time Voice & Viseme Loop | ✅ |
| 4. Invisible Multi-API Cognitive Router | ✅ |
| 5. Unified Session Memory & Auth | pending |

### What works now
- Full embodied loop: listen → think → speak with lip motion
- Phone Mechanic for code / long answers
- `/api/chat` router with single persona + structured JSON (`mode`, `emotion`, `animationState`, `spokenReply`, `phoneMessage`)
- Free-tier backends: **Gemini** (primary) → **Groq** → **OpenRouter free**
- Graceful fallback if no API keys are set

---

## Setup API keys (free)

```bash
cp .env.example .env.local
```

Add **at least one**:

| Key | Get it free at |
|-----|----------------|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys |

Restart `npm run dev` after saving `.env.local`.

Without keys the app still runs (local fallback replies).

---

## How to Run

```bash
git pull
npm install
npm run dev
```

Open http://localhost:3000  
- Mic: talk to Presence  
- Phone icon: text / code mode  
- Barge-in: press mic while speaking to interrupt

Chrome/Edge recommended. Mic needs localhost or HTTPS.

---

## Locked MVP Scope

Zero paid tiers. Module 5 next: Firebase Auth + Firestore unified memory.

Repo: https://github.com/taimooraliwaris/presence
