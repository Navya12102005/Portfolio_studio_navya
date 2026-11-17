"use client";

import BioCollage from "./biocollage/BioCollage";
import { PILLARS, servicesFor } from "@/lib/services";
import { useServiceStore } from "@/lib/serviceStore";
import { soundFX } from "@/utils/soundManager";

/**
 * The TECH slide. The pixel-art workstation IS the background: it fills the whole section edge to edge, and the
 * neon TECH sign in the scene is the title. The services sit as glass cards on the floor strip. The overlay lets
 * pointer events through everywhere except the cards, so the objects in the room stay hoverable and clickable.
 */
export default function BioSlide() {
  const list = servicesFor("bio");
  const open = useServiceStore((s) => s.open);
  const go = (slug: string) => { soundFX.playClickLock(); open(slug); };

  const card = (s: (typeof list)[number]) => (
    <button type="button" onClick={() => go(s.slug)} onMouseEnter={() => soundFX.playHoverTick()}
      className="group flex h-full w-full cursor-pointer flex-col justify-between rounded-2xl border border-white/15 bg-[#03050a]/70 p-3 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A14]/70 hover:bg-[#03050a]/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A14] md:p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-[#FF5A14]/50 bg-[#FF5A14]/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FF5A14]">{s.code}</span>
        <span aria-hidden className="font-anton text-xl text-[#FF5A14] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
      </div>
      <div>
        <h3 className="font-anton mt-2 text-lg leading-tight text-[#F2F2EE] md:text-xl">{s.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/60">{s.tagline}</p>
      </div>
    </button>
  );

  return (
    <section id="bio" className="relative scroll-mt-12 overflow-hidden bg-[#03050a]">
      <div className="relative aspect-[3/2] w-full md:aspect-[16/9] md:min-h-[520px]">
        <BioCollage className="absolute inset-0" />
        <h2 className="sr-only">{PILLARS.bio.label}</h2>
        <p className="pointer-events-none absolute left-4 top-3 hidden max-w-[16rem] rounded-md bg-[#03050a]/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF5A14] backdrop-blur-sm md:left-6 md:top-5 md:block">● {PILLARS.bio.tagline}</p>
        {/* desktop: cards on the floor strip, pointer-events pass through the gaps */}
        <ul className="pointer-events-none absolute inset-x-0 bottom-0 hidden grid-cols-4 gap-3 px-4 pb-3 md:grid md:px-6 md:pb-4">
          {list.map((s) => <li key={s.slug} className="pointer-events-auto h-[104px] lg:h-[112px]">{card(s)}</li>)}
        </ul>
      </div>
      {/* phones: the room stays on top as the slide's background image, cards stack beneath it */}
      <ul className="grid grid-cols-1 gap-3 bg-[#03050a] px-4 pb-8 pt-4 sm:grid-cols-2 md:hidden">
        {list.map((s) => <li key={s.slug} className="min-h-[104px]">{card(s)}</li>)}
      </ul>
    </section>
  );
}
