/**
 * Lip-sync bridge for Presence.
 * Procedural path improved for speechSynthesis (no audio node available).
 */

import type { Lipsync as WawaLipsync } from "wawa-lipsync";

const OCULUS_VISEMES = [
  "viseme_sil",
  "viseme_PP",
  "viseme_FF",
  "viseme_TH",
  "viseme_DD",
  "viseme_kk",
  "viseme_CH",
  "viseme_SS",
  "viseme_nn",
  "viseme_RR",
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
] as const;

export type OculusViseme = (typeof OCULUS_VISEMES)[number];

let lipsyncInstance: WawaLipsync | null = null;
let proceduralSpeaking = false;
let proceduralPhase = 0;
let visemeHold = 0;
let currentViseme: OculusViseme = "viseme_sil";

export async function getLipsync(): Promise<WawaLipsync | null> {
  if (typeof window === "undefined") return null;
  if (lipsyncInstance) return lipsyncInstance;
  try {
    const mod = await import("wawa-lipsync");
    lipsyncInstance = new mod.Lipsync();
    return lipsyncInstance;
  } catch {
    return null;
  }
}

export function setProceduralSpeaking(active: boolean) {
  proceduralSpeaking = active;
  if (!active) {
    proceduralPhase = 0;
    visemeHold = 0;
    currentViseme = "viseme_sil";
  }
}

const SPEAK_CYCLE: OculusViseme[] = [
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
  "viseme_DD",
  "viseme_nn",
  "viseme_RR",
  "viseme_SS",
  "viseme_PP",
];

export function sampleVisemeWeights(
  lipsync: WawaLipsync | null,
  delta: number
): Record<string, number> {
  const weights: Record<string, number> = {};
  OCULUS_VISEMES.forEach((v) => {
    weights[v] = 0;
  });
  weights.jawOpen = 0;
  weights.mouthClose = 0;
  weights.mouthFunnel = 0;
  weights.mouthPucker = 0;
  weights.mouthSmileLeft = 0;
  weights.mouthSmileRight = 0;

  if (lipsync && !proceduralSpeaking) {
    try {
      lipsync.processAudio();
      const viseme = String(lipsync.viseme || "viseme_sil");
      if (OCULUS_VISEMES.includes(viseme as OculusViseme)) {
        weights[viseme] = 1;
      }
      if (viseme !== "viseme_sil" && viseme !== "sil") {
        weights.jawOpen = 0.4;
      }
    } catch {
      /* analyser not ready */
    }
    return weights;
  }

  if (proceduralSpeaking) {
    proceduralPhase += delta;
    visemeHold -= delta;

    if (visemeHold <= 0) {
      const idx =
        Math.floor(proceduralPhase * 11 + Math.random() * 3) % SPEAK_CYCLE.length;
      currentViseme = SPEAK_CYCLE[idx];
      visemeHold = 0.09 + Math.random() * 0.07;
    }

    const jaw =
      0.18 +
      (Math.sin(proceduralPhase * 12.5) * 0.5 + 0.5) * 0.28 +
      (Math.sin(proceduralPhase * 7.1 + 1.2) * 0.5 + 0.5) * 0.12;

    weights[currentViseme] = 0.75 + Math.random() * 0.15;
    weights.jawOpen = Math.min(0.72, jaw);

    if (currentViseme === "viseme_O" || currentViseme === "viseme_U") {
      weights.mouthFunnel = 0.35;
      weights.mouthPucker = 0.25;
    }
    if (currentViseme === "viseme_E" || currentViseme === "viseme_I") {
      weights.mouthSmileLeft = 0.12;
      weights.mouthSmileRight = 0.12;
    }
    if (currentViseme === "viseme_PP") {
      weights.jawOpen = Math.min(weights.jawOpen, 0.2);
      weights.mouthClose = 0.4;
    }
  } else {
    weights.viseme_sil = 1;
    weights.mouthClose = 0.05;
  }

  return weights;
}

export { OCULUS_VISEMES };
