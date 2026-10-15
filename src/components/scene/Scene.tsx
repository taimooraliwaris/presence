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
import { PhoneMechanic } from "@/components/phone/PhoneMechanic";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { usePresenceStore } from "@/lib/store";

function StatusChip() {
  const animationState = usePresenceStore((s) => s.animationState);
  const emotion = usePresenceStore((s) => s.emotion);
  const isPhoneOpen = usePresenceStore((s) => s.isPhoneOpen);
  const isListening = usePresenceStore((s) => s.isListening);
  const isSpeaking = usePresenceStore((s) => s.isSpeaking);

  const label = isPhoneOpen
    ? "TEXTING_PHONE"
    : isListening
      ? "LISTENING"
      : isSpeaking
        ? "SPEAKING"
        : animationState.replace(/_/g, " ");

  return (
    <p className="rounded-full bg-black/50 px-4 py-2 text-xs text-white/45 backdrop-blur-md">
      {label}
      <span className="mx-2 text-white/20">·</span>
      {emotion}
    </p>
  );
}

export default function Scene() {
  return (
    <div className="relative h-full w-full">
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

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.22em] text-white/60">
            PRESENCE
          </h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-white/40">
            Module 3
          </span>
        </div>

        <div className="flex justify-center pb-28">
          <StatusChip />
        </div>
      </div>

      <VoiceControls />
      <PhoneMechanic />
    </div>
  );
}
