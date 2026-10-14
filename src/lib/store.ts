import { create } from "zustand";
import type { AnimationState, Emotion, ConversationMode, Message } from "@/types/presence";

interface PresenceState {
  // Avatar state
  animationState: AnimationState;
  emotion: Emotion;
  isListening: boolean;
  isSpeaking: boolean;

  // Communication mode
  mode: ConversationMode;
  isPhoneOpen: boolean;

  // Conversation
  messages: Message[];

  // Actions
  setAnimationState: (state: AnimationState) => void;
  setEmotion: (emotion: Emotion) => void;
  setListening: (value: boolean) => void;
  setSpeaking: (value: boolean) => void;
  openPhone: () => void;
  closePhone: () => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  animationState: "IDLE_LISTENING",
  emotion: "neutral",
  isListening: false,
  isSpeaking: false,
  mode: "voice",
  isPhoneOpen: false,
  messages: [],

  setAnimationState: (animationState) => set({ animationState }),
  setEmotion: (emotion) => set({ emotion }),
  setListening: (isListening) => set({ isListening }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),

  openPhone: () =>
    set({
      isPhoneOpen: true,
      mode: "phone",
      animationState: "TEXTING_PHONE",
    }),

  closePhone: () =>
    set({
      isPhoneOpen: false,
      mode: "voice",
      animationState: "IDLE_LISTENING",
    }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),

  reset: () =>
    set({
      animationState: "IDLE_LISTENING",
      emotion: "neutral",
      isListening: false,
      isSpeaking: false,
      mode: "voice",
      isPhoneOpen: false,
      messages: [],
    }),
}));
