# Presence

**Embodied Diegetic AI Platform**  
Zero-UI 3D digital human that replaces traditional chatbot interfaces with a real-time conversational avatar. An invisible multi-LLM cognitive router powers a single consistent persona. When text or code is needed, the avatar physically pulls out a smartphone and opens a synchronized diegetic mobile chat drawer (“The Phone Mechanic”).

> “Stop prompting. Start talking.”

---

## Locked MVP Scope (Strict)

This repository enforces a **zero-cost, production-grade MVP**. No scope creep is allowed.

### In-Scope Modules
1. **3D Stage & Expressive Avatar**  
   Full-body Ready Player Me avatar in a studio-lit React Three Fiber scene with idle breathing, eye-blink loop, facial emotion blending, and camera framing.

2. **Finite State Machine + The Phone Mechanic**  
   Four animation states (`IDLE_LISTENING`, `THINKING`, `SPEAKING`, `TEXTING_PHONE`) with smooth crossfades. When text/code is required, the avatar raises a 3D smartphone while a Framer Motion mobile chat drawer slides up in perfect sync.

3. **Real-Time Voice & Viseme Loop**  
   Push-to-talk + hands-free VAD, TTS playback, and 60 fps wawa-lipsync driving Oculus visemes. Full barge-in (interruption) support.

4. **Invisible Multi-API Cognitive Router**  
   Single Next.js API endpoint that routes casual speech to low-latency models and code/technical tasks to stronger free models while preserving one persona. Returns structured JSON: `mode`, `emotion`, `animationState`, `spokenReply`, `phoneMessage`.

5. **Unified Session Memory & Auth**  
   Firebase Google Sign-In + Cloud Firestore. One conversation history shared seamlessly between voice and the in-world phone UI.

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

## Repository Status

Actively developed by the R&D lead.  
All implementation decisions are locked to the scope above.

Repo: https://github.com/taimooraliwaris/presence

---

## License

Private development for now. License will be decided at public launch.
