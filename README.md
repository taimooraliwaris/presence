# Presence

**Embodied Diegetic AI Platform**  
Zero-UI 3D digital human that replaces traditional chatbot interfaces with a real-time conversational avatar. An invisible multi-LLM cognitive router powers a single consistent persona. When text or code is needed, the avatar physically pulls out a smartphone and opens a synchronized diegetic mobile chat drawer (“The Phone Mechanic”).

> “Stop prompting. Start talking.”

---

## Current Status

**Module 1** ✅ complete foundation  
**Module 2** ✅ Phone Mechanic + FSM body language (procedural poses; Mixamo clips next)

### What works now
- Studio-lit full-body avatar (TalkingHead, ARKit + Oculus visemes)
- Eye-blink loop + emotion morphs
- Animation FSM states: `IDLE_LISTENING` | `THINKING` | `SPEAKING` | `TEXTING_PHONE`
- Procedural body language (head pitch, lean, sway) driven by FSM
- **The Phone Mechanic** — Framer Motion slide-up chat drawer synced with avatar state
- Floating phone toggle (bottom-right)
- Shared message history between voice path and phone UI (store ready for Firestore)

**Note:** Ready Player Me CDN was discontinued Jan 2026. We use a free Mixamo-compatible avatar with the same morph standards.

---

## Locked MVP Scope (Strict)

### In-Scope Modules
1. **3D Stage & Expressive Avatar** ✅
2. **Finite State Machine + The Phone Mechanic** ✅ (procedural; Mixamo polish next)
3. **Real-Time Voice & Viseme Loop**
4. **Invisible Multi-API Cognitive Router**
5. **Unified Session Memory & Auth**

### Explicitly Out-of-Scope (Post-MVP only)
- Custom avatar upload / in-app editors
- Paid video avatar APIs (HeyGen, D-ID, Tavus)
- Multi-agent rooms / model comparison grids
- Native iOS / Android apps
- Any paid API or hosting tier

---

## Production-Grade Free Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) | — |
| 3D | React Three Fiber + Drei | Studio lighting |
| Avatar | TalkingHead brunette.glb | ARKit 52 + Oculus Visemes |
| UI motion | Framer Motion | Phone Mechanic drawer |
| State | Zustand | Unified avatar + chat |
| Lip-sync | wawa-lipsync `^0.0.2` | Module 3 |
| STT / TTS | Web Speech + Google Cloud TTS free | Module 3 |
| Router | Gemini Flash + Groq + OpenRouter free | Module 4 |
| Auth / DB | Firebase Spark | Module 5 |
| Hosting | Vercel free | — |

---

## How to Run

```bash
git clone https://github.com/taimooraliwaris/presence.git
cd presence
git pull
npm install
npm run dev
```

Open http://localhost:3000  
- Avatar should blink and breathe  
- Tap the phone icon (bottom-right) to open the chat drawer  
- Send a message → avatar enters THINKING then TEXTING_PHONE

---

## Repository

https://github.com/taimooraliwaris/presence
