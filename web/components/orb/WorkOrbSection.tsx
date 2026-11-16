"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import OrbGallery, { type OrbHandle } from "./OrbGallery";
import { PROJECTS, PROJECT_ORDER } from "@/data/projects";
import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";
import { soundFX } from "@/utils/soundManager";

const DOMAIN_COLOR = { tech: "#19E3F0", bio: "#F2F2EE", ops: "#FF5A14" } as const;

/** Home-page section: every project on one orb. Hover a plate, click to open the case study, or let fate pick. */
export default function WorkOrbSection() {
  const orb = useRef<OrbHandle>(null);
  const open = useProjectModalStore((s) => s.openProject);
  const [hover, setHover] = useState<ProjectId | null>(null);
  const shown = hover ? PROJECTS[hover] : null;

  const openProject = (id: ProjectId, origin: { x: number; y: number }) => { soundFX.playClickLock(); open(id, origin); };

  return (
    <section id="work" className="relative overflow-hidden bg-[#0A0A0A] text-[#F2F2EE] px-5 md:px-[8vw] pt-20 md:pt-28 pb-16 md:pb-24 scroll-mt-12">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,90,20,0.22), transparent)" }} />
      <div className="relative flex items-end justify-between gap-6 flex-wrap">
        <motion.h2 initial={{ x: -80, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-anton text-[16vw] md:text-[10vw] leading-[0.88]">EVERYTHING<br /><span className="text-[#FF5A14]">I&apos;VE BUILT.</span></motion.h2>
        <p className="sn-hud-text uppercase tracking-[0.14em] text-[12px] max-w-xs pb-3 text-[#19E3F0]">● SEQ 01 · SELECTED WORK — {PROJECT_ORDER.length} PROJECTS ACROSS TECH, BIO &amp; OPS. SPIN IT, PICK A PLATE, OR LET FATE CHOOSE.</p>
      </div>

      <div className="relative mt-4"><OrbGallery handle={orb} onHover={setHover} onOpen={openProject} /></div>

      <div className="relative mt-2 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div aria-live="polite" className="min-h-[96px]">
          {shown ? (
            <>
              <p className="sn-hud-text text-[11px] uppercase tracking-[0.14em]" style={{ color: DOMAIN_COLOR[shown.domain] }}>{`${shown.domain.toUpperCase()} // 0${PROJECT_ORDER.indexOf(shown.id) + 1} · CLICK TO OPEN ▸`}</p>
              <p className="font-anton text-3xl md:text-5xl leading-tight mt-1">{shown.title}</p>
              <p className="mt-1 text-sm md:text-base text-[#9aa6a8] max-w-xl">{shown.tagline}</p>
            </>
          ) : (
            <p className="sn-hud-text text-[11px] uppercase tracking-[0.14em] text-[#9aa6a8]">HOVER A PLATE ▸ OR PICK A PROJECT →</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {PROJECT_ORDER.map((id) => {
            const p = PROJECTS[id];
            return (
              <button key={id}
                onMouseEnter={() => { soundFX.playHoverTick(); orb.current?.focus(id); }} onFocus={() => orb.current?.focus(id)}
                onMouseLeave={() => orb.current?.release()} onBlur={() => orb.current?.release()}
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); openProject(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }}
                className="sn-hud-text text-[11px] uppercase tracking-[0.1em] px-3 py-2 border cursor-pointer transition-colors hover:text-[#0A0A0A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#19E3F0]"
                style={{ borderColor: DOMAIN_COLOR[p.domain], color: DOMAIN_COLOR[p.domain], ["--h" as string]: DOMAIN_COLOR[p.domain] }}
                onMouseOver={(e) => (e.currentTarget.style.background = DOMAIN_COLOR[p.domain])} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                {p.domain} · {p.title.split(" — ")[0]}
              </button>
            );
          })}
          <button onClick={() => { soundFX.playClickLock(); orb.current?.random(); }}
            className="sn-hud-text text-[11px] uppercase tracking-[0.12em] px-4 py-2 bg-[#FF5A14] text-[#0A0A0A] hover:bg-[#F2F2EE] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#19E3F0]">
            [ SURPRISE ME ⟲ ]
          </button>
        </div>
      </div>
    </section>
  );
}
