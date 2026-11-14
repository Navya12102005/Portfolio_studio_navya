"use client";

import { useCallback, useRef } from "react";

type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
};

const THRESHOLD_PX = 50;
const MAX_OFF_AXIS_RATIO = 0.6; // keeps a mostly-horizontal swipe from also firing vertical, and vice versa

/**
 * Attaches touch-swipe detection to a ref'd element. Single-finger only
 * (two-finger gestures are reserved for pinch-to-zoom — see usePinchZoom).
 *
 * Returns a callback ref, not a plain RefObject: the target element here
 * (e.g. ProjectModal's drawer) is conditionally mounted by AnimatePresence,
 * so a plain-ref + `useEffect(..., [])` would attach to `null` on first
 * render (before anything is open) and never retry once the element
 * actually mounts. A callback ref re-runs on every mount/unmount instead.
 */
export function useSwipe<T extends HTMLElement>(handlers: SwipeHandlers) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // React 19 callback refs may return a cleanup function, called on unmount —
  // exactly the native-listener teardown this needs.
  const setRef = useCallback((el: T | null) => {
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        start.current = null;
        return;
      }
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!start.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const h = handlersRef.current;

      if (absX > THRESHOLD_PX && absY < absX * MAX_OFF_AXIS_RATIO) {
        if (dx < 0) h.onSwipeLeft?.();
        else h.onSwipeRight?.();
      } else if (absY > THRESHOLD_PX && absX < absY * MAX_OFF_AXIS_RATIO) {
        if (dy < 0) h.onSwipeUp?.();
        else h.onSwipeDown?.();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return setRef;
}
