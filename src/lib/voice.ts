/**
 * Module 3 — Voice pipeline (100% free browser APIs)
 * STT: webkitSpeechRecognition / SpeechRecognition
 * TTS: speechSynthesis with female-voice preference (matches brunette avatar)
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

/** Prefer natural female en-US voices (avatar is female). */
function pickFemaleVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = [
    /google us english female/i,
    /microsoft aria/i,
    /microsoft jenny/i,
    /microsoft zira/i,
    /samantha/i,
    /karen/i,
    /moira/i,
    /tessa/i,
    /female/i,
    /zira/i,
    /aria/i,
    /jenny/i,
  ];

  for (const re of preferred) {
    const hit = voices.find((v) => re.test(v.name) && /en/i.test(v.lang));
    if (hit) return hit;
  }

  const en = voices.filter((v) => /en/i.test(v.lang));
  const notMale = en.find(
    (v) => !/male|david|mark|guy|ryan|christopher|tony/i.test(v.name)
  );
  return notMale || en[0] || voices[0] || null;
}

function humanizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/([,;:])/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(humanizeText(text));
  utter.rate = options?.rate ?? 0.96;
  utter.pitch = options?.pitch ?? 1.08;
  utter.lang = options?.lang ?? "en-US";

  const applyVoice = () => {
    const voice = pickFemaleVoice();
    if (voice) utter.voice = voice;
  };

  applyVoice();
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.onvoiceschanged = () => {
      applyVoice();
    };
  }

  utter.onstart = () => options?.onStart?.();
  utter.onend = () => options?.onEnd?.();
  utter.onerror = () => options?.onEnd?.();

  window.setTimeout(() => {
    applyVoice();
    window.speechSynthesis.speak(utter);
  }, 40);

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

export function warmVoices() {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
