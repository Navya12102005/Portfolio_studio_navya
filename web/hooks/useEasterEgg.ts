"use client";

import { useEffect, useState } from "react";

const TARGET_KEY = "navya";
const CLICK_TARGET_COUNT = 5;
const CLICK_WINDOW_MS = 1500;
export const CORE_CLICK_EVENT = "studio-navya:core-click";

function unlock(setUnlocked: (v: boolean) => void) {
  setUnlocked(true);
  console.log(
    "%c[PROTOCOL 42 UNLOCKED] Startup Club President & AWS Lead Accolades Verified.",
    "color: #00F0FF; font-size: 14px; font-weight: bold;"
  );
}

/**
 * Listens for the typed sequence "n-a-v-y-a", or 5 clicks on the Arc
 * Reactor core within CLICK_WINDOW_MS, and flips `unlocked` once either
 * fires. The click trigger is a window CustomEvent (CORE_CLICK_EVENT)
 * rather than a callback this hook returns: the orb button lives in
 * JarvisAssistant, a different component from this hook's sole consumer
 * (EasterEggOverlay) — a returned callback would only ever reach whichever
 * component calls this hook, not a second independent instance of it
 * elsewhere. Dispatching a window event (the same pattern lib/pointer.ts
 * uses) lets any component trigger this one shared detector.
 */
export function useEasterEgg() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let buffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > TARGET_KEY.length) {
        buffer = buffer.slice(-TARGET_KEY.length);
      }
      if (buffer === TARGET_KEY) {
        unlock(setUnlocked);
      }
    };

    let clickTimes: number[] = [];
    const handleCoreClick = () => {
      const now = Date.now();
      clickTimes = [...clickTimes, now].filter((t) => now - t <= CLICK_WINDOW_MS);
      if (clickTimes.length >= CLICK_TARGET_COUNT) {
        clickTimes = [];
        unlock(setUnlocked);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(CORE_CLICK_EVENT, handleCoreClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(CORE_CLICK_EVENT, handleCoreClick);
    };
  }, []);

  return unlocked;
}
