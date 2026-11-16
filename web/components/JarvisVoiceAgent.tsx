"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { isSpeechRecognitionSupported, speak, stopSpeaking } from "@/lib/speech";
import { START_KINETIC_EVENT } from "./IntroOverlay";

type JState = "IDLE" | "LISTENING" | "PROCESSING" | "SPEAKING";
type Turn = { role: "user" | "model"; text: string };

// Minimal shape of the non-standard SpeechRecognition API (not in lib.dom.d.ts).
interface Recognizer {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognizerCtor = new () => Recognizer;
type AudioCtor = typeof AudioContext;

const BOOT_KEY = "studio-navya-booted";
const CYAN = "#00F0FF", AMBER = "#FFB800";
const BARS = 44, SIZE = 108;
const LABEL: Record<JState, string> = { IDLE: "PRESS V OR TAP TO TALK", LISTENING: "LISTENING…", PROCESSING: "PROCESSING…", SPEAKING: "SPEAKING…" };

/**
 * Floating voice assistant. Speech-to-text and text-to-speech run in the browser (Web Speech API); /api/jarvis-voice
 * answers with Gemini, falling back to a local answer. Press V (when not typing) to talk, press it again to send.
 * The mic is closed before J.A.R.V.I.S. speaks and only reopens on the next press, so it can't hear itself.
 * The ring is drawn on a canvas and driven by refs, so audio levels never re-render React.
 */
export default function JarvisVoiceAgent() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<JState>("IDLE");
  const [open, setOpen] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const [typed, setTyped] = useState("");
  const [srOk, setSrOk] = useState(true);

  const stateRef = useRef<JState>("IDLE");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<Recognizer | null>(null);
  const finalRef = useRef("");
  const heardErrRef = useRef("");
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<Turn[]>([]);

  const go = useCallback((s: JState) => { stateRef.current = s; setState(s); }, []);

