"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePresenceStore } from "@/lib/store";
import { sampleVisemeWeights } from "@/lib/lipsync";
import type { Emotion, AnimationState } from "@/types/presence";

const AVATAR_URL =
  "https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/brunette.glb";

const EMOTION_MORPHS: Record<Emotion, Record<string, number>> = {
  neutral: {},
  happy: {
    mouthSmileLeft: 0.45,
    mouthSmileRight: 0.45,
    cheekSquintLeft: 0.2,
    cheekSquintRight: 0.2,
    eyeSquintLeft: 0.12,
    eyeSquintRight: 0.12,
  },
  thoughtful: {
    browInnerUp: 0.3,
    browDownLeft: 0.18,
    browDownRight: 0.18,
    mouthPressLeft: 0.12,
    mouthPressRight: 0.12,
  },
  curious: {
    browInnerUp: 0.4,
    browOuterUpLeft: 0.28,
    browOuterUpRight: 0.28,
    eyeWideLeft: 0.18,
    eyeWideRight: 0.18,
  },
  focused: {
    browDownLeft: 0.3,
    browDownRight: 0.3,
    eyeSquintLeft: 0.18,
    eyeSquintRight: 0.18,
  },
  amused: {
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.6,
    cheekSquintLeft: 0.35,
    cheekSquintRight: 0.35,
    eyeSquintLeft: 0.25,
    eyeSquintRight: 0.25,
  },
};

const STATE_POSE: Record<
  AnimationState,
  { headPitch: number; lean: number; swayAmp: number }
> = {
  IDLE_LISTENING: { headPitch: 0.02, lean: 0, swayAmp: 0.01 },
  THINKING: { headPitch: 0.1, lean: 0.025, swayAmp: 0.005 },
  SPEAKING: { headPitch: 0, lean: 0.012, swayAmp: 0.008 },
  TEXTING_PHONE: { headPitch: 0.2, lean: 0.035, swayAmp: 0.004 },
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
    if (names.some((name) => n === name.toLowerCase() || n.includes(name.toLowerCase()))) {
      found = child;
    }
  });
  return found;
}

/** Fold arms from T-pose into a natural standing rest. */
function applyRestPose(root: THREE.Object3D) {
  const leftArm = findBone(root, ["LeftArm", "mixamorigLeftArm", "left_arm"]);
  const rightArm = findBone(root, ["RightArm", "mixamorigRightArm", "right_arm"]);
  const leftFore = findBone(root, [
    "LeftForeArm",
    "mixamorigLeftForeArm",
    "leftforearm",
  ]);
  const rightFore = findBone(root, [
    "RightForeArm",
    "mixamorigRightForeArm",
    "rightforearm",
  ]);
  const leftHand = findBone(root, ["LeftHand", "mixamorigLeftHand"]);
  const rightHand = findBone(root, ["RightHand", "mixamorigRightHand"]);

  // Mixamo-style: arms down along sides (not T-pose)
  if (leftArm) {
    leftArm.rotation.z = 1.15;
    leftArm.rotation.x = 0.12;
  }
  if (rightArm) {
    rightArm.rotation.z = -1.15;
    rightArm.rotation.x = 0.12;
  }
  if (leftFore) leftFore.rotation.y = 0.15;
  if (rightFore) rightFore.rotation.y = -0.15;
  if (leftHand) leftHand.rotation.x = 0.1;
  if (rightHand) rightHand.rotation.x = 0.1;
}

