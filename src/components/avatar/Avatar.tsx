"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePresenceStore } from "@/lib/store";
import type { Emotion, AnimationState } from "@/types/presence";

/**
 * Free full-body avatar with full ARKit 52 + Oculus 15 visemes.
 * Source: TalkingHead (met4citizen) — Mixamo-compatible rig.
 * Ready Player Me CDN discontinued Jan 2026.
 *
 * Body language is procedural until Mixamo clips are retargeted (Module 2).
 */
const AVATAR_URL =
  "https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/brunette.glb";

const EMOTION_MORPHS: Record<Emotion, Record<string, number>> = {
  neutral: {},
  happy: {
    mouthSmileLeft: 0.55,
    mouthSmileRight: 0.55,
    cheekSquintLeft: 0.25,
    cheekSquintRight: 0.25,
    eyeSquintLeft: 0.15,
    eyeSquintRight: 0.15,
  },
  thoughtful: {
    browInnerUp: 0.35,
    browDownLeft: 0.2,
    browDownRight: 0.2,
    mouthPressLeft: 0.15,
    mouthPressRight: 0.15,
  },
  curious: {
    browInnerUp: 0.45,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
  },
  focused: {
    browDownLeft: 0.35,
    browDownRight: 0.35,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2,
  },
  amused: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
  },
};

/** Target pose offsets driven by FSM state */
const STATE_POSE: Record<
  AnimationState,
  { headPitch: number; lean: number; swayAmp: number }
> = {
  IDLE_LISTENING: { headPitch: 0, lean: 0, swayAmp: 0.012 },
  THINKING: { headPitch: 0.08, lean: 0.03, swayAmp: 0.006 },
  SPEAKING: { headPitch: -0.02, lean: 0.01, swayAmp: 0.01 },
  TEXTING_PHONE: { headPitch: 0.22, lean: 0.04, swayAmp: 0.004 },
};

function findMorphMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        meshes.push(mesh);
      }
    }
  });
  return meshes;
}

function setMorph(
  meshes: THREE.Mesh[],
  name: string,
  value: number,
  lerpFactor = 0.12
) {
  for (const mesh of meshes) {
    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;
    if (!dict || !influences) continue;
    const idx = dict[name];
    if (idx === undefined) continue;
    influences[idx] = THREE.MathUtils.lerp(influences[idx], value, lerpFactor);
  }
}

function findBone(root: THREE.Object3D, names: string[]): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (found) return;
    const n = child.name.toLowerCase();
    if (names.some((name) => n.includes(name.toLowerCase()))) {
      found = child;
    }
  });
  return found;
}

export function Avatar() {
  const group = useRef<THREE.Group>(null);
  const morphMeshes = useRef<THREE.Mesh[]>([]);
  const headBone = useRef<THREE.Object3D | null>(null);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(2 + Math.random() * 3);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);
  const pose = useRef({ headPitch: 0, lean: 0, swayAmp: 0.012 });

  const emotion = usePresenceStore((s) => s.emotion);
  const animationState = usePresenceStore((s) => s.animationState);
  const { scene } = useGLTF(AVATAR_URL);

  const avatar = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 0.55;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
    return cloned;
  }, [scene]);

  useEffect(() => {
    morphMeshes.current = findMorphMeshes(avatar);
    headBone.current = findBone(avatar, [
      "Head",
      "mixamorigHead",
      "head",
      "Neck",
    ]);
  }, [avatar]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const meshes = morphMeshes.current;

    // Smoothly approach FSM pose targets
    const target = STATE_POSE[animationState] ?? STATE_POSE.IDLE_LISTENING;
    pose.current.headPitch = THREE.MathUtils.lerp(
      pose.current.headPitch,
      target.headPitch,
      0.08
    );
    pose.current.lean = THREE.MathUtils.lerp(
      pose.current.lean,
      target.lean,
      0.08
    );
    pose.current.swayAmp = THREE.MathUtils.lerp(
      pose.current.swayAmp,
      target.swayAmp,
      0.08
    );

    // Idle breathing + state-aware sway
    const breath = Math.sin(t * 1.15) * 0.006;
    group.current.position.y = -0.95 + breath;
    group.current.rotation.y =
      Math.sin(t * 0.28) * pose.current.swayAmp + pose.current.lean * 0.3;
    group.current.rotation.x = pose.current.lean * 0.15;

    // Head pitch for TEXTING / THINKING
    if (headBone.current) {
      headBone.current.rotation.x = THREE.MathUtils.lerp(
        headBone.current.rotation.x,
        pose.current.headPitch,
        0.1
      );
    }

    // Eye blink loop
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current >= nextBlink.current) {
      isBlinking.current = true;
      blinkProgress.current = 0;
    }
    if (isBlinking.current) {
      blinkProgress.current += delta * 8;
      const p = blinkProgress.current;
      let blinkVal = 0;
      if (p < 0.5) blinkVal = p * 2;
      else if (p < 1) blinkVal = 1 - (p - 0.5) * 2;
      else {
        isBlinking.current = false;
        blinkTimer.current = 0;
        nextBlink.current = 2.2 + Math.random() * 4;
        blinkVal = 0;
      }
      setMorph(meshes, "eyeBlinkLeft", blinkVal, 0.35);
      setMorph(meshes, "eyeBlinkRight", blinkVal, 0.35);
    }

    // Emotion morphs
    const targets = EMOTION_MORPHS[emotion] || {};
    const allEmotionKeys = new Set<string>();
    Object.values(EMOTION_MORPHS).forEach((m) =>
      Object.keys(m).forEach((k) => allEmotionKeys.add(k))
    );
    allEmotionKeys.forEach((key) => {
      const val = targets[key] ?? 0;
      setMorph(meshes, key, val, 0.08);
    });
  });

  return (
    <group ref={group} position={[0, -0.95, 0]} dispose={null}>
      <primitive object={avatar} />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
