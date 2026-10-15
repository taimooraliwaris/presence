import type { CognitiveResponse, Message } from "@/types/presence";
import { fallbackResponse } from "@/lib/router";

export async function askPresence(
  message: string,
  options: {
    channel: "voice" | "phone";
    history: Message[];
  }
): Promise<CognitiveResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        channel: options.channel,
        history: options.history,
      }),
    });
    if (!res.ok) return fallbackResponse(message);
    const data = (await res.json()) as CognitiveResponse;
    if (!data.spokenReply) return fallbackResponse(message);
    return data;
  } catch {
    return fallbackResponse(message);
  }
}
