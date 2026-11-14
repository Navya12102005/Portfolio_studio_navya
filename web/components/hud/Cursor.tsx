"use client";

import { useEffect, useRef } from "react";
import { pointer, startPointerTracking } from "@/lib/pointer";

/**
 * Custom magnetic HUD targeting reticle (spec §5).
 * - Default: small cyan ring + crosshair ticks following the cursor with lag.
 * - Hovering any [data-reticle] element: outer bracket snaps to its
 *   bounding box and shows its data-reticle-label as metadata text.
 */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startPointerTracking();
    let cx = pointer.x || window.innerWidth / 2;
    let cy = pointer.y || window.innerHeight / 2;
    let hot: Element | null = null;
    let raf = 0;

    function frame() {
      cx += (pointer.x - cx) * 0.22;
      cy += (pointer.y - cy) * 0.22;
      if (ringRef.current) ringRef.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

      const target = pointer.targetEl?.closest<HTMLElement>("[data-reticle]") ?? null;
      if (target !== hot) {
        hot = target;
        if (bracketRef.current) bracketRef.current.style.opacity = hot ? "1" : "0";
        if (labelRef.current) labelRef.current.textContent = (hot as HTMLElement | null)?.dataset.reticleLabel ?? "";
      }
      if (hot && bracketRef.current) {
        const r = hot.getBoundingClientRect();
        bracketRef.current.style.width = `${r.width + 16}px`;
        bracketRef.current.style.height = `${r.height + 16}px`;
        bracketRef.current.style.transform = `translate(${r.left - 8}px, ${r.top - 8}px)`;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] hidden md:block" aria-hidden>
      <div
        ref={ringRef}
        className="fixed left-0 top-0 w-11 h-11 rounded-full border border-[var(--sn-cyan)]/70"
        style={{ boxShadow: "0 0 14px 1px rgba(0,240,255,.35)" }}
      >
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sn-cyan)]" />
      </div>
      <div
        ref={bracketRef}
        className="fixed left-0 top-0 rounded-md border border-[var(--sn-cyan)] opacity-0 transition-opacity duration-150"
        style={{ boxShadow: "0 0 20px 1px rgba(0,240,255,.25) inset" }}
      />
      <div
        ref={labelRef}
        className="fixed left-0 top-0 translate-x-6 translate-y-6 sn-hud-text text-[10px] text-[var(--sn-cyan)]"
      />
    </div>
  );
}
