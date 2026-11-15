"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/useLenis";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import Cursor from "./hud/Cursor";
import TopStatusBar from "./hud/TopStatusBar";
import SceneRoot from "./scenes/SceneRoot";
import LightweightFallback from "./scenes/LightweightFallback";
import JarvisAssistant from "./JarvisAssistant";
import ProjectModal from "./ProjectModal";
import SecondBrainView from "./SecondBrainView";
import DossierModal from "./DossierModal";
import EasterEggOverlay from "./EasterEggOverlay";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function AppShell() {
  // Keeps the Lenis smooth-scroll driver running; the main canvas no
  // longer reacts to scroll velocity (the particle field it drove was
  // removed), so the velocity ref itself isn't read here.
  useLenis();
  const perf = useDevicePerformance();
  const secondBrainOpen = useSecondBrainStore((s) => s.open);

  // Deferred-by-one-frame mirror of secondBrainOpen for gating the main
  // canvas. Both SceneRoot and SecondBrainView own an R3F <Canvas>, each
  // with its own internal react-reconciler root; flipping the same store
  // flag unmounts one and mounts the other in the SAME React commit,
  // which races with drei's <Html> portal teardown inside SceneRoot's
  // OperationsArenaScene (confirmed via a removeChild DOMException and
  // "synchronously unmount a root while rendering" warnings). Mirroring
  // the flag one animation frame later puts the unmount/mount in separate
  // commits, which is all it takes to avoid the race on both open and
  // close — the brief single frame where neither or both canvases are
  // mounted is not visible to a user.
  const [secondBrainOpenDeferred, setSecondBrainOpenDeferred] = useState(secondBrainOpen);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSecondBrainOpenDeferred(secondBrainOpen));
    return () => cancelAnimationFrame(raf);
  }, [secondBrainOpen]);

  // Lenis drives scroll; ScrollTrigger needs to hear about it on every tick.
  useEffect(() => {
    const id = gsap.ticker.add(() => ScrollTrigger.update());
    return () => {
      gsap.ticker.remove(id);
    };
  }, []);

  return (
    // No intro/boot screen: the site loads straight into the portfolio with
    // one soft fade-in.
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}>
      {/* Gate the heavy WebGL canvas behind device-performance detection.
          `determined` stays false until the client-side GPU/width check
          has actually run, so the full scene is never even briefly
          mounted on a low-power device while that check is pending. */}
      {perf.determined && !secondBrainOpenDeferred && (perf.tier === "low" ? <LightweightFallback /> : <SceneRoot />)}
      <Cursor />
      <TopStatusBar showNav={perf.determined && perf.tier === "high"} />
      <DossierModal />
      <EasterEggOverlay />

      {/* pointer-events-none: lets clicks reach the 3D canvas (domain nodes)
          beneath. Nothing inside <main> is currently interactive; if that
          changes, re-enable pointer-events on that specific element. */}
      <main className="relative z-10 pointer-events-none min-h-[160vh]">
        <div className={`fixed bottom-8 left-8 max-w-xs ${perf.tier === "low" ? "hidden" : ""}`}>
          <p className="sn-hud-text text-[10px] text-[var(--sn-cyan)]/50 tracking-widest">NAVYA GUPTA</p>
          <p className="text-sm text-[#c9d3ee]/70 mt-1">Bioengineering × AI — Tech, Bio & Ops, explored in 3D.</p>
        </div>
      </main>

      <JarvisAssistant />
      <ProjectModal />
      <SecondBrainView />
    </motion.div>
  );
}
