"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";

/** Shared palette: dark teal / navy night room with warm pink-orange accents and neon bio-greens. */
export const K = {
  ink: "#0b0a1f", n9: "#0d0f29", n8: "#141838", n7: "#1b2147", n6: "#262d5c", n5: "#34407e",
  t9: "#0e2a36", t8: "#133846", t7: "#1a4a5a", t6: "#256070",
  w9: "#2c1a2a", w8: "#4a2a36", w7: "#6e3f44", w6: "#8f5a52", w5: "#b57a64",
  pink: "#ff6fa8", orange: "#FF5A14", yellow: "#ffd23f", green: "#4bd36b", greenD: "#2a8f47", neon: "#39ff88",
  cyan: "#27f0ff", blue: "#3a6df0", white: "#f2f2ee", grey: "#9aa0b4", greyD: "#5a6080",
  skin: "#f2b98f", skinD: "#d28a6a", hair: "#231521", hairH: "#4a2c4a", red: "#e5322d", redD: "#a31f24",
  jeans: "#2b3f7a", jeansD: "#1d2b57", glass: "#bfe9ff",
};

/** A sprite is an ASCII map: one character per pixel, '.' is transparent. */
export type Sprite = { rows: string[]; pal: Record<string, string> };
type Run = { x: number; y: number; w: number; c: string };
const cache = new WeakMap<Sprite, Run[]>();
function runsOf(s: Sprite): Run[] {
  const hit = cache.get(s);
  if (hit) return hit;
  const out: Run[] = [];
  s.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || ch === " " || !s.pal[ch]) { x++; continue; }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      out.push({ x, y, w, c: s.pal[ch] });
      x += w;
    }
  });
  cache.set(s, out);
  return out;
}

/** Draws a sprite at (x, y). Rects overdraw by 0.02 so no hairline seams show at fractional scales. */
export const Px = memo(function Px({ s, x = 0, y = 0, flip = false }: { s: Sprite; x?: number; y?: number; flip?: boolean }) {
  const runs = useMemo(() => runsOf(s), [s]);
  const width = useMemo(() => Math.max(...s.rows.map((r) => r.length)), [s]);
  return (
    <g transform={`translate(${x} ${y})${flip ? ` translate(${width} 0) scale(-1 1)` : ""}`} shapeRendering="crispEdges">
      {runs.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />)}
    </g>
  );
});

export function R({ x, y, w, h, c, o }: { x: number; y: number; w: number; h: number; c: string; o?: number }) {
  return <rect x={x} y={y} width={w + 0.02} height={h + 0.02} fill={c} opacity={o} shapeRendering="crispEdges" />;
}

/* 3x5 pixel font for the monitor's labels */
const FONT: Record<string, string[]> = {
  A: [".X.", "X.X", "XXX", "X.X", "X.X"], B: ["XX.", "X.X", "XX.", "X.X", "XX."], C: [".XX", "X..", "X..", "X..", ".XX"],
  D: ["XX.", "X.X", "X.X", "X.X", "XX."], G: [".XX", "X..", "X.X", "X.X", ".XX"], I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  L: ["X..", "X..", "X..", "X..", "XXX"], M: ["X.X", "XXX", "XXX", "X.X", "X.X"], N: ["XXX", "X.X", "X.X", "X.X", "X.X"],
  O: ["XXX", "X.X", "X.X", "X.X", "XXX"], S: [".XX", "X..", ".X.", "..X", "XX."], T: ["XXX", ".X.", ".X.", ".X.", ".X."],
  Y: ["X.X", "X.X", ".X.", ".X.", ".X."], X: ["X.X", "X.X", ".X.", "X.X", "X.X"], "-": ["...", "...", "XXX", "...", "..."],
  "0": ["XXX", "X.X", "X.X", "X.X", "XXX"], "4": ["X.X", "X.X", "XXX", "..X", "..X"], "%": ["X.X", "..X", ".X.", "X..", "X.X"],
  "5": ["XXX", "X..", "XXX", "..X", "XXX"], "2": ["XXX", "..X", "XXX", "X..", "XXX"],
  E: ["XXX", "X..", "XX.", "X..", "XXX"], H: ["X.X", "X.X", "XXX", "X.X", "X.X"], F: ["XXX", "X..", "XX.", "X..", "X.."],
  R: ["XX.", "X.X", "XX.", "X.X", "X.X"], U: ["X.X", "X.X", "X.X", "X.X", "XXX"], P: ["XXX", "X.X", "XXX", "X..", "X.."],
  "1": [".X.", "XX.", ".X.", ".X.", "XXX"], "3": ["XXX", "..X", "XXX", "..X", "XXX"], "6": ["XXX", "X..", "XXX", "X.X", "XXX"],
  "7": ["XXX", "..X", ".X.", ".X.", ".X."], "8": ["XXX", "X.X", "XXX", "X.X", "XXX"], "9": ["XXX", "X.X", "XXX", "..X", "XXX"],
  ">": ["X..", ".X.", "..X", ".X.", "X.."], "_": ["...", "...", "...", "...", "XXX"], ".": ["...", "...", "...", "...", ".X."], "/": ["..X", "..X", ".X.", "X..", "X.."],
};
export function textWidth(t: string) { return [...t].reduce((a, ch) => a + (ch === " " ? 2 : 4), 0) - 1; }
export function PText({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const rects: { x: number; y: number; w: number }[] = [];
  let cx = x;
  for (const ch of text) {
    if (ch === " ") { cx += 2; continue; }
    const g = FONT[ch];
    if (g) g.forEach((row, ry) => { let i = 0; while (i < 3) { if (row[i] === "X") { let w = 1; while (i + w < 3 && row[i + w] === "X") w++; rects.push({ x: cx + i, y: y + ry, w }); i += w; } else i++; } });
    cx += 4;
  }
  return <g shapeRendering="crispEdges" fill={color}>{rects.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} />)}</g>;
}

/** Counts up at `fps` while enabled (drives frame-by-frame animation in small isolated components). */
export function useTick(fps: number, enabled = true): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setN((v) => v + 1), 1000 / fps);
    return () => window.clearInterval(id);
  }, [fps, enabled]);
  return n;
}

/** Eases a value toward 1 (on) or 0 (off) over `ms`, quantised to `steps` so it moves in chunky pixel frames. */
export function useProgress(on: boolean, ms: number, steps = 8): number {
  const [p, setP] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      const next = Math.min(1, Math.max(0, ref.current + (on ? dt : -dt) / ms));
      ref.current = next;
      const q = Math.round(next * steps) / steps;
      setP((prev) => (prev === q ? prev : q));
      if (next !== (on ? 1 : 0)) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [on, ms, steps]);
  return p;
}

/** Stepped easing: motion in N hard frames instead of a smooth tween. */
export const stepped = (n: number) => (t: number) => Math.round(t * n) / n;
