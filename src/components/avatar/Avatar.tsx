"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePresenceStore } from "@/lib/store";
import type { Emotion } from "@/types/presence";

/**
 * Free full-body avatar with full ARKit 52 + Oculus 15 visemes.
 * Source: TalkingHead (met4citizen) — Mixamo-compatible rig, production-ready morph targets.
 * Ready Player Me hosted CDN was discontinued Jan 2026; we no longer depend on it.
 */
const AVATAR_URL =
  "https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/brunette.glb";

/** Emotion → ARKit morph target weights */
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

export function Avatar() {
  const group = useRef<THREE.Group>(null);
  const morphMeshes = useRef<THREE.Mesh[]>([]);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(2 + Math.random() * 3);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);

  const emotion = usePresenceStore((s) => s.emotion);
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
  }, [avatar]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const meshes = morphMeshes.current;

    // Idle breathing + subtle sway
    const breath = Math.sin(t * 1.15) * 0.006;
    group.current.position.y = -0.95 + breath;
    group.current.rotation.y = Math.sin(t * 0.28) * 0.012;

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

    // Emotion morphs (smooth lerp)
    const targets = EMOTION_MORPHS[emotion] || {};
    const allEmotionKeys = new Set<string>();
    Object.values(EMOTION_MORPHS).forEach((m) =>
      Object.keys(m).forEach((k) => allEmotionKeys.add(k))
    );
    allEmotionKeys.forEach((key) => {
      const target = targets[key] ?? 0;
      setMorph(meshes, key, target, 0.08);
    });
  });

  return (
    <group ref={group} position={[0, -0.95, 0]} dispose={null}>
      <primitive object={avatar} />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
