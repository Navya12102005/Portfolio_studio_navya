"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEasterEgg } from "@/hooks/useEasterEgg";
import { soundFX } from "@/utils/soundManager";

const ACCOLADES = [
  "Startup Club President — VIT Bhopal",
  "Operational Lead — AWS Student Builder Group",
  "B.Tech Bioengineering, VIT Bhopal (CGPA 8.68)",
  "Computational docking research — Pseudomonas aeruginosa (PDB:5O7)",
  "Full-stack / AI developer — built this entire 3D portfolio solo",
];

const MATRIX_CHARS = "01NAVYAΦΨΩ";
const FLASH_DURATION_MS = 1100;

/** Canvas matrix-rain flash, self-contained — runs for FLASH_DURATION_MS
 *  then calls onDone. A 2D canvas, not WebGL: this is a one-shot overlay
 *  effect, not worth a third rendering context on the page. */
function MatrixFlash({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = new Array(columns).fill(0).map(() => Math.random() * -50);

    let raf = 0;
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,8,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        ctx.fillStyle = Math.random() > 0.94 ? "#FFB800" : "#00F0FF";
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        drops[i] += 1;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      }
      frame += 1;
      if (frame * 16 < FLASH_DURATION_MS) {
        raf = requestAnimationFrame(draw);
      }
    };
    raf = requestAnimationFrame(draw);

    const t = setTimeout(onDone, FLASH_DURATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[910] pointer-events-none" />;
}

export default function EasterEggOverlay() {
  const unlocked = useEasterEgg();
  const [flashing, setFlashing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (unlocked && !hasTriggered.current) {
      hasTriggered.current = true;
      soundFX.playClickLock();
      setFlashing(true);
    }
  }, [unlocked]);

  return (
    <>
      {flashing && (
        <MatrixFlash
          onDone={() => {
            setFlashing(false);
            setPanelOpen(true);
          }}
        />
      )}

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            role="dialog"
            aria-label="Protocol 42 accolades"
            className="fixed inset-0 z-[910] flex items-center justify-center bg-black/85 backdrop-blur-xl px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="sn-glass rounded-2xl p-8 max-w-lg border-[var(--sn-cyan)]/50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="sn-hud-text text-xs text-[var(--sn-amber-hi)] tracking-widest mb-1">PROTOCOL 42 // UNLOCKED</p>
              <h2 className="sn-title text-xl font-bold text-[#e6edfb] mb-5">Verified Accolades</h2>
              <ul className="space-y-2.5">
                {ACCOLADES.map((a) => (
                  <li key={a} className="text-sm text-[#c9d3ee] flex gap-2.5">
                    <span className="text-[var(--sn-cyan)]">▸</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPanelOpen(false)}
                className="mt-6 sn-hud-text text-xs px-4 py-2 rounded-lg border border-[var(--sn-cyan)]/40 text-[var(--sn-cyan)] hover:bg-[var(--sn-cyan)]/10 cursor-pointer"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
