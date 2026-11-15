"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServiceStore } from "@/lib/serviceStore";
import { getService, PILLARS } from "@/lib/services";
import ServiceContent from "./ServiceContent";

/** Full-screen holographic dossier over the live 3D scene (no route change, no scene reload). */
export default function ServiceDossier() {
  const slug = useServiceStore((s) => s.openSlug);
  const close = useServiceStore((s) => s.close);
  const startProject = useServiceStore((s) => s.startProject);
  const service = slug ? getService(slug) : undefined;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = prev; };
  }, [slug, close]);

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={`${service.title} dossier`}
          className="fixed inset-0 z-[550] overflow-y-auto bg-[#05090B]/88 backdrop-blur-xl"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        >
          <div className="mx-auto max-w-5xl px-6 pt-20 pb-24">
            <div className="flex items-center justify-between sn-hud-text text-[11px] uppercase tracking-[0.12em] text-[var(--sn-cyan)]/70 border-b border-[var(--sn-cyan)]/20 pb-3 mb-8">
              <span>SYS//{PILLARS[service.pillar].label} · {PILLARS[service.pillar].tagline}</span>
              <button ref={closeRef} onClick={close} className="cursor-pointer hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sn-cyan)] px-2 py-1">[ ESC ] CLOSE</button>
            </div>
            <ServiceContent service={service} onStart={startProject} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
