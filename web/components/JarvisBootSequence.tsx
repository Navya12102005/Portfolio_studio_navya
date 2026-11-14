"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore, type CameraDomain } from "@/lib/cameraRigStore";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import { soundFX } from "@/utils/soundManager";

const BOOT_LINE = "INITIALIZING STUDIO NAVYA OS v4.0...";
const GREETING =
  "Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta's operational intelligence. Would you like to inspect Bioengineering R&D, Tech architectures, or Growth Operations?";

const PILLS: { label: string; domain: CameraDomain }[] = [
  { label: "Bioengineering R&D", domain: "bio" },
  { label: "Tech Architectures", domain: "tech" },
  { label: "Growth Operations", domain: "ops" },
];

const SESSION_KEY = "studio-navya-booted";

type Phase = "boot-line" | "greeting";

/** Simple char-by-char typing effect, cancellable on unmount. */
function useTypewriter(text: string, active: boolean, speedMs = 18) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    // each hook instance here only ever flips inactive -> active once in
    // practice (boot-line types on mount, greeting types once the previous
    // phase finishes), so there's no stale previous run to reset first —
    // the interval's own first tick establishes the starting text/done state.
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        clearInterval(id);
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [text, active, speedMs]);

  return { out, done };
}

export default function JarvisBootSequence() {
  const [mountGate, setMountGate] = useState<"checking" | "show" | "hide">("checking");
  const [phase, setPhase] = useState<Phase>("boot-line");
  const [exiting, setExiting] = useState(false);
  const focusCamera = useCameraRigStore((s) => s.focus);
  const focusCluster = useSecondBrainStore((s) => s.focusCluster);

  // returning-visitor skip: only decided client-side, after mount, to avoid
  // an SSR/CSR mismatch — sessionStorage doesn't exist on the server, so
  // this intentionally can't be a lazy useState initializer (that would
  // run during the client's hydration render itself and mismatch the null
  // the server rendered); it must happen in a post-mount effect instead.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setMountGate(sessionStorage.getItem(SESSION_KEY) === "1" ? "hide" : "show");
    } catch {
      setMountGate("show");
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const bootLine = useTypewriter(BOOT_LINE, mountGate === "show", 22);
  const greeting = useTypewriter(GREETING, phase === "greeting", 16);

  // Arc Reactor drone while the boot overlay is up. Browsers block audio
  // before a user gesture, so this attempt on mount is often silently a
  // no-op until the visitor's first click/keypress — harmless either way.
  useEffect(() => {
    if (mountGate !== "show") return;
    soundFX.playReactorHum();
    return () => soundFX.stopReactorHum();
  }, [mountGate]);

  useEffect(() => {
    if (mountGate !== "show") return;
    if (phase === "boot-line" && bootLine.done) {
      const t = setTimeout(() => setPhase("greeting"), 300);
      return () => clearTimeout(t);
    }
  }, [mountGate, phase, bootLine.done]);

  // "ready" (pills visible) is just "greeting typed out" — derived during
  // render instead of mirrored into its own state + effect.
  const ready = phase === "greeting" && greeting.done;

  const dismiss = (domain?: CameraDomain) => {
    soundFX.playClickLock();
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* sessionStorage unavailable (private mode / disabled) — non-fatal, just replays next load */
    }
    if (domain) {
      focusCamera(domain);
      if (domain === "bio" || domain === "tech" || domain === "ops") focusCluster(domain);
    }
    setExiting(true);
  };

  useEffect(() => {
    if (mountGate !== "show") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountGate]);

  if (mountGate !== "show") return null;

  return (
    <AnimatePresence onExitComplete={() => setMountGate("hide")}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[900] bg-[#030508] flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* scanline wipe on exit */}
          <AnimatePresence>
            {exiting && (
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                style={{
                  background:
                    "repeating-linear-gradient(0deg, rgba(0,240,255,0.08) 0px, rgba(0,240,255,0.08) 2px, transparent 2px, transparent 4px), #030508",
                }}
              />
            )}
          </AnimatePresence>

          <button
            onClick={() => dismiss()}
            className="absolute top-6 right-6 sn-hud-text text-[10px] text-[var(--sn-cyan)]/60 border border-[var(--sn-cyan)]/30 rounded px-3 py-1.5 hover:text-[var(--sn-cyan)] hover:border-[var(--sn-cyan)]/60 cursor-pointer z-20"
          >
            SKIP INTRO [ESC]
          </button>

          <ArcReactorCore active />

          <div className="relative z-10 mt-10 max-w-xl px-6 text-center min-h-[7rem]">
            {phase === "boot-line" && (
              <p className="sn-hud-text text-xs md:text-sm text-[var(--sn-cyan)] tracking-widest flicker-text">
                {bootLine.out}
                <Caret />
              </p>
            )}
            {phase !== "boot-line" && (
              <p className="font-mono text-sm md:text-base text-[#dfe9ff] leading-relaxed">
                {greeting.out}
                {phase === "greeting" && <Caret />}
              </p>
            )}
          </div>

          <AnimatePresence>
            {ready && (
              <motion.div
                className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3 px-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {PILLS.map((p) => (
                  <button
                    key={p.domain}
                    onClick={() => dismiss(p.domain)}
                    onMouseEnter={() => soundFX.playHoverTick()}
                    className="sn-hud-text text-[11px] md:text-xs px-4 py-2.5 rounded-full border border-[var(--sn-cyan)]/40 text-[var(--sn-cyan)] hover:bg-[var(--sn-cyan)]/10 hover:border-[var(--sn-cyan)] transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Caret() {
  return <span className="inline-block w-[0.5em] h-[1em] bg-[var(--sn-cyan)] ml-1 align-middle animate-pulse" />;
}

/** CSS-only pulsing arc-reactor glyph — deliberately not a second WebGL
 * canvas: this overlay sits above the persistent 3D canvas, and running
 * two WebGL contexts at once is unnecessary cost and risk here. */
function ArcReactorCore({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative z-10 w-40 h-40 md:w-52 md:h-52 flex items-center justify-center">
      <div className={`absolute inset-0 rounded-full border-2 border-[var(--sn-cyan)]/50 ${active ? "reactor-ring-1" : ""}`} />
      <div className={`absolute inset-4 rounded-full border border-[#FFB800]/40 ${active ? "reactor-ring-2" : ""}`} />
      <div className={`absolute inset-10 rounded-full bg-[var(--sn-cyan)]/20 blur-xl ${active ? "reactor-pulse" : ""}`} />
      <div className="relative w-10 h-10 rounded-full bg-[var(--sn-cyan)] shadow-[0_0_40px_10px_rgba(0,240,255,0.6)]" />
    </div>
  );
}
