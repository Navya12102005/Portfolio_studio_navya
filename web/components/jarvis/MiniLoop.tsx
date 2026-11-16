"use client";

import { useEffect, useRef } from "react";
import { S, drawLoop, type Fonts } from "./mini";

/** The boot's tiny animation: star -> pixel eye -> pulse trace -> scrolling code, dissolving cell by cell into each other, looping forever. */
export default function MiniLoop({ size = 240 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
    const fonts: Fonts = { mono: `${fam ? fam + ", " : ""}ui-monospace, Menlo, Consolas, monospace` };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    const scale = canvas.width / S;
    const scratch = document.createElement("canvas");
    scratch.width = scratch.height = canvas.width;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawLoop(ctx, scratch, reduce ? 1.2 : (now - start) / 1000, fonts, !reduce);
    };
    raf = requestAnimationFrame(frame);
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); };
  }, [size]);

  return <canvas ref={ref} aria-hidden style={{ width: size, height: size, imageRendering: "auto" }} className="block" />;
}
