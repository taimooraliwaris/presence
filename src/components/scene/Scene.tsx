"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  Environment,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { Avatar } from "@/components/avatar/Avatar";
import { StudioLighting } from "@/components/scene/StudioLighting";

export default function Scene() {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "#0a0a0f" }}
      >
        {/* Tighter medium close-up framing on face / upper torso */}
        <PerspectiveCamera
          makeDefault
          position={[0, 1.55, 2.15]}
          fov={32}
          near={0.1}
          far={50}
        />

        <Suspense fallback={null}>
          <StudioLighting />
          <Environment preset="city" environmentIntensity={0.32} />
          <Avatar />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={6}
            blur={2.2}
            far={2.5}
          />
        </Suspense>
      </Canvas>

      {/* Minimal chrome — expands later with Phone Mechanic */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.22em] text-white/60">
            PRESENCE
          </h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-white/40">
            Module 1
          </span>
        </div>

        <div className="flex justify-center">
          <p className="rounded-full bg-black/50 px-4 py-2 text-xs text-white/45 backdrop-blur-md">
            Idle · Eye-blink · Emotion morphs active
          </p>
        </div>
      </div>
    </div>
  );
}
