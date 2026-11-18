"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "studio-navya-intro-seen";
export const REPLAY_INTRO_EVENT = "studio-navya:replay-intro";
export const START_KINETIC_EVENT = "studio-navya:start-kinetic";

/**
 * The kinetic title-sequence (public/intro), played right after the J.A.R.V.I.S.
 * boot intro hands off a chosen domain. Full-viewport iframe at
 * z-9999; when the first loop completes, or the visitor hits SKIP / ENTER /
 * a project tile, it slides up (0.7s, cubic-bezier(.7,0,.2,1)) to reveal the
 * site. Plays once per session; REPLAY INTRO brings it back.
 */
export default function IntroOverlay() {
  const [show, setShow] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "navya-intro-done") {
        try { sessionStorage.setItem(KEY, "1"); } catch { /* storage blocked */ }
        setShow(false);
      }
    };
    // order: J.A.R.V.I.S. boot (3 domain choices) -> this kinetic title sequence -> site
    const onStart = () => {
      try { if (sessionStorage.getItem(KEY) === "1") return; } catch { /* storage blocked */ }
      setRun((r) => r + 1); setShow(true);
    };
    const onReplay = () => { setRun((r) => r + 1); setShow(true); };
    window.addEventListener(START_KINETIC_EVENT, onStart);
    window.addEventListener("message", onMsg);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => { window.removeEventListener("message", onMsg); window.removeEventListener(REPLAY_INTRO_EVENT, onReplay); window.removeEventListener(START_KINETIC_EVENT, onStart); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={run}
          className="fixed inset-0 z-[9999] bg-black"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
        >
          <iframe src="/intro/index.html?embed" title="Navya Gupta — intro" className="h-full w-full border-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
