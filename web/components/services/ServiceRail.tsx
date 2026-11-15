"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { useServiceStore } from "@/lib/serviceStore";
import { PILLARS, servicesFor, type Pillar } from "@/lib/services";
import { soundFX } from "@/utils/soundManager";

/** Station panel: when the camera is parked on a pillar, list that pillar's services. */
export default function ServiceRail() {
  const domain = useCameraRigStore((s) => s.domain);
  const open = useServiceStore((s) => s.open);
  const pillar: Pillar | null = domain === "tech" || domain === "bio" || domain === "ops" ? domain : null;

  return (
    <AnimatePresence mode="wait">
      {pillar && (
        <motion.nav
          key={pillar}
          aria-label={`${PILLARS[pillar].label} services`}
          className="fixed z-[300] bottom-24 left-4 right-4 md:right-auto md:bottom-auto md:top-24 md:left-6 md:w-80 sn-glass rounded-lg p-4"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}
        >
          <p className="sn-hud-text uppercase tracking-[0.12em] text-[10px]" style={{ color: PILLARS[pillar].accent }}>{PILLARS[pillar].label} · {PILLARS[pillar].tagline}</p>
          <ul className="mt-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {servicesFor(pillar).map((s) => (
              <li key={s.slug} className="shrink-0">
                <button
                  onClick={() => { soundFX.playClickLock(); open(s.slug); }}
                  onMouseEnter={() => soundFX.playHoverTick()}
                  className="w-56 md:w-full text-left border border-white/10 hover:border-[var(--sn-cyan)]/60 px-3 py-2 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sn-cyan)]"
                >
                  <span className="sn-hud-text text-[10px] uppercase tracking-[0.12em] opacity-60">{s.code}{s.complete ? "" : " · IN PROGRESS"}</span>
                  <span className="block text-sm text-[#e6edfb] mt-0.5">{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
