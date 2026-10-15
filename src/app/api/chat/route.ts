import { NextRequest, NextResponse } from "next/server";
import type { Message } from "@/types/presence";
import {
  PRESENCE_SYSTEM_PROMPT,
  buildUserPayload,
  fallbackResponse,
  isCodeOrLongForm,
  parseCognitiveResponse,
} from "@/lib/router";

export const runtime = "nodejs";

type Body = {
  message: string;
  channel?: "voice" | "phone";
  history?: Message[];
};

async function callGemini(prompt: string, userJson: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model =
    process.env.GEMINI_MODEL || "gemini-2.0-flash" || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt}\n\nUser payload:\n${userJson}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text)
      .join("") ??
    null;
  return text;
}

async function callGroq(prompt: string, userJson: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userJson },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Groq error", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

async function callOpenRouter(
  prompt: string,
  userJson: string
): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": "Presence",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userJson },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenRouter error", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const message = (body.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const channel = body.channel === "phone" ? "phone" : "voice";
    const history = Array.isArray(body.history) ? body.history : [];
    const payload = JSON.stringify(buildUserPayload(message, history, channel));

    // Route: technical/long → OpenRouter free (if key) else Gemini; casual → Gemini then Groq
    const technical = isCodeOrLongForm(message) || channel === "phone";
    let raw: string | null = null;

    if (technical) {
      raw =
        (await callOpenRouter(PRESENCE_SYSTEM_PROMPT, payload)) ||
        (await callGemini(PRESENCE_SYSTEM_PROMPT, payload)) ||
        (await callGroq(PRESENCE_SYSTEM_PROMPT, payload));
    } else {
      raw =
        (await callGemini(PRESENCE_SYSTEM_PROMPT, payload)) ||
        (await callGroq(PRESENCE_SYSTEM_PROMPT, payload)) ||
        (await callOpenRouter(PRESENCE_SYSTEM_PROMPT, payload));
    }

    const parsed = raw ? parseCognitiveResponse(raw) : null;
    const result = parsed ?? fallbackResponse(message);

    return NextResponse.json({
      ...result,
      _meta: {
        usedFallback: !parsed,
        technical,
      },
    });
  } catch (err) {
    console.error("/api/chat", err);
    return NextResponse.json(
      fallbackResponse("Something went wrong."),
      { status: 200 }
    );
  }
}
