/**
 * Lip-sync bridge for Presence.
 * - When an HTMLAudioElement is available (Google TTS audio later): wawa-lipsync
 * - When using speechSynthesis: procedural jaw / viseme oscillation
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
  if (!active) proceduralPhase = 0;
}

/**
 * Returns current viseme weights to apply to morph targets.
 * Prefer real wawa-lipsync when audio element is connected; else procedural.
 */
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

  if (lipsync && !proceduralSpeaking) {
    try {
      lipsync.processAudio();
      const viseme = String(lipsync.viseme || "viseme_sil");
      if (viseme in weights || OCULUS_VISEMES.includes(viseme as OculusViseme)) {
        weights[viseme] = 1;
      }
      // Soft jaw from non-silence
      if (viseme !== "viseme_sil" && viseme !== "sil") {
        weights.jawOpen = 0.35;
      }
    } catch {
      /* analyser not ready */
    }
    return weights;
  }

  if (proceduralSpeaking) {
    proceduralPhase += delta * 9;
    const open = (Math.sin(proceduralPhase) + 1) * 0.5; // 0..1
    weights.jawOpen = 0.15 + open * 0.45;
    weights.mouthClose = 0;
    // Cycle a few vowel-like visemes for life
    const idx = Math.floor(proceduralPhase * 0.7) % 5;
    const cycle: OculusViseme[] = [
      "viseme_aa",
      "viseme_E",
      "viseme_I",
      "viseme_O",
      "viseme_U",
    ];
    weights[cycle[idx]] = 0.4 + open * 0.4;
  } else {
    weights.viseme_sil = 1;
  }

  return weights;
}

export { OCULUS_VISEMES };
