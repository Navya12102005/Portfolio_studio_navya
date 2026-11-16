"use client";

import { motion } from "framer-motion";
import type { Service } from "@/lib/services";

// strict palette: orange, white, grey and the neon blue of the AI button
const ACCENTS = ["#FF5A14", "#00F0FF", "#F2F2EE", "#FF5A14", "#00F0FF", "#9a9a9a"];

/** OPS services as frosted-glass bento cards. Each card opens that service's dossier, same as the old rows. */
export default function OpsBento({ list, onOpen, onHover }: { list: Service[]; onOpen: (slug: string) => void; onHover: () => void }) {
  return (
    <ul className="relative z-10 mt-10 md:mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s, i) => {
        const c = ACCENTS[i % ACCENTS.length];
        return (
          <motion.li key={s.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: (i % 3) * 0.07, duration: 0.45 }}>
            <button type="button" onClick={() => onOpen(s.slug)} onMouseEnter={onHover}
              className="group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: c }}>
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${c}26, transparent 60%)` }} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ borderColor: c + "55", color: c, background: c + "12" }}>{s.code}</span>
                  <span aria-hidden className="font-anton text-2xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: c }}>↗</span>
                </div>
                <h3 className="font-anton mt-6 text-2xl leading-tight text-[#F2F2EE] md:text-[1.7rem]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.tagline}</p>
              </div>
              <div className="relative mt-6 flex items-center gap-2 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.complete ? "#F2F2EE" : "#FF5A14" }} />
                {s.complete ? "Ready" : "In progress"}
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
