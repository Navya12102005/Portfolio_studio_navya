"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { soundFX } from "@/utils/soundManager";
import { START_KINETIC_EVENT } from "./IntroOverlay";

const SESSION_KEY = "studio-navya-booted";
const PHASE_MS = 1600;      // eye <-> kinetic type switch
const WORD_MS = 120;        // one word at a time
const HOLD_MS = 900;        // pause after the last word before continuing
const MAX_MS = 9000;        // safety net: never hang here
const GREETING =
  "Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta's operational intelligence. Initializing main overview...";
const WORDS = GREETING.split(" ");
const MARQUEE = ["NAVYA GUPTA", "STUDIO NAVYA", "BIOENGINEERING", "AI × MEDTECH"];
const ORANGE = "#FF5A14";
const W = 24;

/** Builds one row of the ASCII eye at an exact fixed width, so the box can never drift out of alignment. */
const mk = (core: string, edge: number) => {
  const s = core.padStart(Math.floor((W + core.length) / 2), "░").padEnd(W, "░");
  return "▒".repeat(edge) + s.slice(edge, W - edge) + "▒".repeat(edge);
};
const EYE = [
  `┌${"─".repeat(W)}┐`,
  `│${"▒".repeat(5)}${"░".repeat(W - 10)}${"▒".repeat(5)}│`,
  `│${mk("[  O  ]", 2)}│`,
  `│${mk("█████████", 1)}│`,
  `│${mk("███▓▓▓███", 0)}│`,
  `│${mk("█████████", 1)}│`,
  `│${mk("[  .  ]", 2)}│`,
  `│${"▒".repeat(5)}${"░".repeat(W - 10)}${"▒".repeat(5)}│`,
  `└${"─".repeat(W)}┘`,
].join("\n");

const BARS = [40, 70, 30, 90, 50, 80, 60, 100, 45, 75];

/**
 * First screen of the site: a J.A.R.V.I.S. boot. The centre alternates between the ASCII eye + equalizer
 * and a kinetic-type marquee every 1.6s while the greeting types itself out word by word underneath;
 * it continues on its own when the typing finishes, or on SKIP / Esc / Enter. It then hands off to the kinetic title sequence
 * (IntroOverlay), which hands off to the site. Plays once per session.
 */
export default function JarvisBootSequence() {
  const [gate, setGate] = useState<"checking" | "show" | "hide">("checking");
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState<"eye" | "type">("eye");
  const [words, setWords] = useState(0);
  const focusCamera = useCameraRigStore((s) => s.focus);

  // sessionStorage only exists in the browser, so this has to be decided after mount (a lazy initializer
  // would run during hydration and mismatch the server's empty render).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setGate(sessionStorage.getItem(SESSION_KEY) === "1" ? "hide" : "show");
    } catch {
      setGate("show");
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dismiss = useCallback(() => {
    soundFX.playClickLock();
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* storage blocked: just replays next load */ }
    focusCamera("home");
    window.dispatchEvent(new Event(START_KINETIC_EVENT));
    setExiting(true);
  }, [focusCamera]);

  // skip keys + safety timeout
  useEffect(() => {
    if (gate !== "show" || exiting) return;
    const t = setTimeout(dismiss, MAX_MS);
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && dismiss();
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [gate, exiting, dismiss]);

  // eye <-> kinetic type
  useEffect(() => {
    if (gate !== "show" || exiting) return;
    const iv = setInterval(() => setPhase((p) => (p === "eye" ? "type" : "eye")), PHASE_MS);
    return () => clearInterval(iv);
  }, [gate, exiting]);

  // typing, one word after another; continue shortly after the last word lands
  useEffect(() => {
    if (gate !== "show" || exiting) return;
    if (words >= WORDS.length) {
      const t = setTimeout(dismiss, HOLD_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setWords((w) => w + 1), WORD_MS);
    return () => clearTimeout(t);
  }, [gate, exiting, words, dismiss]);

  if (gate !== "show") return null;

  return (
    <AnimatePresence onExitComplete={() => setGate("hide")}>
      {!exiting && (
        <motion.div
          role="status" aria-live="polite" aria-label="J.A.R.V.I.S. initializing"
          className="fixed inset-0 z-[900] bg-[#0A0A0A] text-white font-mono flex flex-col items-center justify-between p-6 md:p-8"
          style={{ border: `1px solid ${ORANGE}4D` }}
          exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-full flex justify-between gap-4 text-[10px] md:text-xs tracking-widest" style={{ color: ORANGE }}>
            <span>CORE STABILITY // SYNC 99% TEMP 37C</span>
            <span className="hidden sm:inline">J.A.R.V.I.S. v4.2 // NAVYA.AI</span>
          </div>

          <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="relative w-full h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === "eye" ? (
                  <motion.div key="eye" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                    <div className="relative w-52 border bg-black/60 p-4 flex flex-col items-center overflow-hidden" style={{ borderColor: ORANGE + "80", boxShadow: `0 0 30px ${ORANGE}40` }}>
                      <pre aria-hidden className="text-[9px] leading-[10px] select-none tracking-tighter m-0" style={{ color: ORANGE }}>{EYE}</pre>
                      <span aria-hidden className="sn-scan absolute inset-x-0 h-px" style={{ background: ORANGE }} />
                      <div aria-hidden className="flex gap-1.5 items-end h-6 mt-4">
                        {BARS.map((h, i) => (
                          <span key={i} className="sn-eq w-1" style={{ background: ORANGE, ["--h" as string]: `${h}%`, animationDelay: `${i * 0.04}s` }} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-xs tracking-widest uppercase" style={{ color: ORANGE }}>[ J.A.R.V.I.S. BIO-TELEMETRY ACTIVE ]</p>
                  </motion.div>
                ) : (
                  <motion.div key="type" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}
                    className="flex flex-col items-center w-full overflow-hidden py-10 border" style={{ background: ORANGE + "1A", borderColor: ORANGE + "66" }}>
                    <div aria-hidden className="overflow-hidden w-full">
                      <div className="sn-marquee" style={{ color: ORANGE }}>
                        {[0, 1].map((k) => (
                          <div key={k} className="flex gap-8 pr-8 text-4xl md:text-6xl font-anton uppercase tracking-tight whitespace-nowrap">
                            {MARQUEE.map((m) => (<span key={`${k}${m}`}>{m} <span className="opacity-50">{"//"}</span></span>))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-white tracking-widest uppercase font-bold">[ KINETIC TYPOGRAPHY OVERRIDE ]</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-4 min-h-[5.5rem] text-sm md:text-base text-gray-300 leading-relaxed text-center max-w-xl" aria-label={GREETING}>
              <span aria-hidden>
                {WORDS.slice(0, words).join(" ")}
                <span className="inline-block w-[0.5em] h-[1em] ml-1 align-middle animate-pulse" style={{ background: ORANGE }} />
              </span>
            </p>
          </div>

          <div className="w-full flex justify-between items-end text-[10px] text-gray-500">
            <div aria-hidden className="opacity-70 hidden sm:block">
              0486.362.182.457.324 | 8034.688.048.740.122<br />
              0782.238.284.615.158 | 0812.088.013.132.872
            </div>
            <button onClick={dismiss} className="ml-auto px-4 py-2 text-black font-bold text-xs hover:bg-white transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" style={{ background: ORANGE }}>
              [ SKIP INTRO ] &gt;&gt;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
