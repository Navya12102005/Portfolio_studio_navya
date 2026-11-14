"use client";

import { AnimatePresence, motion } from "framer-motion";
import { NODES, CLUSTER_COLOR } from "@/data/knowledgeGraph";
import { useSecondBrainStore } from "@/lib/secondBrainStore";

export default function SecondBrainPanel() {
  const selectedId = useSecondBrainStore((s) => s.selectedNodeId);
  const selectNode = useSecondBrainStore((s) => s.selectNode);
  const node = selectedId ? NODES.find((n) => n.id === selectedId) : null;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          role="dialog"
          aria-label={`${node.label} details`}
          className="fixed top-0 right-0 z-[520] h-full w-full md:w-[420px] sn-glass border-l flex flex-col overflow-hidden"
          style={{ borderColor: CLUSTER_COLOR[node.cluster] + "55" }}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <p className="sn-hud-text text-[10px] tracking-widest" style={{ color: CLUSTER_COLOR[node.cluster] }}>
                NODE // {node.cluster.toUpperCase()}
              </p>
              <h2 className="sn-title text-lg font-bold text-[#e6edfb] mt-1">{node.label}</h2>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="sn-hud-text text-xs text-white/60 border border-white/20 rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/10 cursor-pointer"
              aria-label="Close node detail"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="sn-hud-text text-[10px] text-white/50 mb-2 tracking-widest">METHODOLOGY</p>
            <p className="text-sm text-[#b9c6e8] leading-relaxed">{node.methodology}</p>

            <p className="sn-hud-text text-[10px] text-white/50 mt-6 mb-2 tracking-widest">TECH STACK</p>
            <div className="flex flex-wrap gap-2">
              {node.techStack.map((t) => (
                <span key={t} className="sn-hud-text text-[10px] px-2.5 py-1 rounded border border-white/15 text-white/70">
                  {t}
                </span>
              ))}
            </div>

            <p className="sn-hud-text text-[10px] text-white/50 mt-6 mb-2 tracking-widest">OUTCOMES</p>
            <ul className="space-y-1.5">
              {node.outcomes.map((o, i) => (
                <li key={i} className="text-sm text-[#c9d3ee] flex gap-2">
                  <span style={{ color: CLUSTER_COLOR[node.cluster] }}>▸</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
