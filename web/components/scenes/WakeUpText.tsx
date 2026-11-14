"use client";

/** LED dot-matrix "WAKE UP" readout for the boot sequence. Built from CSS
 * radial-gradient dot grid + glow, no canvas needed. */
export default function WakeUpText() {
  return (
    <div className="pointer-events-none select-none">
      <div
        className="sn-title font-black tracking-[0.05em] text-[clamp(3rem,11vw,9rem)] leading-none"
        style={{
          color: "#ff2a1a",
          textShadow:
            "0 0 6px rgba(255,42,26,.9), 0 0 22px rgba(255,42,26,.6), 0 0 60px rgba(255,80,20,.4)",
        }}
      >
        WAKE UP
      </div>
      <div className="sn-hud-text mt-3 text-sm md:text-base text-[#ff6a52]/80">
        // STUDIO NAVYA OS v4.0
      </div>
    </div>
  );
}
