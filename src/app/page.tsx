"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the 3D scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-presence-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-presence-accent border-t-transparent" />
        <p className="text-sm text-presence-muted tracking-wide">
          Initializing Presence...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </main>
  );
}
