/**
 * Core types for Presence — locked MVP
 */

export type AnimationState =
  | "IDLE_LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "TEXTING_PHONE";

export type Emotion =
  | "neutral"
  | "happy"
  | "thoughtful"
  | "curious"
  | "focused"
  | "amused";

export type ConversationMode = "voice" | "phone";

/**
 * Structured response that the Cognitive Router must always return.
 * This keeps the avatar, animation FSM, and Phone Mechanic perfectly in sync.
 */
export interface CognitiveResponse {
  mode: ConversationMode;
  emotion: Emotion;
  animationState: AnimationState;
  spokenReply: string;
  phoneMessage?: string; // Only present when mode === "phone" or when code/links are needed
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  channel: "voice" | "phone";
}