  // Browser-only facts (sessionStorage, SpeechRecognition) can only be read after mount, or hydration would mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try { setReady(sessionStorage.getItem(BOOT_KEY) === "1"); } catch { setReady(true); }
    setSrOk(isSpeechRecognitionSupported());
    window.speechSynthesis?.getVoices(); // warm the voice list so the British voice is found on first reply
    const show = () => setReady(true);
    window.addEventListener(START_KINETIC_EVENT, show);
    return () => window.removeEventListener(START_KINETIC_EVENT, show);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const closeMeter = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null; analyserRef.current = null; levelRef.current = 0;
  }, []);

  const submit = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) { setNotice("I didn't catch that. Try again?"); go("IDLE"); return; }
    setHeard(text); setReply(""); setNotice(""); go("PROCESSING"); setOpen(true);
    abortRef.current?.abort();
    const ctl = new AbortController(); abortRef.current = ctl;
    let out = "I couldn't reach my systems just now. Please try again, or email hello.studionavya@gmail.com.";
    try {
      const res = await fetch("/api/jarvis-voice", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal, body: JSON.stringify({ text, history: historyRef.current }) });
      const data = await res.json().catch(() => null);
      if (res.ok && typeof data?.reply === "string" && data.reply) out = data.reply;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // cancelled by the visitor
    }
    historyRef.current = [...historyRef.current, { role: "user" as const, text }, { role: "model" as const, text: out }].slice(-8);
    setReply(out);
    speak(out, { onStart: () => { if (stateRef.current === "PROCESSING") go("SPEAKING"); }, onEnd: () => { if (stateRef.current === "SPEAKING" || stateRef.current === "PROCESSING") go("IDLE"); } });
  }, [go]);

  const cancel = useCallback(() => {
    stateRef.current = "IDLE"; // set first so a recognizer's onend can't submit
    recRef.current?.abort(); recRef.current = null;
    abortRef.current?.abort(); stopSpeaking(); closeMeter(); go("IDLE");
  }, [closeMeter, go]);

  const startListening = useCallback(async () => {
    if (stateRef.current !== "IDLE") return;
    stopSpeaking(); setOpen(true); setNotice(""); setHeard(""); setReply(""); finalRef.current = ""; heardErrRef.current = "";
    const Ctor = (window as unknown as { SpeechRecognition?: RecognizerCtor; webkitSpeechRecognition?: RecognizerCtor });
    const SR = Ctor.SpeechRecognition || Ctor.webkitSpeechRecognition;
    if (!SR) { setNotice("Voice input isn't supported in this browser. Type below instead."); setTimeout(() => inputRef.current?.focus(), 0); return; }
    go("LISTENING");
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = "en-IN";
    rec.onresult = (e) => { const t = Array.from(e.results).map((r) => r[0].transcript).join(" ").trim(); finalRef.current = t; setHeard(t); };
    rec.onerror = (e) => { heardErrRef.current = e.error; };
    rec.onend = () => {
      recRef.current = null; closeMeter();
      if (stateRef.current !== "LISTENING") return;
      const err = heardErrRef.current;
      if (err === "not-allowed" || err === "service-not-allowed") { setNotice("Microphone access is blocked. Allow it in your browser, or type below."); go("IDLE"); return; }
      if (err && err !== "no-speech" && err !== "aborted") { setNotice("Voice input hit a snag. Try again, or type below."); go("IDLE"); return; }
      void submit(finalRef.current);
    };
    recRef.current = rec;
    try { rec.start(); } catch { recRef.current = null; setNotice("Couldn't start the microphone."); go("IDLE"); return; }
    // optional level meter for the ring; the ring falls back to a simulated wave if this isn't granted
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if ((stateRef.current as JState) !== "LISTENING") { stream.getTracks().forEach((t) => t.stop()); return; } // may have changed during the await
      const AC: AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
      const ac = new AC(); const an = ac.createAnalyser(); an.fftSize = 128;
      ac.createMediaStreamSource(stream).connect(an);
      streamRef.current = stream; audioCtxRef.current = ac; analyserRef.current = an;
    } catch { /* simulated level */ }
  }, [closeMeter, go, submit]);

  const toggle = useCallback(() => {
    const s = stateRef.current;
    if (s === "IDLE") void startListening();
    else if (s === "LISTENING") recRef.current?.stop(); // onend sends what was heard
    else cancel();
  }, [cancel, startListening]);

  // V toggles (never while typing, with modifiers, or during the intro); Esc closes
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "Escape" && (open || stateRef.current !== "IDLE")) { cancel(); setOpen(false); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.key.toLowerCase() !== "v") return;
      if (document.querySelector('iframe[src*="intro"]')) return;
      e.preventDefault(); toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, open, cancel, toggle]);

  useEffect(() => () => { stateRef.current = "IDLE"; recRef.current?.abort(); abortRef.current?.abort(); stopSpeaking(); closeMeter(); }, [closeMeter]);

  // the arc-reactor ring
  useEffect(() => {
    const cv = canvasRef.current;
    if (!ready || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.height = Math.round(SIZE * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    const data = new Uint8Array(64);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = reduce ? 0 : now / 1000, s = stateRef.current, c = SIZE / 2;
      ctx.clearRect(0, 0, SIZE, SIZE);
      const an = analyserRef.current;
      if (an) { an.getByteFrequencyData(data); let sum = 0; for (let i = 0; i < 24; i++) sum += data[i]; levelRef.current += ((sum / 24 / 255) - levelRef.current) * 0.3; }
      const color = s === "PROCESSING" ? AMBER : CYAN;
      ctx.lineCap = "round"; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = s === "IDLE" ? 4 : 10;
      // soft base ring
      ctx.globalAlpha = s === "IDLE" ? 0.35 + 0.15 * Math.sin(t * 1.6) : 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(c, c, 33, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      if (s === "PROCESSING") {
        ctx.lineWidth = 3;
        for (let k = 0; k < 3; k++) { const a0 = t * 3 + (k * Math.PI * 2) / 3; ctx.beginPath(); ctx.arc(c, c, 38, a0, a0 + 0.9); ctx.stroke(); }
      } else {
        ctx.lineWidth = 2.2;
        for (let i = 0; i < BARS; i++) {
          const a = (i / BARS) * Math.PI * 2 - Math.PI / 2;
          let amp: number;
          if (s === "LISTENING") amp = an ? (data[Math.floor((i / BARS) * 32)] / 255) * 0.9 + levelRef.current * 0.3 : 0.25 + 0.25 * Math.abs(Math.sin(t * 5 + i * 0.7));
          else if (s === "SPEAKING") amp = 0.2 + 0.35 * Math.abs(Math.sin(t * 6 + i * 0.5) * Math.cos(t * 2.3 + i * 0.2));
          else amp = 0.05 + 0.04 * Math.sin(t * 1.4 + i * 0.4);
          const r0 = 37, r1 = r0 + 3 + amp * 14;
          ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [ready, reduce]);

  const onType = (e: React.FormEvent) => {
    e.preventDefault();
    const v = typed.trim();
    if (!v) return;
    setTyped("");
    if (stateRef.current !== "IDLE") cancel();
    void submit(v);
  };

  if (!ready) return null;
  const active = state !== "IDLE";

  return (
    <div className="fixed bottom-[88px] right-2 z-50 flex flex-col items-end font-mono select-none">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }} transition={{ duration: 0.2 }}
            className="mr-2 mb-1 w-[min(92vw,21rem)] rounded-xl border border-cyan-500/30 bg-[#030508]/90 p-4 text-xs text-white shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="tracking-[0.16em]" style={{ color: state === "PROCESSING" ? AMBER : CYAN }} aria-live="polite">{LABEL[state]}</span>
              <button type="button" onClick={() => { cancel(); setOpen(false); }} aria-label="Close J.A.R.V.I.S." className="px-1 text-neutral-400 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-400">✕</button>
            </div>
            <div className="mt-3 space-y-2 leading-relaxed" aria-live="polite">
              {heard && <p className="text-neutral-400"><span className="text-neutral-500">YOU ▸ </span>{heard}</p>}
              {reply && <p className="text-cyan-300"><span className="text-cyan-600">J.A.R.V.I.S. ▸ </span>{reply}</p>}
              {notice && <p className="text-amber-400">{notice}</p>}
              {!heard && !reply && !notice && <p className="text-neutral-500">{srOk ? "Ask about Navya, her projects or services." : "Voice input isn't available here. Type a question below."}</p>}
            </div>
            <form onSubmit={onType} className="mt-3 flex gap-2">
              <input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="…or type a question" maxLength={300} aria-label="Type a question for J.A.R.V.I.S."
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-neutral-600 focus:border-cyan-500/60 focus:outline-none" />
              <button type="submit" className="rounded-md border border-cyan-500/40 px-3 text-cyan-300 hover:bg-cyan-500/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-400">SEND</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <canvas ref={canvasRef} aria-hidden style={{ width: SIZE, height: SIZE }} className="pointer-events-none absolute inset-0" />
        <button type="button" onClick={toggle} aria-pressed={active}
          aria-label={state === "IDLE" ? "Talk to J.A.R.V.I.S. (shortcut: V)" : state === "LISTENING" ? "Stop listening and send" : "Cancel"}
          className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
            active ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_26px_rgba(0,240,255,0.7)]" : "border-cyan-500/30 bg-[#030508]/90 text-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.35)]"}`}>
          {state === "LISTENING" ? <span className="h-3.5 w-3.5 rounded-sm bg-black" /> : state === "PROCESSING" ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" /> : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm6-3a6 6 0 01-12 0m6 6v3m-3 0h6" /></svg>)}
        </button>
      </div>
    </div>
  );
}
