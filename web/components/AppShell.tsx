"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/useLenis";
import KineticHome from "./KineticHome";
import JarvisAssistant from "./JarvisAssistant";
import JarvisVoiceAgent from "./JarvisVoiceAgent";
import ProjectModal from "./ProjectModal";
import SecondBrainView from "./SecondBrainView";
import DossierModal from "./DossierModal";
import EasterEggOverlay from "./EasterEggOverlay";
import ServiceDossier from "./services/ServiceDossier";
import JarvisBootSequence from "./JarvisBootSequence";
import IntroOverlay from "./IntroOverlay";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Order of events: J.A.R.V.I.S. boot (3 domains) -> kinetic title sequence (IntroOverlay)
 * -> KineticHome, which carries the reel's look through the rest of the site.
 * The old persistent 3D HUD landing (SceneRoot + camera rig) is no longer mounted.
 */
export default function AppShell() {
  useLenis();

  useEffect(() => {
    const id = gsap.ticker.add(() => ScrollTrigger.update());
    return () => { gsap.ticker.remove(id); };
  }, []);

  return (
    <>
      <KineticHome />
      <DossierModal />
      <EasterEggOverlay />
      <ServiceDossier />
      <JarvisAssistant />
      <JarvisVoiceAgent />
      <ProjectModal />
      <SecondBrainView />
      <IntroOverlay />
      <JarvisBootSequence />
    </>
  );
}