export function Avatar() {
  const group = useRef<THREE.Group>(null);
  const morphMeshes = useRef<THREE.Mesh[]>([]);
  const headBone = useRef<THREE.Object3D | null>(null);
  const leftArm = useRef<THREE.Object3D | null>(null);
  const rightArm = useRef<THREE.Object3D | null>(null);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(2 + Math.random() * 3);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);
  const pose = useRef({ headPitch: 0, lean: 0, swayAmp: 0.01 });

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
              mat.envMapIntensity = 0.45;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
    applyRestPose(cloned);
    return cloned;
  }, [scene]);

  useEffect(() => {
    morphMeshes.current = findMorphMeshes(avatar);
    headBone.current = findBone(avatar, [
      "Head",
      "mixamorigHead",
      "head",
    ]);
    leftArm.current = findBone(avatar, ["LeftArm", "mixamorigLeftArm"]);
    rightArm.current = findBone(avatar, ["RightArm", "mixamorigRightArm"]);
  }, [avatar]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const meshes = morphMeshes.current;

    const target = STATE_POSE[animationState] ?? STATE_POSE.IDLE_LISTENING;
    pose.current.headPitch = THREE.MathUtils.lerp(
      pose.current.headPitch,
      target.headPitch,
      0.07
    );
    pose.current.lean = THREE.MathUtils.lerp(
      pose.current.lean,
      target.lean,
      0.07
    );
    pose.current.swayAmp = THREE.MathUtils.lerp(
      pose.current.swayAmp,
      target.swayAmp,
      0.07
    );

    const breath = Math.sin(t * 1.1) * 0.005;
    group.current.position.y = -0.95 + breath;
    group.current.rotation.y =
      Math.sin(t * 0.25) * pose.current.swayAmp + pose.current.lean * 0.25;
    group.current.rotation.x = pose.current.lean * 0.12;

    if (headBone.current) {
      headBone.current.rotation.x = THREE.MathUtils.lerp(
        headBone.current.rotation.x,
        pose.current.headPitch,
        0.1
      );
      // Subtle head nod while speaking
      if (animationState === "SPEAKING") {
        headBone.current.rotation.x += Math.sin(t * 3.2) * 0.015;
      }
    }

    // Micro arm sway (keeps rest pose, adds life)
    if (leftArm.current) {
      leftArm.current.rotation.z = 1.15 + Math.sin(t * 0.7) * 0.03;
      leftArm.current.rotation.x = 0.12 + Math.sin(t * 0.55) * 0.02;
    }
    if (rightArm.current) {
      rightArm.current.rotation.z = -1.15 + Math.sin(t * 0.65 + 1) * 0.03;
      rightArm.current.rotation.x = 0.12 + Math.sin(t * 0.5 + 0.5) * 0.02;
    }

    // Eye blink
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current >= nextBlink.current) {
      isBlinking.current = true;
      blinkProgress.current = 0;
    }
    if (isBlinking.current) {
      blinkProgress.current += delta * 9;
      const p = blinkProgress.current;
      let blinkVal = 0;
      if (p < 0.45) blinkVal = p / 0.45;
      else if (p < 1) blinkVal = 1 - (p - 0.45) / 0.55;
      else {
        isBlinking.current = false;
        blinkTimer.current = 0;
        nextBlink.current = 2.4 + Math.random() * 3.5;
        blinkVal = 0;
      }
      setMorph(meshes, "eyeBlinkLeft", blinkVal, 0.4);
      setMorph(meshes, "eyeBlinkRight", blinkVal, 0.4);
    }

    // Emotion morphs
    const emotionTargets = EMOTION_MORPHS[emotion] || {};
    const allEmotionKeys = new Set<string>();
    Object.values(EMOTION_MORPHS).forEach((m) =>
      Object.keys(m).forEach((k) => allEmotionKeys.add(k))
    );
    allEmotionKeys.forEach((key) => {
      setMorph(meshes, key, emotionTargets[key] ?? 0, 0.07);
    });

    // Lip-sync — faster lerp so mouth keeps up with speech
    const visemes = sampleVisemeWeights(null, delta);
    Object.entries(visemes).forEach(([name, value]) => {
      setMorph(meshes, name, value, 0.35);
    });
  });

  return (
    <group ref={group} position={[0, -0.95, 0]} dispose={null}>
      <primitive object={avatar} />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
