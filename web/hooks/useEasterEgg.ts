"use client";

import { useEffect, useRef, useState } from "react";

const TARGET_KEY = "navya";

/**
 * Listens for the typed sequence "n-a-v-y-a" anywhere on the page and
 * flips `unlocked` once it's matched.
 *
 * The buffer is a ref, not a plain `let` in the hook body: a bare `let`
 * would still happen to work here (the effect's `[]` deps mean it only
 * closes over it once), but that's incidental — a ref makes the intent
 * (persistent state across keydowns, not render-visible) explicit and
 * survives even if this hook's body ever gets called more than once per
 * commit (e.g. React Strict Mode double-invocation).
 */
export function useEasterEgg() {
  const [unlocked, setUnlocked] = useState(false);
  const buffer = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      buffer.current += e.key.toLowerCase();
      if (buffer.current.length > TARGET_KEY.length) {
        buffer.current = buffer.current.slice(-TARGET_KEY.length);
      }
      if (buffer.current === TARGET_KEY) {
        setUnlocked(true);
        console.log(
          "%c[PROTOCOL 42 UNLOCKED] Startup Club President & AWS Lead Accolades Verified.",
          "color: #00F0FF; font-size: 14px; font-weight: bold;"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return unlocked;
}
