"use client";

import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 2.2;

function distance(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Two-finger pinch-to-zoom for an element. Returns a callback ref to
 * attach and the current CSS scale (1..MAX_SCALE) to apply via a
 * transform — kept as plain state rather than mutating style directly so
 * React stays the source of truth and other logic (e.g. "reset on close")
 * stays simple.
 *
 * A callback ref (not a plain RefObject + `useEffect(..., [])`) because
 * the target element is conditionally mounted (e.g. ProjectModal's
 * content area only exists while the modal is open) — a plain ref would
 * attach to `null` on first render and never retry once it mounts.
 */
export function usePinchZoom<T extends HTMLElement>() {
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const startDist = useRef<number | null>(null);
  const startScale = useRef(1);

  const setRef = useCallback((el: T | null) => {
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist.current = distance(e.touches[0], e.touches[1]);
        startScale.current = scaleRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && startDist.current) {
        e.preventDefault(); // stop the page from scrolling while pinching
        const d = distance(e.touches[0], e.touches[1]);
        const next = startScale.current * (d / startDist.current);
        setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) startDist.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const reset = () => setScale(1);

  return { ref: setRef, scale, reset };
}
