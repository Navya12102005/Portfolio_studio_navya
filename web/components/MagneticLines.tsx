"use client";

import { useEffect, useRef } from "react";

const SPACING = 45;
const LINE = 18;
const RADIUS = 180;
const HOT = "#FF5A14";
const COLD = "rgba(255,255,255,0.15)";

type Cell = { x: number; y: number; angle: number };

/**
 * Grid of short strokes that swing toward the cursor (a magnetic field) and relax back to horizontal.
 * Transparent canvas, so it sits on whatever section background is behind it.
 * Pauses when scrolled out of view, honours prefers-reduced-motion (static grid), uses pointer events
 * (so touch drags work too) and scales for devicePixelRatio so strokes stay crisp on retina screens.
 */
export default function MagneticLines({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -1000, y: -1000 };
    let cells: Cell[] = [];
    let w = 0, h = 0, raf = 0, visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      for (let x = SPACING / 2; x < w; x += SPACING) for (let y = SPACING / 2; y < h; y += SPACING) cells.push({ x, y, angle: 0 });
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const hot: Cell[] = [], cold: Cell[] = [];
      for (const c of cells) {
        const dx = mouse.x - c.x, dy = mouse.y - c.y, dist = Math.hypot(dx, dy);
        if (!reduced) {
          if (dist < RADIUS) {
            // shortest signed angle to the cursor, so a line never spins the long way round at the ±π seam
            let d = Math.atan2(dy, dx) - c.angle;
            d = Math.atan2(Math.sin(d), Math.cos(d));
            c.angle += d * 0.15 * (1 - dist / RADIUS);
          } else {
            c.angle += (0 - c.angle) * 0.08;
          }
        }
        (dist < RADIUS ? hot : cold).push(c);
      }
      // one path per colour instead of one stroke per line
      const stroke = (group: Cell[], color: string, width: number) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width;
        for (const c of group) {
          const dx = Math.cos(c.angle) * LINE / 2, dy = Math.sin(c.angle) * LINE / 2;
          ctx.moveTo(c.x - dx, c.y - dy); ctx.lineTo(c.x + dx, c.y + dy);
        }
        ctx.stroke();
      };
      stroke(cold, COLD, 1.5); stroke(hot, HOT, 2);
    };

    const loop = () => { raf = requestAnimationFrame(loop); if (visible) draw(); };
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });

    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    if (!reduced) { window.addEventListener("pointermove", onMove); raf = requestAnimationFrame(loop); }
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />;
}
