"use client";

import { useRef } from "react";
import { DirectionalLight, SpotLight } from "three";

/**
 * Production-grade studio lighting setup.
 * Soft key + fill + rim to make the avatar look premium without expensive HDRIs.
 */
export function StudioLighting() {
  const keyLight = useRef<DirectionalLight>(null);
  const fillLight = useRef<DirectionalLight>(null);
  const rimLight = useRef<SpotLight>(null);

  return (
    <>
      {/* Soft ambient base */}
      <ambientLight intensity={0.25} color="#e0e7ff" />

      {/* Key light (main) — warm, from upper right */}
      <directionalLight
        ref={keyLight}
        position={[3, 5, 2]}
        intensity={1.4}
        color="#fff5eb"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />

      {/* Fill light — cooler, softer, from left */}
      <directionalLight
        ref={fillLight}
        position={[-3, 2, 1]}
        intensity={0.55}
        color="#c7d2fe"
      />

      {/* Rim / back light for separation from background */}
      <spotLight
        ref={rimLight}
        position={[0, 3, -3]}
        intensity={0.8}
        color="#a5b4fc"
        angle={0.6}
        penumbra={0.8}
      />

      {/* Subtle ground bounce */}
      <hemisphereLight
        intensity={0.2}
        color="#e0e7ff"
        groundColor="#1e1b4b"
      />
    </>
  );
}
