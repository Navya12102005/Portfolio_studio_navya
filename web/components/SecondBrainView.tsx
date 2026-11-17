"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import SecondBrainGraph from "./scenes/SecondBrainGraph";
import SecondBrainCamera from "./scenes/SecondBrainCamera";
import SecondBrainPanel from "./SecondBrainPanel";
import { CLUSTER_COLOR, NODES, type GraphCluster } from "@/data/knowledgeGraph";

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
  const search = useSecondBrainStore((s) => s.search);
  const setSearch = useSecondBrainStore((s) => s.setSearch);
  const selectNode = useSecondBrainStore((s) => s.selectNode);
  const [mode, setMode] = useState<"graph" | "cards">("graph");
  const q = search.trim().toLowerCase();
  const cards = NODES.filter((n) => (!focusedCluster || n.cluster === focusedCluster)
    && (!q || [n.label, n.methodology, n.cluster, ...n.techStack, ...n.outcomes].join(" ").toLowerCase().includes(q)));

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

          {mode === "cards" && (
            <div className="absolute inset-0 z-[5] overflow-y-auto bg-[#030508]/92 px-6 pb-10 pt-[230px] md:pl-[500px] md:pt-24">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
                {cards.map((n, i) => (
                  <button key={n.id} onClick={() => selectNode(n.id)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
                   >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="sn-hud-text text-[10px] uppercase tracking-widest" style={{ color: CLUSTER_COLOR[n.cluster] }}>{n.cluster} {"//"} {String(i + 1).padStart(3, "0")}</span>
                        <span className="h-2 w-2 rounded-full transition-transform group-hover:scale-150" style={{ background: CLUSTER_COLOR[n.cluster] }} />
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-[#e6edfb]">{n.label}</h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-[#b9c6e8]">{n.methodology}</p>
                    </div>
                    <div className="sn-hud-text mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-white/40">
                      <span>EXPLORE NODE</span><span style={{ color: CLUSTER_COLOR[n.cluster] }}>→</span>
                    </div>
                  </button>
                ))}
                {cards.length === 0 && <p className="sn-hud-text text-xs text-white/50">No nodes match that search.</p>}
              </div>
            </div>
          )}

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
            <div className="mt-3 flex gap-2">
              {(["graph", "cards"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                  className={`sn-hud-text flex-1 cursor-pointer rounded-lg border px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${mode === m ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:bg-white/10"}`}>
                  {m === "graph" ? "Graph" : "Cards"}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes: biosensor, AWS, hackathon…"
              aria-label="Search the Second Brain"
              className="sn-hud-text mt-3 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] text-white/80 placeholder-white/30 focus:border-[#00F0FF]/60 focus:outline-none"
            />
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
