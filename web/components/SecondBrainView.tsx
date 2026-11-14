"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import SecondBrainGraph from "./scenes/SecondBrainGraph";
import SecondBrainCamera from "./scenes/SecondBrainCamera";
import SecondBrainPanel from "./SecondBrainPanel";
import { CLUSTER_COLOR, type GraphCluster } from "@/data/knowledgeGraph";

const CLUSTER_LABEL: Record<GraphCluster, string> = {
  tech: "Tech & AI",
  bio: "Bioengineering",
  ops: "Ops & Marketing",
};

/**
 * Full-screen "Second Brain" knowledge-graph view. Owns its own WebGL
 * canvas, so it's only ever mounted when `open` is true and the main
 * persistent canvas (SceneRoot) is unmounted at the same time — running
 * two WebGL contexts simultaneously is unnecessary here (see AppShell).
 */
export default function SecondBrainView() {
  const open = useSecondBrainStore((s) => s.open);
  const closeGraph = useSecondBrainStore((s) => s.closeGraph);
  const focusedCluster = useSecondBrainStore((s) => s.focusedCluster);
  const focusCluster = useSecondBrainStore((s) => s.focusCluster);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[700] bg-[#030508]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            camera={{ position: [0, -1, 9], fov: 50, near: 0.1, far: 200 }}
          >
            <color attach="background" args={["#030508"]} />
            <fog attach="fog" args={["#030508", 10, 60]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[4, 8, 6]} intensity={0.5} color="#9fd8ff" />
            <SecondBrainCamera />
            <Suspense fallback={null}>
              <SecondBrainGraph />
            </Suspense>
            <EffectComposer>
              <Bloom intensity={1.3} luminanceThreshold={0.1} luminanceSmoothing={0.4} mipmapBlur />
            </EffectComposer>
          </Canvas>

          <div className="absolute top-6 left-6 z-10 sn-glass rounded-xl px-5 py-4">
            <p className="sn-hud-text text-[10px] text-white/50 tracking-widest mb-2">SECOND BRAIN // KNOWLEDGE GRAPH</p>
            <div className="flex gap-3">
              {(Object.keys(CLUSTER_LABEL) as GraphCluster[]).map((c) => (
                <button
                  key={c}
                  onClick={() => focusCluster(focusedCluster === c ? null : c)}
                  className="sn-hud-text text-[10px] px-3 py-1.5 rounded-full border flex items-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    borderColor: focusedCluster === c ? CLUSTER_COLOR[c] : "rgba(255,255,255,0.15)",
                    color: focusedCluster === c ? CLUSTER_COLOR[c] : "rgba(255,255,255,0.6)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: CLUSTER_COLOR[c] }} />
                  {CLUSTER_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={closeGraph}
            className="absolute top-6 right-6 z-10 sn-hud-text text-xs text-white/70 border border-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/10 cursor-pointer"
            aria-label="Close Second Brain graph"
          >
            ✕
          </button>

          <SecondBrainPanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
