"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CartoonAvatar, { type Mood } from "./CartoonAvatar";

const BUBBLE: Record<Mood, string> = {
  idle: "Hey there! Move your cursor around!",
  curious: "Ooh, I see you! Come closer…",
  hyped: "WOW! Now we're talking! 🎉",
};

type Props = {
  headline?: string;
  subheadline?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

/** Hero: copy + CTAs on the left, the cursor-reactive 80s cartoon in a glowing card on the right. */
export default function HeroSection({
  headline = "Build the Future with Retro Energy",
  subheadline = "Bold ideas, big colour and zero boring. A portfolio-grade launchpad for products that look like Saturday morning and ship like Monday.",
  primaryLabel = "Get Started",
  secondaryLabel = "Learn More",
  onPrimary,
  onSecondary,
}: Props) {
  const [mood, setMood] = useState<Mood>("idle");

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {/* neon glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-fuchsia-600/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-[130px]" />

      <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 lg:gap-20">
        {/* left: copy */}
        <div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            ● Now playing · Season 1
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {headline.split(" ").map((w, i, a) => (
              <span key={i} className={i >= a.length - 2 ? "bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent" : ""}>{w} </span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            {subheadline}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-9 flex flex-wrap items-center gap-4">
            <motion.button type="button" onClick={onPrimary} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-7 py-3.5 text-base font-bold text-white shadow-[0_0_0_rgba(255,46,136,0)] transition-shadow duration-300 hover:shadow-[0_0_34px_rgba(255,46,136,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
              {primaryLabel}
            </motion.button>
            <motion.button type="button" onClick={onSecondary} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:border-cyan-300/60 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
              {secondaryLabel}
            </motion.button>
          </motion.div>
        </div>

        {/* right: avatar card */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative mx-auto w-full max-w-md">
          <div aria-hidden className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-cyan-400 opacity-60 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-black bg-gradient-to-b from-indigo-600 via-fuchsia-700 to-slate-900 p-6 pt-10 shadow-[8px_8px_0_#000]">
            {/* retro sun stripes */}
            <div aria-hidden className="absolute left-1/2 top-6 h-44 w-44 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 to-pink-500 opacity-90"
              style={{ WebkitMaskImage: "repeating-linear-gradient(#000 0 10px, transparent 10px 14px)", maskImage: "repeating-linear-gradient(#000 0 10px, transparent 10px 14px)" }} />
            <CartoonAvatar className="relative mx-auto w-[88%]" onMoodChange={setMood} />
          </div>

          {/* speech bubble */}
          <div className="absolute -top-5 -left-2 sm:-left-8" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={mood} initial={{ opacity: 0, scale: 0.8, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: mood === "hyped" ? 3 : -3 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="relative max-w-[230px] rounded-2xl border-[3px] border-black bg-yellow-300 px-4 py-2.5 text-sm font-extrabold leading-snug text-black shadow-[4px_4px_0_#000]">
                {BUBBLE[mood]}
                <span aria-hidden className="absolute -bottom-[11px] left-8 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-black bg-yellow-300" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
