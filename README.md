# Presence

**Embodied Diegetic AI Platform**  
Zero-UI 3D digital human that replaces traditional chatbot interfaces with a real-time conversational avatar. An invisible multi-LLM cognitive router powers a single consistent persona. When text or code is needed, the avatar physically pulls out a smartphone and opens a synchronized diegetic mobile chat drawer (“The Phone Mechanic”).

> “Stop prompting. Start talking.”

---

## Current Status

**Module 1 — 3D Stage & Expressive Avatar is largely complete.**

- Production studio lighting (key + fill + rim + ambient + hemisphere)
- Free full-body avatar (TalkingHead `brunette.glb`) with full ARKit 52 + Oculus 15 visemes
- Automatic eye-blink loop
- Emotion morph blending (neutral, happy, thoughtful, curious, focused, amused) driven by Zustand store
- Idle breathing + subtle sway
- Tighter medium close-up camera framing
- Contact shadows + environment reflections
- Clean immersive UI chrome
- Zustand store + TypeScript types for the full cognitive loop already prepared

**Note:** Ready Player Me hosted CDN was discontinued January 2026. Presence uses a free, Mixamo-compatible avatar with the same morph-target standards so lip-sync and expressions remain production-grade at zero cost.

---

## Locked MVP Scope (Strict)

This repository enforces a **zero-cost, production-grade MVP**. No scope creep is allowed.

### In-Scope Modules
1. **3D Stage & Expressive Avatar** ✅ (complete for MVP foundation)
2. **Finite State Machine + The Phone Mechanic**
3. **Real-Time Voice & Viseme Loop**
4. **Invisible Multi-API Cognitive Router**
5. **Unified Session Memory & Auth**

### Explicitly Out-of-Scope (Post-MVP only)
- Custom user-uploaded avatars or in-app avatar editors
- Paid video-streaming avatar services (HeyGen, D-ID, Tavus, etc.)
- Multi-agent rooms or side-by-side model comparison
- Native iOS / Android apps (MVP is responsive WebGL PWA)
- Any paid API tier or paid hosting

---

## Production-Grade Free Tech Stack

| Layer              | Technology                                      | Notes |
|--------------------|--------------------------------------------------|-------|
| Framework          | Next.js 15 (App Router)                          | — |
| 3D                 | React Three Fiber + Drei + Postprocessing        | Studio lighting, high visual quality |
| Avatar             | TalkingHead brunette.glb (free)                  | ARKit 52 + Oculus Visemes, Mixamo rig |
| Animations         | Mixamo FBX → GLTF                                | 4 core states (next) |
| Lip-sync           | wawa-lipsync                                     | Real-time Web Audio, 60 fps |
| STT                | Browser Web Speech API + optional Gemini Live    | Free |
| TTS                | Google Cloud Text-to-Speech (Neural2)            | 1 M free characters / month |
| Cognitive Router   | Gemini Flash (primary) + Groq + OpenRouter Free  | Single persona, structured output |
| Auth & Database    | Firebase Spark (Google Auth + Firestore)         | Free |
| Hosting            | Vercel Free Tier                                 | — |

**Quality Bar**  
Graphics, animation smoothness, lip-sync fidelity, UI polish, and perceived latency must feel production-ready even while staying entirely on free tiers.

---

## How to Run Locally

```bash
git clone https://github.com/taimooraliwaris/presence.git
cd presence
npm install
npm run dev
```

Open http://localhost:3000 — you should see the avatar in a dark studio with breathing, natural blinking, and emotion-ready morph targets.

---

## Repository

https://github.com/taimooraliwaris/presence

Actively developed by the R&D lead. All implementation decisions are locked to the scope above.
