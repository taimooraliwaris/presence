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
| 4. Invisible Multi-API Cognitive Router | pending |
| 5. Unified Session Memory & Auth | pending |

### What works now
- Studio-lit avatar with ARKit + Oculus visemes
- Eye-blink, emotion morphs, procedural body language from FSM
- **Phone Mechanic** — slide-up chat drawer synced to avatar state
- **Push-to-talk** mic (center bottom) — Web Speech STT
- **Spoken replies** via browser TTS with **barge-in** (talking over the avatar stops speech)
- **Lip-sync** — procedural jaw/visemes while speaking (wawa-lipsync ready for audio-element TTS later)
- Shared message history in Zustand (voice + phone)

Allow microphone permission when the browser asks.

---

## How to Run

```bash
git pull
npm install
npm run dev
```

Open http://localhost:3000  
1. Click/hold the mic button and speak  
2. Avatar thinks, then speaks with mouth motion  
3. Use the phone icon for text mode  
4. Interrupt speech anytime by pressing the mic again (barge-in)

**Note:** Chrome/Edge recommended for Web Speech API. HTTPS or localhost required for mic access.

---

## Locked MVP Scope

Zero paid APIs/hosting. Quality bar stays production-grade.

Out of scope until post-MVP: custom avatars, paid video avatars, multi-agent rooms, native apps.

---

## Stack

Next.js 15 · R3F · TalkingHead avatar · Framer Motion · Zustand · Web Speech · wawa-lipsync · (next: Gemini/Groq/OpenRouter free · Firebase Spark · Vercel)

Repo: https://github.com/taimooraliwaris/presence
