"use client";

/**
 * Studio lighting tuned for the physical set (floor + cyclorama + softboxes).
 */
export function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#e8eaf6" />

      {/* Key — warm, upper right */}
      <directionalLight
        position={[2.8, 4.5, 2.2]}
        intensity={1.25}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />

      {/* Fill — cool left */}
      <directionalLight
        position={[-2.8, 2.2, 1.5]}
        intensity={0.55}
        color="#dbe4ff"
      />

      {/* Rim from behind */}
      <spotLight
        position={[0, 2.8, -2.2]}
        intensity={0.7}
        color="#a5b4fc"
        angle={0.7}
        penumbra={0.85}
      />

      {/* Soft top fill */}
      <pointLight position={[0, 3.2, 0.5]} intensity={0.25} color="#ffffff" />

      <hemisphereLight
        intensity={0.28}
        color="#eef0ff"
        groundColor="#1a1a24"
      />
    </>
  );
}
