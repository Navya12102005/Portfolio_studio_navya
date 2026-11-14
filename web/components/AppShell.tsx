"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/useLenis";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import Cursor from "./hud/Cursor";
import PerimeterHUD from "./hud/PerimeterHUD";
import SceneRoot from "./scenes/SceneRoot";
import LightweightFallback from "./scenes/LightweightFallback";
import WakeUpText from "./scenes/WakeUpText";
import JarvisAssistant from "./JarvisAssistant";
import JarvisBootSequence from "./JarvisBootSequence";
import ProjectModal from "./ProjectModal";
import SecondBrainView from "./SecondBrainView";
import BioTelemetryWidget from "./BioTelemetryWidget";
import DossierModal from "./DossierModal";
import EasterEggOverlay from "./EasterEggOverlay";
import LiveTicker from "./LiveTicker";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function AppShell() {
  const { velocity } = useLenis();
  const perf = useDevicePerformance();
  const secondBrainOpen = useSecondBrainStore((s) => s.open);
  const pitch = useRef(0);
  const bootRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLDivElement>(null);

  // Lenis drives scroll; ScrollTrigger needs to hear about it on every tick.
  useEffect(() => {
    const id = gsap.ticker.add(() => ScrollTrigger.update());
    return () => {
      gsap.ticker.remove(id);
    };
  }, []);

  useEffect(() => {
    if (!bootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: bootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => {
            pitch.current = self.progress;
          },
        },
      });
      gsap.to(wakeRef.current, {
        opacity: 0,
        y: -40,
        scrollTrigger: {
          trigger: bootRef.current,
          start: "10% top",
          end: "55% top",
          scrub: 0.6,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Gate the heavy WebGL canvas behind device-performance detection.
          `determined` stays false until the client-side GPU/width check
          has actually run, so the full scene is never even briefly
          mounted on a low-power device while that check is pending. */}
      {perf.determined && !secondBrainOpen && (perf.tier === "low" ? <LightweightFallback /> : <SceneRoot scrollVelocity={velocity} pitch={pitch} />)}
      <Cursor />
      <PerimeterHUD />
      <BioTelemetryWidget />
      <DossierModal />
      <EasterEggOverlay />
      <LiveTicker />

      {/* pointer-events-none: lets clicks reach the 3D canvas (domain nodes)
          beneath. Nothing inside <main> is currently interactive; if that
          changes, re-enable pointer-events on that specific element. */}
      <main className="relative z-10 pointer-events-none">
        <section ref={bootRef} className="relative h-[220vh]">
          <div className="sticky top-0 h-screen flex flex-col items-start justify-center px-8 md:px-16">
            <div ref={wakeRef}>
              <WakeUpText />
            </div>
          </div>
        </section>

        <section className="relative min-h-screen flex items-center justify-center px-8 md:px-16 text-center">
          <div className="sn-glass rounded-2xl px-10 py-12 max-w-xl">
            <p className="sn-hud-text text-xs text-[var(--sn-cyan)]/70 mb-3">
              {"// SCENE 0 COMPLETE — COMMAND CENTER ONLINE"}
            </p>
            <h2 className="sn-title text-2xl md:text-3xl font-bold text-[#e6edfb]">
              Tech · Bioengineering · Operations
            </h2>
            <p className="mt-4 text-sm text-[#b9c6e8]">
              Scenes 1–3 centerpieces are mounted; full scroll-triggered
              choreography/domain switching between them is still ahead.
            </p>
          </div>
        </section>
      </main>

      <JarvisAssistant />
      <ProjectModal />
      <SecondBrainView />
      <JarvisBootSequence />
    </>
  );
}
