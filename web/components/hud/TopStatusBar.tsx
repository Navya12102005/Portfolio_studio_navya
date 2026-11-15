"use client";

import { useEffect, useState } from "react";
import { soundFX } from "@/utils/soundManager";
import { useCameraRigStore, type CameraDomain } from "@/lib/cameraRigStore";

const NAV: { label: string; domain: CameraDomain }[] = [
  { label: "Overview", domain: "home" },
  { label: "Tech", domain: "tech" },
  { label: "Bio", domain: "bio" },
  { label: "Ops", domain: "ops" },
];

/**
 * Replaces PerimeterHUD + BioTelemetryWidget + LiveTicker: those four
 * separate floating widgets (calibration ruler, rotation dial, hex
 * status grid, live XYZ, scrolling terminal, BPM/load gauge, bottom
 * ticker bar) were the "cluttered, visually overwhelming" HUD per
 * feedback. One slim top bar — brand + live clock + status dot on the
 * left, SFX mute on the right — carries the same "systems are online"
 * feeling without the noise. The centre nav glides the camera to each
 * domain (there is no intro screen any more, so this is the way in).
 */
export default function TopStatusBar({ showNav }: { showNav: boolean }) {
  const [time, setTime] = useState("");
  const [muted, setMuted] = useState(false);
  const domain = useCameraRigStore((s) => s.domain);
  const focus = useCameraRigStore((s) => s.focus);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[600] sn-hud-text text-[10px] text-[var(--sn-cyan)]/70 select-none">
      <div className="flex items-center justify-between px-6 py-3 bg-[#030508]/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sn-cyan)] animate-pulse" />
          <span className="tracking-widest">STUDIO NAVYA</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span className="hidden sm:inline opacity-50">{time} IST</span>
        </div>
        <nav className={`items-center gap-1 sm:gap-2 ${showNav ? "flex" : "hidden"}`}>
          {NAV.map((n) => (
            <button
              key={n.domain}
              onClick={() => {
                soundFX.playClickLock();
                focus(n.domain);
              }}
              className={`px-2.5 py-1 rounded-full tracking-wide cursor-pointer transition-colors ${
                domain === n.domain ? "text-[var(--sn-cyan)] bg-[var(--sn-cyan)]/10" : "opacity-60 hover:opacity-100"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            const next = !muted;
            setMuted(next);
            soundFX.setMuted(next);
          }}
          className="hidden sm:block opacity-60 hover:opacity-100 cursor-pointer tracking-wide"
        >
          SFX {muted ? "OFF" : "ON"}
        </button>
      </div>
    </div>
  );
}
