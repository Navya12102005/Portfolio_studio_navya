"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { soundFX } from "@/utils/soundManager";
import { START_KINETIC_EVENT } from "./IntroOverlay";
import MiniLoop from "./jarvis/MiniLoop";

const SESSION_KEY = "studio-navya-booted";
const WORD_MS = 175;        // one word at a time
const HOLD_MS = 5000;       // the finished line stays up this long so it can be read
const MAX_MS = 14000;       // safety net: never hang here
const GREETING =
  "Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta's operational intelligence. Initializing main overview...";
const WORDS = GREETING.split(" ");
const ORANGE = "#FF5A14";
/**
 * First screen of the site: a J.A.R.V.I.S. boot. The centre is one small looping canvas animation (a hatched star
 * that pixelates into a pixel-grid eye and back) while the greeting types itself out word by word underneath;
 * it continues on its own when the typing finishes, or on SKIP / Esc / Enter. It then hands off to the kinetic title sequence
 * (IntroOverlay), which hands off to the site. Plays once per session.
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
        <motion.div
          role="status" aria-live="polite" aria-label="J.A.R.V.I.S. initializing"
          className="fixed inset-0 z-[900] bg-[#0A0A0A] text-white font-mono flex flex-col items-center justify-between p-6 md:p-8"
          style={{ border: `1px solid ${ORANGE}4D` }}
          exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <span aria-hidden />

          <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              <div className="p-2 border" style={{ borderColor: ORANGE + "80", boxShadow: `0 0 30px ${ORANGE}40`, background: "#000000" }}>
                <MiniLoop size={260} />
              </div>
            </div>

            <p className="mt-4 min-h-[5.5rem] text-sm md:text-base text-gray-300 leading-relaxed text-center max-w-xl" aria-label={GREETING}>
              <span aria-hidden>
                {WORDS.slice(0, words).join(" ")}
                <span className="inline-block w-[0.5em] h-[1em] ml-1 align-middle animate-pulse" style={{ background: ORANGE }} />
              </span>
            </p>
          </div>

          <div className="w-full flex justify-between items-end text-[10px] text-gray-500">
            <button onClick={dismiss} className="ml-auto px-4 py-2 text-black font-bold text-xs hover:bg-white transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" style={{ background: ORANGE }}>
              [ SKIP INTRO ] &gt;&gt;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
