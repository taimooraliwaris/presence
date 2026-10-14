# Presence

**Embodied Diegetic AI Platform**  
Zero-UI 3D digital human that replaces traditional chatbot interfaces with a real-time conversational avatar. An invisible multi-LLM cognitive router powers a single consistent persona. When text or code is needed, the avatar physically pulls out a smartphone and opens a synchronized diegetic mobile chat drawer (“The Phone Mechanic”).

> “Stop prompting. Start talking.”

---

## Current Status

**Module 1 — 3D Stage & Expressive Avatar is live in the repository.**

- Production studio lighting (key + fill + rim + ambient)
- Ready Player Me full-body avatar with ARKit + Oculus Visemes morph targets
- Subtle idle breathing + sway
- Contact shadows + environment reflections
- Clean immersive UI chrome
- Zustand store + TypeScript types for the full cognitive loop already prepared

---

## Locked MVP Scope (Strict)

This repository enforces a **zero-cost, production-grade MVP**. No scope creep is allowed.

### In-Scope Modules
1. **3D Stage & Expressive Avatar** ✅ (in progress)
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
| Avatar             | Ready Player Me GLB                              | `?morphTargets=ARKit,Oculus Visemes` |
| Animations         | Mixamo FBX → GLTF                                | 4 core states |
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

Open http://localhost:3000 — you should see the avatar in a dark studio environment with subtle breathing animation.

---

## Repository

https://github.com/taimooraliwaris/presence

Actively developed by the R&D lead. All implementation decisions are locked to the scope above.
