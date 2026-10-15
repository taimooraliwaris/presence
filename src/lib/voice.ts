/**
 * Module 3 — Voice pipeline (100% free browser APIs)
 * STT: webkitSpeechRecognition / SpeechRecognition
 * TTS: speechSynthesis (Neural2/Google Cloud wired later behind same interface)
 */

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognition();
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Start push-to-talk / one-shot recognition. Returns final transcript. */
export function listenOnce(options?: {
  lang?: string;
  onInterim?: (text: string) => void;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      reject(new Error("Speech recognition is not supported in this browser."));
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options?.lang ?? "en-US";

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      if (interim && options?.onInterim) options.onInterim(interim);
    };

    recognition.onerror = (event) => {
      reject(new Error(event.error || "recognition_error"));
    };

    recognition.onend = () => {
      resolve(finalText.trim());
    };

    try {
      recognition.start();
    } catch (err) {
      reject(err);
    }
  });
}

/** Continuous recognition controller for hands-free mode */
export function createContinuousListener(handlers: {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}) {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = handlers.lang ?? "en-US";
  let active = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) handlers.onFinal(piece.trim());
      else interim += piece;
    }
    if (interim && handlers.onInterim) handlers.onInterim(interim);
  };

  recognition.onerror = (event) => {
    handlers.onError?.(event.error);
  };

  recognition.onend = () => {
    // Auto-restart while active (browser ends sessions periodically)
    if (active) {
      try {
        recognition.start();
      } catch {
        /* ignore */
      }
    }
  };

  return {
    start() {
      active = true;
      try {
        recognition.start();
      } catch {
        /* already started */
      }
    },
    stop() {
      active = false;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

/** Speak text with barge-in support (cancel ongoing utterance). */
export function speak(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
): { cancel: () => void } {
  if (!isSpeechSynthesisSupported()) {
    options?.onEnd?.();
    return { cancel: () => undefined };
  }

  // Barge-in: stop anything currently speaking
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = options?.rate ?? 1.02;
  utter.pitch = options?.pitch ?? 1;
  utter.lang = options?.lang ?? "en-US";

  utter.onstart = () => options?.onStart?.();
  utter.onend = () => options?.onEnd?.();
  utter.onerror = () => options?.onEnd?.();

  window.speechSynthesis.speak(utter);

  return {
    cancel() {
      window.speechSynthesis.cancel();
      options?.onEnd?.();
    },
  };
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
