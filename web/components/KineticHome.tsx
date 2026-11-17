"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCameraRigStore } from "@/lib/cameraRigStore";
import { useServiceStore } from "@/lib/serviceStore";
import { PILLARS, servicesFor, type Pillar } from "@/lib/services";
import { soundFX } from "@/utils/soundManager";
import { REPLAY_INTRO_EVENT } from "./IntroOverlay";
import TechSlide from "./TechSlide";
import WorkOrbSection from "./orb/WorkOrbSection";

const ROLES = ["BIOENGINEER", "AI / ML BUILDER", "MEDTECH INNOVATOR", "STORYTELLER", "MARKETER", "FINANCE-MINDED", "NEGOTIATOR"];

const SKIN: Record<Pillar, { bg: string; fg: string; accent: string; sub: string }> = {
  tech: { bg: "#0A0A0A", fg: "#F2F2EE", accent: "#FF5A14", sub: "#9aa6a8" },
  bio: { bg: "#F2F2EE", fg: "#0A0A0A", accent: "#FF5A14", sub: "#4a4f52" },
  ops: { bg: "#0A0A0A", fg: "#F2F2EE", accent: "#FF5A14", sub: "#9aa6a8" },
};

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Marquee({ items, bg, fg, rev }: { items: string[]; bg: string; fg: string; rev?: boolean }) {
  const row = (k: number) => items.map((t, i) => (<span key={`${k}-${i}`} className="font-anton text-2xl md:text-4xl px-6 whitespace-nowrap">{t} <span className="opacity-40">{"////"}</span></span>));
  return (
    <div aria-hidden className="overflow-hidden py-3" style={{ background: bg, color: fg }}>
      <div className={`sn-marquee ${rev ? "rev" : ""}`}>{row(0)}{row(1)}</div>
    </div>
  );
}

