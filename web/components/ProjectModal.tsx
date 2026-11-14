"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";
import { PROJECTS, PROJECT_ORDER } from "@/data/projects";

const DOMAIN_LABEL: Record<"tech" | "bio" | "ops", string> = {
  tech: "TECH",
  bio: "BIO",
  ops: "OPS",
};

/**
 * Project case-study drawer, triggered by clicking a 3D domain node.
 * - Optical iris wipe (circular clip-path) expands from the exact click
 *   coordinate, via Framer Motion.
 * - High-contrast dark glassmorphism drawer with full project tabs.
 * - Lives at z-[500]; PerimeterHUD is bumped to z-[600] so the telemetry
 *   overlay (ruler, rotation dial, hex grid, XY, terminal) stays fully
 *   visible and functional on top of the drawer, per spec.
 */
export default function ProjectModal() {
  const { activeProject, origin, close } = useProjectModalStore();
  const [tab, setTab] = useState<ProjectId | null>(activeProject);

  // whichever node was clicked becomes the default tab each time the
  // modal (re)opens
  useEffect(() => {
    if (activeProject) setTab(activeProject);
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProject, close]);

  const open = !!activeProject;
  const active = tab ? PROJECTS[tab] : null;
  const irisFrom = `circle(0px at ${origin.x}px ${origin.y}px)`;
  const irisTo = `circle(150% at ${origin.x}px ${origin.y}px)`;

  return (
    <AnimatePresence>
      {open && active && (
        <>
          {/* optical iris wipe — the aperture-open transition itself */}
          <motion.div
            className="fixed inset-0 z-[495] pointer-events-none bg-[#030508]"
            initial={{ clipPath: irisFrom }}
            animate={{ clipPath: irisTo }}
            exit={{ clipPath: irisFrom }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* dim/scrim behind the drawer, dismissible */}
          <motion.button
            aria-label="Close project case study"
            onClick={close}
            className="fixed inset-0 z-[496] bg-black/40 cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          />

          {/* the drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed top-0 right-0 z-[500] h-full w-full md:w-[600px] sn-glass border-l border-[#00F0FF]/30 flex flex-col overflow-hidden"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#00F0FF]/20">
              <div>
                <p className="sn-hud-text text-[10px] text-[var(--sn-cyan)]/70">
                  CASE STUDY // {DOMAIN_LABEL[active.domain]}
                </p>
                <h2 className="sn-title text-xl md:text-2xl font-bold text-[#e6edfb] mt-1">{active.title}</h2>
              </div>
              <button
                onClick={close}
                className="sn-hud-text text-xs text-[var(--sn-cyan)] border border-[var(--sn-cyan)]/40 rounded-full w-9 h-9 flex items-center justify-center hover:bg-[var(--sn-cyan)]/10 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* tabs */}
            <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-[#00F0FF]/10">
              {PROJECT_ORDER.map((id) => {
                const p = PROJECTS[id];
                const isActive = id === tab;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`sn-hud-text text-[10px] px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? "border-[var(--sn-cyan)] text-[var(--sn-cyan)] bg-[var(--sn-cyan)]/10"
                        : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/30"
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-sm text-[#b9c6e8] leading-relaxed">{active.tagline}</p>

                  <p className="sn-hud-text text-[10px] text-[var(--sn-cyan)]/70 mt-8 mb-3 tracking-widest">
                    METRICS
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {active.metrics.map((m) => (
                      <div key={m.label} className="sn-glass rounded-lg px-4 py-3 border-white/5">
                        <div className="sn-hud-text text-[9px] text-white/40 uppercase tracking-wider">{m.label}</div>
                        <div className="sn-title text-sm text-[var(--sn-cyan)] mt-1">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <p className="sn-hud-text text-[10px] text-[var(--sn-cyan)]/70 mt-8 mb-3 tracking-widest">
                    ARCHITECTURE
                  </p>
                  <ul className="space-y-2">
                    {active.architecture.map((line, i) => (
                      <li key={i} className="text-sm text-[#c9d3ee] flex gap-3">
                        <span className="text-[var(--sn-cyan)]/60 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mt-8">
                    {active.github ? (
                      <a
                        href={active.github}
                        target="_blank"
                        rel="noreferrer"
                        className="sn-hud-text text-xs px-4 py-2 rounded-lg border border-[var(--sn-cyan)]/40 text-[var(--sn-cyan)] hover:bg-[var(--sn-cyan)]/10"
                      >
                        GITHUB ↗
                      </a>
                    ) : (
                      <span className="sn-hud-text text-xs px-4 py-2 rounded-lg border border-white/10 text-white/30">
                        GITHUB — not linked yet
                      </span>
                    )}
                    {active.live ? (
                      <a
                        href={active.live}
                        target="_blank"
                        rel="noreferrer"
                        className="sn-hud-text text-xs px-4 py-2 rounded-lg border border-[var(--sn-ember,#ff5e00)]/50 text-[#ffb347] hover:bg-[#ff5e00]/10"
                      >
                        LIVE ↗
                      </a>
                    ) : (
                      <span className="sn-hud-text text-xs px-4 py-2 rounded-lg border border-white/10 text-white/30">
                        LIVE — not linked yet
                      </span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
