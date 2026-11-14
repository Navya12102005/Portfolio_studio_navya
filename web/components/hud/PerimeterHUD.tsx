"use client";

import { useEffect, useRef, useState } from "react";
import { pointer, startPointerTracking } from "@/lib/pointer";
import { soundFX } from "@/utils/soundManager";

const RULER_MARKS = Array.from({ length: 21 }, (_, i) => (i - 10) * 5); // -50..50
const TERMINAL_LINES = [
  "SYS// navya.core booting",
  "SCAN// domain:tech,bio,ops online",
  "NET// uplink stable 248ms",
  "BIO// pdb:5O7 docking cache ready",
  "OPS// kpi stream synced",
  "AI // jarvis.route() idle",
];

/** Layer 2 — fixed perimeter telemetry overlay. Pure 2D, cheap, always on
 * top of the 3D layers. Rulers, rotation dial, hex grid, live XYZ, and a
 * scrolling terminal feed, pinned to the four corners of the viewport. */
export default function PerimeterHUD() {
  const [xy, setXy] = useState({ x: 0, y: 0 });
  const [deg, setDeg] = useState(0);
  const dialStart = useRef<number>(0);
  const [line, setLine] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    dialStart.current = performance.now();
    startPointerTracking();
    let raf = 0;
    function tick() {
      setXy({ x: Math.round(pointer.x), y: Math.round(pointer.y) });
      setDeg(Math.round(((performance.now() - dialStart.current) / 40) % 360));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    const iv = setInterval(() => setLine((l) => (l + 1) % TERMINAL_LINES.length), 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[600] sn-hud-text text-[10px] text-[var(--sn-cyan)]/70 select-none">
      {/* top ruler */}
      <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 gap-3 opacity-60">
        {RULER_MARKS.map((m) => (
          <span key={m} className="flex flex-col items-center">
            <span className="w-px h-2 bg-[var(--sn-cyan)]/50" />
            {m % 10 === 0 && <span>{m}</span>}
          </span>
        ))}
      </div>

      {/* top-left: rotation dial + system id + master SFX mute */}
      <div className="hidden md:block absolute top-6 left-6">
        <div>STUDIO.NAVYA // OS v4.0</div>
        <div className="mt-1 opacity-70">ROTATION {deg.toString().padStart(3, "0")}°</div>
        <button
          onClick={() => {
            const next = !muted;
            setMuted(next);
            soundFX.setMuted(next);
          }}
          className="pointer-events-auto mt-1 opacity-70 hover:opacity-100 cursor-pointer underline-offset-2 hover:underline"
        >
          SFX: {muted ? "MUTED" : "ON"}
        </button>
      </div>

      {/* top-right: hex status grid */}
      <div className="hidden md:grid absolute top-6 right-6 grid-cols-6 gap-[3px] opacity-50">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-2.5 h-2.5 border border-[var(--sn-cyan)]/50" />
        ))}
      </div>

      {/* bottom-left: live XYZ — bottom-12, not bottom-6: LiveTicker now
          occupies the bottom-0 edge strip, so this sits clear above it */}
      <div className="absolute bottom-12 left-6">
        <div>X:{xy.x.toString().padStart(4, "0")} Y:{xy.y.toString().padStart(4, "0")} Z:0.00</div>
      </div>

      {/* bottom-right: scrolling terminal — same bottom-12 adjustment */}
      <div className="hidden md:block absolute bottom-12 right-6 w-64 text-right opacity-80">
        <div key={line} className="animate-[fadeIn_0.4s_ease]">
          {TERMINAL_LINES[line]}
        </div>
      </div>
    </div>
  );
}
