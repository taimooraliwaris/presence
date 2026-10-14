"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

/**
 * Ready Player Me full-body avatar with ARKit + Oculus Visemes morph targets.
 * 
 * We use a public demo avatar that is known to include both morph target sets.
 * Later we will swap this for a polished custom RPM avatar while keeping the same interface.
 * 
 * URL pattern for morph targets:
 * https://models.readyplayer.me/<id>.glb?morphTargets=ARKit,Oculus Visemes
 */
const AVATAR_URL =
  "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus%20Visemes";

export function Avatar() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(AVATAR_URL);
  const { actions, mixer } = useAnimations(animations, group);

  // Clone the scene so we can safely manipulate materials / morphs
  const avatar = useMemo(() => {
    const cloned = scene.clone(true);
    
    // Enable shadows and ensure materials are production quality
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (mesh.material) {
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
            
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 0.6;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
    
    return cloned;
  }, [scene]);

  // Simple idle breathing animation (subtle scale + vertical movement)
  // Will be replaced by Mixamo IDLE_LISTENING once we import the animation set
  useFrame((state) => {
    if (!group.current) return;
    
    const t = state.clock.getElapsedTime();
    
    // Very subtle breathing
    const breath = Math.sin(t * 1.2) * 0.008;
    group.current.position.y = breath;
    
    // Tiny idle sway for life
    group.current.rotation.y = Math.sin(t * 0.3) * 0.015;
  });

  // Center and scale the avatar nicely for a medium close-up framing
  useEffect(() => {
    if (!avatar) return;
    
    // Most RPM full-body models are ~1.7–1.8m tall.
    // We keep scale at 1 and rely on camera framing.
    avatar.position.set(0, 0, 0);
    avatar.rotation.set(0, 0, 0);
  }, [avatar]);

  return (
    <group ref={group} position={[0, -0.95, 0]} dispose={null}>
      <primitive object={avatar} />
    </group>
  );
}

// Preload the avatar so the first render is faster
useGLTF.preload(AVATAR_URL);
