"use client";

/** Shared, render-free pointer tracker. Everything that needs the cursor
 * position (reticle, schematic spotlight, camera parallax) reads from this
 * single source instead of each mounting its own mousemove listener. */
export type PointerState = {
  x: number; // px
  y: number; // px
  nx: number; // normalized -1..1
  ny: number; // normalized -1..1
  targetEl: Element | null;
};

export const pointer: PointerState = { x: 0, y: 0, nx: 0, ny: 0, targetEl: null };

let started = false;
export function startPointerTracking() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.targetEl = e.target as Element;
    },
    { passive: true }
  );
}
