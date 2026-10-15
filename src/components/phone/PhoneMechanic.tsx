"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePresenceStore } from "@/lib/store";

/**
 * The Phone Mechanic — diegetic mobile chat HUD.
 * Slides up when the avatar enters TEXTING_PHONE / isPhoneOpen.
 * Shares the same conversation history as voice (unified memory).
 */
export function PhoneMechanic() {
  const isPhoneOpen = usePresenceStore((s) => s.isPhoneOpen);
  const messages = usePresenceStore((s) => s.messages);
  const closePhone = usePresenceStore((s) => s.closePhone);
  const openPhone = usePresenceStore((s) => s.openPhone);
  const addMessage = usePresenceStore((s) => s.addMessage);
  const setAnimationState = usePresenceStore((s) => s.setAnimationState);
  const setEmotion = usePresenceStore((s) => s.setEmotion);

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isPhoneOpen]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    addMessage({ role: "user", content: text, channel: "phone" });
    setDraft("");

    // Temporary local echo until Cognitive Router (Module 4) is wired
    setAnimationState("THINKING");
    setEmotion("thoughtful");

    window.setTimeout(() => {
      setAnimationState("TEXTING_PHONE");
      setEmotion("neutral");
      addMessage({
        role: "assistant",
        content:
          "Got it — the full cognitive router will answer here next. For now this is the Phone Mechanic shell.",
        channel: "phone",
      });
    }, 900);
  };

  return (
    <>
      {/* Floating phone toggle (always available) */}
      <button
        type="button"
        onClick={() => (isPhoneOpen ? closePhone() : openPhone())}
        className="pointer-events-auto absolute bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
        aria-label={isPhoneOpen ? "Close phone" : "Open phone"}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isPhoneOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isPhoneOpen && (
          <motion.div
            key="phone-drawer"
            initial={{ y: "110%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "110%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 mx-auto flex h-[58%] max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0c0c14]/95 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:h-[62%] sm:rounded-3xl"
          >
            {/* Status bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400/90" />
                <span className="text-xs font-medium tracking-wide text-white/70">
                  Presence
                </span>
              </div>
              <button
                type="button"
                onClick={closePhone}
                className="rounded-full px-2 py-1 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white/70"
              >
                Close
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <p className="pt-8 text-center text-sm text-white/30">
                  Text here when you need code, links, or a quiet reply.
                  <br />
                  <span className="text-white/20">The avatar stays in sync.</span>
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-500/90 text-white"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Message Presence…"
                  className="max-h-28 flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="rounded-xl bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition enabled:hover:bg-indigo-400 disabled:opacity-30"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
