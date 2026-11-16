"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { soundFX } from "@/utils/soundManager";
import { START_KINETIC_EVENT } from "./IntroOverlay";
import MiniLoop from "./jarvis/MiniLoop";

const SESSION_KEY = "studio-navya-booted";
const WORD_MS = 130;        // one word at a time
const HOLD_MS = 900;        // pause after the last word before continuing
const MAX_MS = 9000;        // safety net: never hang here
const GREETING =
  "Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta's operational intelligence. Initializing main overview...";
const WORDS = GREETING.split(" ");
const ORANGE = "#FF5A14";

/**
 * First screen of the site: a small J.A.R.V.I.S. card in the middle of the page (the page stays visible around it).
 * One tiny canvas animation loops a maroon hatched star -> pixelate -> tan pixel eye -> pixelate -> star while the
 * greeting types itself out word by word; it continues on its own when the typing finishes, or on SKIP / Esc / Enter. It then hands off to the
 * kinetic title sequence (IntroOverlay), which hands off to the site. Plays once per session.
 */
export default function JarvisBootSequence() {
  const [gate, setGate] = useState<"checking" | "show" | "hide">("checking");
  const [exiting, setExiting] = useState(false);
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

  return (
    <AnimatePresence onExitComplete={() => setGate("hide")}>
      {!exiting && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none">
          <motion.div
            role="status" aria-live="polite" aria-label="J.A.R.V.I.S. initializing"
            className="pointer-events-auto w-[264px] bg-[#0A0A0A] text-white font-mono p-3 flex flex-col items-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            style={{ border: `1px solid ${ORANGE}80` }}
            initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }} transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <MiniLoop size={240} />
            <p className="min-h-[3.6rem] w-full text-[11px] leading-relaxed text-gray-300" aria-label={GREETING}>
              <span aria-hidden>
                {WORDS.slice(0, words).join(" ")}
                <span className="inline-block w-[0.5em] h-[1em] ml-1 align-middle animate-pulse" style={{ background: ORANGE }} />
              </span>
            </p>
            <div className="w-full flex items-center justify-between text-[9px] tracking-widest" style={{ color: ORANGE }}>
              <span>J.A.R.V.I.S. v4.2</span>
              <button onClick={dismiss} className="px-3 py-1.5 text-black font-bold text-[10px] hover:bg-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" style={{ background: ORANGE }}>
                SKIP [ESC] &gt;&gt;
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
