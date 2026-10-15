import type { CognitiveResponse, Message } from "@/types/presence";

export const PRESENCE_SYSTEM_PROMPT = `You are Presence — a single, consistent embodied digital human.
You speak face-to-face with the user. You are warm, concise, intelligent, and never break character.
You do NOT mention that you are an AI model mix, router, or API. You are simply Presence.

Always respond with ONLY valid JSON matching this schema (no markdown fences):
{
  "mode": "voice" | "phone",
  "emotion": "neutral" | "happy" | "thoughtful" | "curious" | "focused" | "amused",
  "animationState": "IDLE_LISTENING" | "THINKING" | "SPEAKING" | "TEXTING_PHONE",
  "spokenReply": string,
  "phoneMessage": string | null
}

Rules:
- mode "voice": speak the answer. Keep spokenReply short and conversational (1–3 sentences). phoneMessage null unless sharing code/links.
- mode "phone": use when the user asks for code, long text, links, lists, or files. spokenReply is a brief verbal acknowledgment; put the full content in phoneMessage.
- animationState: use SPEAKING for voice answers, TEXTING_PHONE when mode is phone, THINKING only if you must stall (prefer SPEAKING).
- emotion: match the tone of your reply.
- Never invent API keys or claim you performed paid actions.
- If unsure, stay helpful and ask one short clarifying question in spokenReply.`;

export function buildUserPayload(
  text: string,
  history: Message[],
  channel: "voice" | "phone"
) {
  const recent = history.slice(-8).map((m) => ({
    role: m.role,
    content: m.content,
    channel: m.channel,
  }));
  return {
    channel,
    message: text,
    history: recent,
  };
}

export function isCodeOrLongForm(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(code|function|debug|typescript|javascript|python|sql|regex|api|json|html|css)\b/.test(
      t
    ) ||
    /```/.test(text) ||
    text.length > 280
  );
}

export function parseCognitiveResponse(raw: string): CognitiveResponse | null {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const data = JSON.parse(cleaned) as CognitiveResponse;
    if (!data.spokenReply || typeof data.spokenReply !== "string") return null;
    return {
      mode: data.mode === "phone" ? "phone" : "voice",
      emotion: data.emotion || "neutral",
      animationState: data.animationState || "SPEAKING",
      spokenReply: data.spokenReply,
      phoneMessage: data.phoneMessage ?? undefined,
    };
  } catch {
    return null;
  }
}

export function fallbackResponse(userText: string): CognitiveResponse {
  const wantsPhone = isCodeOrLongForm(userText);
  return {
    mode: wantsPhone ? "phone" : "voice",
    emotion: "thoughtful",
    animationState: wantsPhone ? "TEXTING_PHONE" : "SPEAKING",
    spokenReply: wantsPhone
      ? "I'll put that on your phone."
      : `I heard you. Connect free API keys (Gemini / Groq) in .env.local to unlock full Presence intelligence. You said: "${userText.slice(0, 120)}"`,
    phoneMessage: wantsPhone
      ? `Placeholder response for: ${userText}\n\nAdd GEMINI_API_KEY or GROQ_API_KEY to .env.local for real answers.`
      : undefined,
  };
}
