"use client";

import { useEffect, useRef } from "react";

/**
 * Low-power-device replacement for the full WebGL SceneRoot. No Three.js,
 * no WebGL context at all — a cheap 2D canvas dot-grid (buttery-smooth
 * even on weak GPUs) plus a couple of CSS glassmorphism cards standing
 * in for the 3D centerpieces, so the page still reads as "Studio Navya"
 * rather than going blank.
 */
export default function LightweightFallback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasEl = canvas;
    const context = ctx;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5); // keep it cheap
    const GAP = 42;
    let dots: { x: number; y: number; ph: number }[] = [];

    function resize() {
      canvasEl.width = window.innerWidth * DPR;
      canvasEl.height = window.innerHeight * DPR;
      context.setTransform(DPR, 0, 0, DPR, 0, 0);
      dots = [];
      for (let x = 0; x < window.innerWidth + GAP; x += GAP) {
        for (let y = 0; y < window.innerHeight + GAP; y += GAP) {
          dots.push({ x, y, ph: Math.random() * Math.PI * 2 });
        }
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    const FPS_CAP = 24; // this path exists specifically to be cheap — no need for 60fps
    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (t - last < 1000 / FPS_CAP) return;
      last = t;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const d of dots) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0006 + d.ph);
        context.fillStyle = `rgba(0,240,255,${0.06 + pulse * 0.12})`;
        context.fillRect(d.x, d.y, 1.5, 1.5);
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#030508] overflow-hidden" data-testid="lightweight-fallback">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6 px-6 pointer-events-none">
        <div className="sn-glass rounded-2xl px-6 py-5 max-w-sm text-center">
          <p className="sn-hud-text text-[10px] text-[var(--sn-cyan)]/70">LITE MODE // GPU-SAFE</p>
          <h2 className="sn-title text-lg font-bold text-[#e6edfb] mt-2">Studio Navya</h2>
          <p className="text-xs text-[#b9c6e8] mt-2">
            Bioengineering · Tech & AI · Operations. Full 3D disabled on this device for a smooth experience.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {["TECH", "BIO", "OPS"].map((d) => (
            <div key={d} className="sn-glass rounded-xl py-3 text-center">
              <span className="sn-hud-text text-[10px] text-[var(--sn-cyan)]">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
