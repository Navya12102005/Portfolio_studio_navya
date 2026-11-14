"use client";

import { useEffect, useRef } from "react";

/**
 * Audio-reactive-style waveform for the J.A.R.V.I.S. header. The Web
 * Speech API's SpeechSynthesis doesn't expose a MediaStream/AnalyserNode
 * to tap real amplitude from, so this drives a procedural multi-bar wave
 * instead: a calm, low-amplitude cyan "idle breathing" line when quiet,
 * and an energetic cyan/amber pulse while `speaking` is true — visually
 * reads as audio-reactive and responds immediately to speech start/end.
 */
export default function JarvisWaveform({ speaking }: { speaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const canvasEl = canvas; // stable non-null refs for the closures below
    const context = ctx;

    const BARS = 28;
    const phases = Array.from({ length: BARS }, () => Math.random() * Math.PI * 2);
    let raf = 0;

    function frame(t: number) {
      const w = canvasEl.clientWidth;
      const h = canvasEl.clientHeight;
      const ctx = context;
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const gap = w / BARS;
      const energetic = speakingRef.current;

      for (let i = 0; i < BARS; i++) {
        const base = energetic ? 0.35 : 0.08;
        const amp = energetic ? 0.55 : 0.05;
        const speed = energetic ? 0.009 : 0.0025;
        const n = Math.sin(t * speed + phases[i]) * 0.5 + Math.sin(t * speed * 1.7 + phases[i] * 2) * 0.5;
        const barH = Math.max(2, (base + amp * Math.abs(n)) * h);
        const x = i * gap + gap * 0.25;
        const barW = gap * 0.5;

        const cyan = "rgba(0,240,255,";
        const amber = "rgba(255,94,0,";
        const mixAmber = energetic ? Math.abs(Math.sin(t * 0.002 + i * 0.4)) : 0;
        ctx.fillStyle = mixAmber > 0.6 ? amber + "0.85)" : cyan + (energetic ? "0.9)" : "0.45)");
        ctx.shadowBlur = energetic ? 8 : 2;
        ctx.shadowColor = mixAmber > 0.6 ? "#FF5E00" : "#00F0FF";
        ctx.fillRect(x, mid - barH / 2, barW, barH);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-8" aria-hidden />;
}
