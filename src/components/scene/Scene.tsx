"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Avatar } from "@/components/avatar/Avatar";
import { StudioLighting } from "@/components/scene/StudioLighting";

export default function Scene() {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "#0a0a0f" }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.4, 2.8]} fov={35} />
        
        <Suspense fallback={null}>
          <StudioLighting />
          
          {/* Soft environment for realistic reflections */}
          <Environment preset="city" environmentIntensity={0.35} />
          
          {/* Main avatar */}
          <Avatar />
          
          {/* Ground contact shadow for grounded feel */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.45}
            scale={8}
            blur={2.5}
            far={3}
          />
        </Suspense>
      </Canvas>

      {/* Subtle UI overlay - will expand later with Phone Mechanic */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.2em] text-white/70">
            PRESENCE
          </h1>
        </div>
        
        <div className="flex justify-center">
          <p className="rounded-full bg-black/40 px-4 py-2 text-xs text-white/50 backdrop-blur-md">
            Module 1 — 3D Stage Active
          </p>
        </div>
      </div>
    </div>
  );
}
