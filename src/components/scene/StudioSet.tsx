"use client";

/**
 * Simple in-scene studio: floor + cyclorama-style back wall + soft side panels.
 * Removes the "floating in space" look without paid HDRIs.
 */
export function StudioSet() {
  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[4.5, 64]} />
        <meshStandardMaterial
          color="#1a1a22"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Soft floor ring (stage edge) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[2.2, 2.35, 64]} />
        <meshStandardMaterial
          color="#2a2a38"
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Back wall / cyclorama */}
      <mesh position={[0, 1.8, -2.4]} receiveShadow>
        <planeGeometry args={[8, 4.2]} />
        <meshStandardMaterial
          color="#12121a"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Soft gradient accent strip on wall */}
      <mesh position={[0, 2.4, -2.38]}>
        <planeGeometry args={[6, 0.08]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4338ca"
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>

      {/* Left softbox panel */}
      <mesh position={[-2.6, 1.6, -0.5]} rotation={[0, Math.PI / 5, 0]}>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial
          color="#e8e8f0"
          emissive="#c7d2fe"
          emissiveIntensity={0.15}
          roughness={0.9}
          side={2}
        />
      </mesh>

      {/* Right softbox panel */}
      <mesh position={[2.6, 1.6, -0.5]} rotation={[0, -Math.PI / 5, 0]}>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial
          color="#f5f0e8"
          emissive="#fde68a"
          emissiveIntensity={0.08}
          roughness={0.9}
          side={2}
        />
      </mesh>
    </group>
  );
}
