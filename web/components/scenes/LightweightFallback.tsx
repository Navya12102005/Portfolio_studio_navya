"use client";

import { useCameraRigStore, type CameraDomain } from "@/lib/cameraRigStore";

const DOMAINS: { label: string; blurb: string; domain: CameraDomain }[] = [
  { label: "Tech & AI", blurb: "AI/ML, dashboards, automation, 3D web", domain: "tech" },
  { label: "Bioengineering", blurb: "Genomics, research support, MedTech ideas", domain: "bio" },
  { label: "Operations", blurb: "Marketing, growth, finance, partnerships", domain: "ops" },
];

/**
 * Low-power-device replacement for the full WebGL SceneRoot: no canvas at
 * all, just the plain void and three domain cards that focus a pillar,
 * which opens that pillar's service list (the same one the 3D stations use).
 */
export default function LightweightFallback() {
  const focus = useCameraRigStore((s) => s.focus);
  const current = useCameraRigStore((s) => s.domain);

  return (
    <div className="fixed inset-0 z-0 bg-[#030508]" data-testid="lightweight-fallback">
      <div className="h-full w-full flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center max-w-sm">
          <h1 className="sn-title text-2xl font-bold text-[#e6edfb]">Navya Gupta</h1>
          <p className="text-sm text-[#b9c6e8] mt-3">Bioengineering × AI. Pick a domain to see what I offer.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {DOMAINS.map((d) => (
            <button
              key={d.domain}
              aria-pressed={current === d.domain}
              onClick={() => focus(d.domain)}
              className="relative z-20 sn-glass rounded-xl px-5 py-4 text-left cursor-pointer hover:border-[var(--sn-cyan)]/60 transition-colors aria-pressed:border-[var(--sn-cyan)]"
            >
              <span className="sn-hud-text text-xs text-[var(--sn-cyan)]">{d.label}</span>
              <span className="block text-xs text-[#b9c6e8]/80 mt-1">{d.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
