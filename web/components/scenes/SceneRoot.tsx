"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";
import SchematicLayer from "./SchematicLayer";
import { BioEngineeringScene } from "./BioEngineeringScene";
import { OperationsArenaScene } from "./OperationsArenaScene";
import { TechScene } from "./TechScene";
import CameraRig from "./CameraRig";
import HeroSummon from "./HeroSummon";

/**
 * The single persistent R3F canvas behind the whole page.
 *
 * Deliberately minimal per the "Stark-Minimalist" direction: no grid
 * floor, no particle fields — a pure carbon-obsidian void (set on
 * SchematicLayer's own shader, which is now just a soft cursor glow +
 * vignette, no grid/PCB/starfield), with the three domain centerpieces
 * spaced far apart in X/Y/Z so each floats alone in its own space
 * instead of reading as one cluttered cluster. A few off-axis point
 * lights give each centerpiece a soft rim-lit edge against the void.
 *
 * NOTE: `preserveDrawingBuffer: true` is kept on intentionally — this sandbox's
 * headless/software-GL screenshot pipeline needs it to capture the canvas
 * reliably for automated visual testing (see AGENTS.md / build notes). It
 * has a negligible cost on a real GPU and is safe to leave in.
 */
export default function SceneRoot() {
  return (
    // NOTE: z-index intentionally NOT negative. A negative z-index ancestor
    // around a WebGL2 canvas breaks real pointer-event hit-testing in this
    // sandbox's headless/software-GL Chromium (confirmed in isolation — see
    // build notes); elementFromPoint still finds the canvas, but actual
    // input routing resolves to <body> instead, silently eating every
    // click. z-0 + DOM order (this mounts first) keeps it visually behind
    // every other layer (all of which use explicit z-index >= 50) without
    // triggering that bug — safe and correct on a real browser either way.
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        camera={{ position: [0, 1.4, 9], fov: 50, near: 0.1, far: 200 }}
      >
        <color attach="background" args={["#030508"]} />
        <fog attach="fog" args={["#030508", 14, 70]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[4, 8, 6]} intensity={0.45} color="#9fd8ff" />
        <CameraRig />

        <Suspense fallback={null}>
          <SchematicLayer />
          <HeroSummon />

          {/* rim lights, one per centerpiece, positioned behind and above
              each object (farther from the camera than the object itself)
              so its far edge catches a soft glow against the void */}
          <pointLight position={[-9, 2, -10]} intensity={2.4} distance={9} color="#00F0FF" />
          <TechScene />

          <pointLight position={[8, 1.5, -12]} intensity={2.4} distance={9} color="#FF5E00" />
          <BioEngineeringScene />

          <pointLight position={[0, -1, -17]} intensity={2.6} distance={10} color="#00F0FF" />
          <OperationsArenaScene />
        </Suspense>

        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.12} luminanceSmoothing={0.45} mipmapBlur />
          <Vignette eskil={false} offset={0.3} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
