"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFX } from "@/utils/soundManager";

const CONTENT: Record<"tech" | "bio" | "ops", string> = {
  tech: "NAVYA GUPTA // TECH & AI SYSTEMS\n- Stack: Next.js, React Three Fiber, TypeScript, Python, AWS Cloud.\n- Roles: Operational Lead (AWS Student Builder Group), Startup Club President.\n- Key Projects: NoviCord Health Platform, Agentic AI Workflows.",
  bio: "NAVYA GUPTA // BIOENGINEERING R&D\n- Institution: B.Tech Bioengineering, VIT Bhopal (CGPA: 8.68).\n- Research: Liquid Crystal Biosensors, Computational Docking on Pseudomonas aeruginosa (PDB: 5O7), Biomedical Optics (IIITDM Kancheepuram).",
  ops: "NAVYA GUPTA // OPERATIONS & GROWTH\n- Marketing: Mailchimp Email Automation, Campaign Analytics.\n- Operations: Automated Excel Financial & KPI Modeling, Executive Assistant Triage, Large-Scale Event Management (Rang & Ruckus / Advitya).",
};

/**
 * Positioned at top-20 (not top-6): PerimeterHUD's hex status grid already
 * occupies top-6 right-6, so this sits below it instead of overlapping.
 */
export default function DossierModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tech" | "bio" | "ops">("tech");

  // A real download instead of a fake alert — this site is built to be
  // honest about what's actually wired up (see JarvisAssistant's ACTION_STUB
  // messages for the same principle). No PDF library is installed, so this
  // generates a genuine downloadable .txt summary rather than faking a PDF.
  const downloadDossier = () => {
    soundFX.playClickLock();
    const blob = new Blob([CONTENT[activeTab]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Navya_Gupta_${activeTab}_Dossier.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => {
          soundFX.playClickLock();
          setIsOpen(true);
        }}
        onMouseEnter={() => soundFX.playHoverTick()}
        className="fixed top-20 right-6 z-40 bg-[#00F0FF]/10 border border-[#00F0FF]/40 hover:bg-[#00F0FF]/20 text-[#00F0FF] px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.2)]"
      >
        [ DOSSIER ]
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl font-mono"
          >
            <div className="w-full max-w-2xl bg-[#030508] border border-[#00F0FF]/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-[#00F0FF]/20 pb-4">
                <span className="text-[#00F0FF] text-sm font-bold tracking-widest">CLASSIFIED OPERATOR DOSSIER</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-sm cursor-pointer">✕</button>
              </div>

              <div className="flex space-x-2 border-b border-gray-800 pb-2 text-xs">
                {(["tech", "bio", "ops"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${activeTab === tab ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40" : "text-gray-400 hover:text-white"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-black/50 border border-gray-800 rounded-xl p-4 text-xs text-cyan-200 whitespace-pre-line leading-relaxed min-h-[160px]">
                {CONTENT[activeTab]}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={downloadDossier}
                  className="px-5 py-2 bg-[#00F0FF] text-black font-bold text-xs rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  DOWNLOAD DOSSIER (.TXT)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
