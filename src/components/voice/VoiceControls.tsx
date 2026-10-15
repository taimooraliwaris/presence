"use client";

import { useCallback, useRef, useState } from "react";
import { usePresenceStore } from "@/lib/store";
import {
  cancelSpeech,
  isSpeechRecognitionSupported,
  listenOnce,
  speak,
} from "@/lib/voice";
import { setProceduralSpeaking } from "@/lib/lipsync";
import { askPresence } from "@/lib/chat-client";

export function VoiceControls() {
  const [supported] = useState(() => isSpeechRecognitionSupported());
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const cancelRef = useRef<{ cancel: () => void } | null>(null);

  const addMessage = usePresenceStore((s) => s.addMessage);
  const messages = usePresenceStore((s) => s.messages);
  const setAnimationState = usePresenceStore((s) => s.setAnimationState);
  const setEmotion = usePresenceStore((s) => s.setEmotion);
  const setListeningStore = usePresenceStore((s) => s.setListening);
  const setSpeaking = usePresenceStore((s) => s.setSpeaking);
  const openPhone = usePresenceStore((s) => s.openPhone);
  const isPhoneOpen = usePresenceStore((s) => s.isPhoneOpen);

  const handleReply = useCallback(
    async (userText: string) => {
      addMessage({ role: "user", content: userText, channel: "voice" });
      setAnimationState("THINKING");
      setEmotion("thoughtful");

      const history = usePresenceStore.getState().messages;
      const response = await askPresence(userText, {
        channel: "voice",
        history,
      });

      setEmotion(response.emotion);
      setAnimationState(response.animationState);

      if (response.mode === "phone" || response.phoneMessage) {
        openPhone();
        if (response.phoneMessage) {
          addMessage({
            role: "assistant",
            content: response.phoneMessage,
            channel: "phone",
          });
        }
      }

      const spoken = response.spokenReply;
      setSpeaking(true);
      setProceduralSpeaking(true);
      setAnimationState(
        response.mode === "phone" ? "TEXTING_PHONE" : "SPEAKING"
      );

      cancelRef.current = speak(spoken, {
        onStart: () => {
          setSpeaking(true);
          setProceduralSpeaking(true);
        },
        onEnd: () => {
          setSpeaking(false);
          setProceduralSpeaking(false);
          if (response.mode !== "phone") {
            setAnimationState("IDLE_LISTENING");
          }
          addMessage({
            role: "assistant",
            content: spoken,
            channel: "voice",
          });
        },
      });
    },
    [
      addMessage,
      openPhone,
      setAnimationState,
      setEmotion,
      setSpeaking,
    ]
  );

  const startListening = async () => {
    if (!supported || listening) return;

    cancelRef.current?.cancel();
    cancelSpeech();
    setProceduralSpeaking(false);
    setSpeaking(false);

    setListening(true);
    setListeningStore(true);
    setAnimationState("IDLE_LISTENING");
    setInterim("");

    try {
      const text = await listenOnce({
        onInterim: (t) => setInterim(t),
      });
      setInterim("");
      if (text) await handleReply(text);
    } catch {
      setInterim("");
    } finally {
      setListening(false);
      setListeningStore(false);
    }
  };

  if (isPhoneOpen) return null;

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3">
      {interim && (
        <p className="max-w-xs rounded-full bg-black/60 px-4 py-1.5 text-center text-xs text-white/70 backdrop-blur-md">
          {interim}
        </p>
      )}

      <button
        type="button"
        onMouseDown={startListening}
        onTouchStart={(e) => {
          e.preventDefault();
          startListening();
        }}
        disabled={!supported || listening}
        className={`flex h-16 w-16 items-center justify-center rounded-full border shadow-xl transition ${
          listening
            ? "scale-110 border-red-400/60 bg-red-500/90 text-white"
            : "border-white/20 bg-white/10 text-white hover:bg-white/20"
        } disabled:opacity-40`}
        aria-label="Push to talk"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>

      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
        {supported
          ? listening
            ? "Listening…"
            : "Hold to talk"
          : "Voice unsupported"}
      </p>
    </div>
  );
}