function Header() {
  const [muted, setMuted] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-[600] flex items-center justify-between gap-3 px-4 md:px-8 py-3 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/10">
      <a href="#top" onClick={(e) => { e.preventDefault(); scrollToId("top"); }} className="font-anton text-xl tracking-wide text-[#F2F2EE]">NAVYA GUPTA</a>
      <nav aria-label="Primary" className="flex items-center gap-1 md:gap-3 sn-hud-text text-[11px] uppercase tracking-[0.12em] text-[#F2F2EE]">
        <a href="#work" onClick={(e) => { e.preventDefault(); soundFX.playClickLock(); scrollToId("work"); }} onMouseEnter={() => soundFX.playHoverTick()}
          className="px-2.5 py-1.5 hover:bg-[#FF5A14] hover:text-[#0A0A0A] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#19E3F0]">WORK</a>
        {(["tech", "bio", "ops"] as Pillar[]).map((p) => (
          <a key={p} href={`#${p}`} onClick={(e) => { e.preventDefault(); soundFX.playClickLock(); scrollToId(p); }} onMouseEnter={() => soundFX.playHoverTick()}
            className="px-2.5 py-1.5 hover:bg-[#FF5A14] hover:text-[#0A0A0A] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#19E3F0]">{PILLARS[p].label}</a>
        ))}
        <button onClick={() => { const n = !muted; setMuted(n); soundFX.setMuted(n); }} className="hidden sm:block px-2.5 py-1.5 opacity-60 hover:opacity-100 cursor-pointer">SFX {muted ? "OFF" : "ON"}</button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden flex flex-col justify-between bg-[#FF5A14] text-[#0A0A0A] pt-20">
      {/* hatching at the edges, as in the reel's banner scene */}
      {[0, 1].map((side) => (
        <div key={side} aria-hidden className={`absolute top-0 bottom-0 w-[8vw] ${side ? "right-0" : "left-0"}`} style={{ background: "repeating-linear-gradient(115deg,#0A0A0A 0 10px,transparent 10px 26px)", opacity: 0.9 }} />
      ))}
      <p aria-hidden className="font-anton absolute -right-[4vw] top-[14vh] text-[34vw] leading-none opacity-[0.1] select-none">GUPTA</p>
      <div className="relative px-[10vw] md:px-[12vw]">
        <p className="sn-hud-text text-[11px] uppercase tracking-[0.14em] opacity-80">SEQ 00 · B.TECH BIOENGINEERING // VIT BHOPAL // BATCH 2028</p>
        <h1 className="mt-4">
          <motion.span initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="font-slab block text-[17vw] md:text-[15vw] leading-[0.86] -skew-x-12 origin-bottom-left">NAVYA</motion.span>
          <motion.span initial={{ x: 160, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} className="font-slab block text-[17vw] md:text-[15vw] leading-[0.86] -skew-x-12 origin-bottom-left">GUPTA</motion.span>
          <span className="sr-only"> — Bioengineer, AI/ML builder, storyteller</span>
        </h1>
        <p className="font-dev text-[8vw] md:text-[5vw] mt-2 -skew-x-12 opacity-90" aria-hidden>नव्या</p>
        <p className="mt-6 max-w-2xl text-lg md:text-2xl font-medium leading-snug">
          I&apos;m a bioengineering × AI builder who turns medical and biological data into products, stories and revenue.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {(["tech", "bio", "ops"] as Pillar[]).map((p) => (
            <button key={p} onClick={() => { soundFX.playClickLock(); scrollToId(p); }} onMouseEnter={() => soundFX.playHoverTick()}
              className="sn-hud-text uppercase tracking-[0.14em] text-[12px] px-5 py-3 bg-[#0A0A0A] text-[#F2F2EE] hover:bg-[#F2F2EE] hover:text-[#0A0A0A] transition-colors cursor-pointer">
              [ {PILLARS[p].label} ▸ ]
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-12"><Marquee items={ROLES} bg="#0A0A0A" fg="#F2F2EE" /></div>
    </section>
  );
}

function PillarBand({ pillar }: { pillar: Pillar }) {
  const k = SKIN[pillar], open = useServiceStore((s) => s.open), list = servicesFor(pillar);
  return (
    <section id={pillar} className="relative overflow-hidden px-5 md:px-[8vw] py-20 md:py-28 scroll-mt-12" style={{ background: k.bg, color: k.fg }}>
      <div className="relative z-10 flex items-end justify-between gap-6 flex-wrap">
        <motion.h2 initial={{ x: -80, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-anton sn-outline text-[26vw] md:text-[18vw] leading-[0.85]" style={{ color: k.fg }}>{PILLARS[pillar].label}</motion.h2>
        <p className="sn-hud-text uppercase tracking-[0.14em] text-[12px] max-w-xs pb-4" style={{ color: k.accent }}>● {PILLARS[pillar].tagline}</p>
      </div>
      <ul className="relative z-10 mt-10 md:mt-14 border-t" style={{ borderColor: k.fg + "33" }}>
        {list.map((s, i) => (
          <motion.li key={s.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ delay: i * 0.05, duration: 0.4 }}
            className="border-b" style={{ borderColor: k.fg + "33" }}>
            <button onClick={() => { soundFX.playClickLock(); open(s.slug); }} onMouseEnter={() => soundFX.playHoverTick()}
              className="group w-full text-left py-5 md:py-6 grid grid-cols-[auto_1fr_auto] md:grid-cols-[110px_1fr_1fr_auto] gap-x-5 gap-y-1 items-baseline cursor-pointer transition-colors hover:bg-[var(--hv)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{ ["--hv" as string]: k.accent + "22", outlineColor: k.accent }}>
              <span className="sn-hud-text text-[11px] uppercase tracking-[0.12em]" style={{ color: k.accent }}>{s.code}</span>
              <span className="font-anton text-2xl md:text-4xl leading-tight">{s.title}</span>
              <span className="col-span-2 md:col-span-1 md:col-start-3 text-sm md:text-base" style={{ color: k.sub }}>{s.tagline}{!s.complete && <span className="sn-hud-text text-[10px] uppercase tracking-[0.12em] ml-2 opacity-70">· IN PROGRESS</span>}</span>
              <span aria-hidden className="font-anton text-2xl md:text-3xl row-start-1 col-start-3 md:col-start-4 transition-transform group-hover:translate-x-1" style={{ color: k.accent }}>▸</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#F2F2EE]">
      <Marquee items={["TRAVEL", "FOOD", "FASHION", "ENGINEERING THE FUTURE OF CARE"]} bg="#FF5A14" fg="#0A0A0A" rev />
      <div className="px-5 md:px-[8vw] py-16 md:py-24">
        <p className="font-anton text-[15vw] md:text-[11vw] leading-[0.9]">LET&apos;S BUILD<br />SOMETHING.</p>
        <div className="mt-10 flex flex-wrap items-center gap-4 sn-hud-text text-[12px] uppercase tracking-[0.14em]">
          <a href="mailto:hello.studionavya@gmail.com" className="px-5 py-3 bg-[#FF5A14] text-[#0A0A0A] hover:bg-[#F2F2EE] transition-colors">[ EMAIL ▸ ]</a>
          <span className="opacity-70">or ask J.A.R.V.I.S. (bottom-right)</span>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-4 sn-hud-text text-[11px] uppercase tracking-[0.12em] opacity-60">
          <span>© NAVYA GUPTA · VIT BHOPAL · INDIA</span>
          <span className="flex gap-5">
            <button className="cursor-pointer hover:opacity-100" onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}>REPLAY INTRO ▸</button>
            <button className="cursor-pointer hover:opacity-100" onClick={() => scrollToId("top")}>BACK TO CORE ▲</button>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** The post-intro site: same visual language as the kinetic reel (Anton/Archivo type, orange/black/bone, bands, marquees, hard blocks). */
export default function KineticHome() {
  const domain = useCameraRigStore((s) => s.domain);
  const requestId = useCameraRigStore((s) => s.requestId);

  // The J.A.R.V.I.S. boot's domain choice lands the visitor on that pillar once the intro slides away.
  useEffect(() => {
    if (requestId === 0) return;
    if (domain === "tech" || domain === "bio" || domain === "ops") scrollToId(domain);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [domain, requestId]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <WorkOrbSection />
        <TechSlide />
        <Marquee items={["BIOMEDICAL INNOVATION", "MACHINE LEARNING", "HEALTHCARE AI", "DIAGNOSTICS", "GENOMICS"]} bg="#FF5A14" fg="#0A0A0A" />
        <PillarBand pillar="bio" />
        <Marquee items={["BRAND STORYTELLING", "GO-TO-MARKET", "FINANCIAL MODELLING", "NEGOTIATION"]} bg="#0A0A0A" fg="#F2F2EE" rev />
        <PillarBand pillar="ops" />
      </main>
      <Footer />
    </>
  );
}
