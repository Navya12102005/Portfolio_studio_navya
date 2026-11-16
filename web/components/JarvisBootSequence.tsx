"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { soundFX } from "@/utils/soundManager";
import { START_KINETIC_EVENT } from "./IntroOverlay";
import DualScene from "./jarvis/DualScene";

const SESSION_KEY = "studio-navya-booted";
const WORD_MS = 190;        // one word at a time (slow enough for several scene switches)
const HOLD_MS = 900;        // pause after the last word before continuing
const MAX_MS = 12000;       // safety net: never hang here
const GREETING =
  "Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta's operational intelligence. Initializing main overview...";
const WORDS = GREETING.split(" ");
const ORANGE = "#FF5A14";

/** Overlay colours follow whichever scene is on screen (0 = maroon CORE STABILITY, 1 = tan pixel eye). */
const SKIN = [
  { bg: "#251212", fg: "#E9DDCB", sub: "#E9DDCB99", chrome: ORANGE },
  { bg: "#BAB19F", fg: "#1C1A17", sub: "#1C1A17B3", chrome: "#1C1A17" },
] as const;

/**
 * First screen of the site: a J.A.R.V.I.S. boot. Two canvas HUD scenes (a maroon CORE STABILITY panel and a
 * tan pixel-grid eye) keep switching with a glitch cut while the greeting types itself out word by word;
 * it continues on its own when the typing finishes, or on SKIP / Esc / Enter. It then hands off to the
 * kinetic title sequence (IntroOverlay), which hands off to the site. Plays once per session.
 */
export default function JarvisBootSequence() {
  const [gate, setGate] = useState<"checking" | "show" | "hide">("checking");
  const [exiting, setExiting] = useState(false);
  const [scene, setScene] = useState<0 | 1>(0);
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
  const k = SKIN[scene];

  return (
    <AnimatePresence onExitComplete={() => setGate("hide")}>
      {!exiting && (
        <motion.div
          role="status" aria-live="polite" aria-label="J.A.R.V.I.S. initializing"
          className="fixed inset-0 z-[900] font-mono flex flex-col items-center justify-between gap-2 p-4 md:p-8"
          style={{ background: k.bg, color: k.fg, border: `1px solid ${k.chrome}4D` }}
          exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="w-full flex justify-between gap-4 text-[10px] md:text-xs tracking-widest" style={{ color: k.chrome }}>
            <span>CORE STABILITY // SYNC 99% TEMP 37C</span>
            <span className="hidden sm:inline">J.A.R.V.I.S. v4.2 // NAVYA.AI</span>
          </div>

          <div className="flex-1 min-h-0 w-full max-w-5xl grid grid-rows-[minmax(0,1fr)_auto] lg:grid-rows-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-3 lg:gap-10">
            <div className="hidden lg:block" aria-hidden />
            <div className="h-full min-h-0 flex justify-center"><DualScene onScene={setScene} running /></div>
            <p className="min-h-[4.6rem] lg:min-h-0 text-xs md:text-sm leading-relaxed text-center lg:text-left max-w-xl lg:max-w-[22rem] mx-auto lg:mx-0" style={{ color: k.sub }} aria-label={GREETING}>
              <span aria-hidden>
                {WORDS.slice(0, words).join(" ")}
                <span className="inline-block w-[0.5em] h-[1em] ml-1 align-middle animate-pulse" style={{ background: k.chrome }} />
              </span>
            </p>
          </div>

          <div className="w-full flex justify-between items-end text-[10px]" style={{ color: k.sub }}>
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
