"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense } from "react";
import * as THREE from "three";
import DustField from "./DustField";
import SchematicLayer from "./SchematicLayer";
import BootHorizon from "./BootHorizon";
import { BioEngineeringScene } from "./BioEngineeringScene";
import { OperationsArenaScene } from "./OperationsArenaScene";

/**
 * The single persistent R3F canvas behind the whole page. Scene 0 (boot
 * horizon) lives here now; Scenes 1-3 mount into the same canvas as the
 * user scrolls past the boot sequence (next milestone).
 *
 * NOTE: `preserveDrawingBuffer: true` is kept on intentionally — this sandbox's
 * headless/software-GL screenshot pipeline needs it to capture the canvas
 * reliably for automated visual testing (see AGENTS.md / build notes). It
 * has a negligible cost on a real GPU and is safe to leave in.
 */
export default function SceneRoot({
  scrollVelocity,
  pitch,
}: {
  scrollVelocity: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
}) {
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
        <fog attach="fog" args={["#030508", 10, 60]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 8, 6]} intensity={0.6} color="#9fd8ff" />

        <Suspense fallback={null}>
          <SchematicLayer />
          <BootHorizon pitch={pitch} />
          <DustField velocity={scrollVelocity} />
          {/* Scene 2 centerpiece — mounted now for verification; proper
              scroll-triggered scene choreography/domain switching is the
              next milestone, so camera framing here is provisional. */}
          <BioEngineeringScene />
          <OperationsArenaScene />
        </Suspense>

        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.08} luminanceSmoothing={0.4} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} blendFunction={BlendFunction.NORMAL} />
          <Vignette eskil={false} offset={0.25} darkness={0.65} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
