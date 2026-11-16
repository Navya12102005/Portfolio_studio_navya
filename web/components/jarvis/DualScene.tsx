"use client";

import { useEffect, useRef } from "react";
import { W, H, drawSceneA, drawSceneB, glitchPass, type Fonts } from "./scenes";

export const SCENE_MS = 1800; // how long each scene stays
export const CUT_MS = 120;    // glitch cut length

/**
 * The boot's centrepiece: scene A (maroon CORE STABILITY panel) and scene B (tan pixel eye)
 * take turns on one canvas, A, B, A, B... with a glitch cut between them, until it unmounts.
 * onScene fires with 0 (A) or 1 (B) whenever the active scene changes so the overlay can re-colour itself.
 */
export default function DualScene({ onScene, running }: { onScene: (i: 0 | 1) => void; running: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onScene);
  useEffect(() => { cb.current = onScene; });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !running) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
    const fonts: Fonts = { mono: `${fam ? fam + ", " : ""}ui-monospace, Menlo, Consolas, monospace` };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
      if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round((w * H) / W); }
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(canvas);

    let raf = 0, last = -1;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const el = now - start;
      const idx = (Math.floor(el / SCENE_MS) % 2) as 0 | 1;
      const inScene = el % SCENE_MS;
      const t = reduce ? (idx === 0 ? 1.2 : 1) : el / 1000;
      const ts = reduce ? 0.9 : inScene / 1000;
      if (idx !== last) { last = idx; cb.current(idx); }
      const s = canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      if (idx === 0) drawSceneA(ctx, t, fonts); else drawSceneB(ctx, t, ts, fonts);
      if (!reduce && el > CUT_MS && inScene < CUT_MS) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        glitchPass(ctx, canvas, inScene / CUT_MS, Math.floor(el / SCENE_MS));
      }
    };
    raf = requestAnimationFrame(frame);
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [running]);

  return <canvas ref={ref} aria-hidden className="h-full w-auto max-w-full block" style={{ aspectRatio: `${W} / ${H}` }} />;
}
