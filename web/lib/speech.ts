"use client";

/**
 * Web Speech API helpers — voice input (SpeechRecognition) and voice
 * output (SpeechSynthesis) with a British-leaning voice for the
 * J.A.R.V.I.S. persona. Every entry point feature-detects and degrades
 * to a no-op/false rather than throwing, since browser support (and
 * actual available voices) varies a lot — including headless/automated
 * environments, which commonly expose the APIs but register zero voices.
 */

type SRConstructor = new () => SpeechRecognitionLike;

// Minimal shape of the non-standard SpeechRecognition API (not in lib.dom.d.ts).
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getSRConstructor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return !!getSRConstructor();
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Starts one listening session. Resolves with the transcript, or null if
 * unsupported/errored/no speech. Never throws.
 */
export function listenOnce(): Promise<string | null> {
  return new Promise((resolve) => {
    const Ctor = getSRConstructor();
    if (!Ctor) return resolve(null);
    let settled = false;
    const done = (v: string | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    try {
      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-GB";
      rec.onresult = (e) => {
        const transcript = e.results?.[0]?.[0]?.transcript ?? null;
        done(transcript);
      };
      rec.onerror = () => done(null);
      rec.onend = () => done(null);
      rec.start();
    } catch {
      done(null);
    }
  });
}

let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedVoiceReady = false;

function pickBritishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoiceReady) return cachedVoice;
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // not loaded yet — caller may retry after the voiceschanged event
  const preferredNames = ["Daniel", "Arthur", "Google UK English Male", "Google UK English Female"];
  cachedVoice =
    voices.find((v) => preferredNames.some((n) => v.name.includes(n))) ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
  cachedVoiceReady = true;
  return cachedVoice;
}

export type SpeakHandlers = { onStart?: () => void; onEnd?: () => void };

/**
 * Speaks text with a calm, measured "J.A.R.V.I.S." inflection — British
 * voice when one is available, slightly lowered pitch/rate. No-ops
 * silently (still calling onStart/onEnd back-to-back) if unsupported or
 * no voices are registered, so UI state never gets stuck.
 */
export function speak(text: string, handlers: SpeakHandlers = {}): void {
  if (!isSpeechSynthesisSupported()) {
    handlers.onStart?.();
    handlers.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-GB";
  utter.pitch = 0.85;
  utter.rate = 0.98;
  const voice = pickBritishVoice();
  if (voice) utter.voice = voice;

  let started = false;
  let finished = false;
  const fireEnd = () => {
    if (finished) return;
    finished = true;
    handlers.onEnd?.();
  };
  utter.onstart = () => {
    started = true;
    handlers.onStart?.();
  };
  utter.onend = fireEnd;
  utter.onerror = () => {
    if (!started) {
      started = true;
      handlers.onStart?.();
    }
    fireEnd();
  };

  try {
    synth.cancel(); // don't let utterances queue up/overlap
    synth.speak(utter);
  } catch {
    handlers.onStart?.();
    fireEnd();
    return;
  }

  // Safety net: if no voices are registered (common in headless/sandboxed
  // environments — confirmed in this one), Chromium can silently never
  // fire start/end at all. Force the UI out of "speaking" after a bound
  // proportional to text length so it never gets stuck.
  const timeoutMs = Math.max(1200, text.length * 55);
  setTimeout(() => {
    if (!started) {
      started = true;
      handlers.onStart?.();
    }
    fireEnd();
  }, timeoutMs);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
