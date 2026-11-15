"use client";

import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";

const DOMAINS: { label: string; blurb: string; project: ProjectId }[] = [
  { label: "Tech & AI", blurb: "NoviCord, agentic workflows", project: "tech-novicord" },
  { label: "Bioengineering", blurb: "Docking, biosensors", project: "bio-docking" },
  { label: "Operations", blurb: "Campaigns, KPI dashboards", project: "ops-mailchimp" },
];

/**
 * Low-power-device replacement for the full WebGL SceneRoot: no canvas at
 * all, just the plain void and three domain cards that open the same case
 * studies the 3D centerpieces do.
 */
export default function LightweightFallback() {
  const openProject = useProjectModalStore((s) => s.openProject);

  return (
    <div className="fixed inset-0 z-0 bg-[#030508]" data-testid="lightweight-fallback">
      <div className="h-full w-full flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center max-w-sm">
          <h1 className="sn-title text-2xl font-bold text-[#e6edfb]">Navya Gupta</h1>
          <p className="text-sm text-[#b9c6e8] mt-3">Bioengineering × AI. Pick a domain to see the work.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {DOMAINS.map((d) => (
            <button
              key={d.project}
              onClick={(e) => openProject(d.project, { x: e.clientX, y: e.clientY })}
              className="relative z-20 sn-glass rounded-xl px-5 py-4 text-left cursor-pointer hover:border-[var(--sn-cyan)]/60 transition-colors"
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
