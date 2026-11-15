"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { soundFX } from "@/utils/soundManager";
import { START_KINETIC_EVENT } from "./IntroOverlay";

const SESSION_KEY = "studio-navya-booted";
const AUTO_MS = 3500;
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
 * First screen of the site: a short J.A.R.V.I.S. boot (ASCII eye + equalizer) that continues on its
 * own after 3.5s, or on SKIP / Esc / Enter. It then hands off to the kinetic title sequence
 * (IntroOverlay), which hands off to the site. Plays once per session.
 */
export default function JarvisBootSequence() {
  const [gate, setGate] = useState<"checking" | "show" | "hide">("checking");
  const [exiting, setExiting] = useState(false);
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

  useEffect(() => {
    if (gate !== "show" || exiting) return;
    const t = setTimeout(dismiss, AUTO_MS);
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && dismiss();
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [gate, exiting, dismiss]);

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

          <div className="flex flex-col items-center">
            <div className="relative w-64 border bg-black/40 p-4 flex flex-col items-center overflow-hidden" style={{ borderColor: ORANGE + "80", boxShadow: `0 0 20px ${ORANGE}33` }}>
              <pre aria-hidden className="text-[9px] leading-[10px] select-none tracking-tighter m-0" style={{ color: ORANGE }}>{EYE}</pre>
              <span aria-hidden className="sn-scan absolute inset-x-0 h-px" style={{ background: ORANGE }} />
              <div aria-hidden className="flex gap-1 items-end h-6 mt-3">
                {BARS.map((h, i) => (
                  <span key={i} className="sn-eq w-1" style={{ background: ORANGE, ["--h" as string]: `${h}%`, animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-300 leading-relaxed text-center max-w-lg">
              Welcome, visitor. All bio-telemetry and tech systems are online. I am J.A.R.V.I.S., Navya Gupta&apos;s operational intelligence. Initializing main overview...
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
