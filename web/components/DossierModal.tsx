"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { soundFX } from "@/utils/soundManager";

const TITLES: Record<"tech" | "bio" | "ops", string> = {
  tech: "NAVYA GUPTA // TECH & AI SYSTEMS",
  bio: "NAVYA GUPTA // BIOENGINEERING R&D",
  ops: "NAVYA GUPTA // OPERATIONS & GROWTH",
};

const LINES: Record<"tech" | "bio" | "ops", string[]> = {
  tech: [
    "Stack: Next.js, React Three Fiber, TypeScript, Python, AWS Cloud.",
    "Roles: Operational Lead (AWS Student Builder Group), Startup Club President.",
    "Key Projects: NoviCord Health Platform, Agentic AI Workflows.",
  ],
  bio: [
    "Institution: B.Tech Bioengineering, VIT Bhopal (CGPA: 8.68).",
    "Research: Liquid Crystal Biosensors, Computational Docking on",
    "Pseudomonas aeruginosa (PDB: 5O7), Biomedical Optics (IIITDM Kancheepuram).",
  ],
  ops: [
    "Marketing: Mailchimp Email Automation, Campaign Analytics.",
    "Operations: Automated Excel Financial & KPI Modeling, Executive",
    "Assistant Triage, Large-Scale Event Management (Rang & Ruckus / Advitya).",
  ],
};

const CONTENT: Record<"tech" | "bio" | "ops", string> = {
  tech: [TITLES.tech, ...LINES.tech.map((l) => `- ${l}`)].join("\n"),
  bio: [TITLES.bio, ...LINES.bio.map((l) => `- ${l}`)].join("\n"),
  ops: [TITLES.ops, ...LINES.ops.map((l) => `- ${l}`)].join("\n"),
};

/**
 * Positioned at top-20 (not top-6): PerimeterHUD's hex status grid already
 * occupies top-6 right-6, so this sits below it instead of overlapping.
 */
export default function DossierModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tech" | "bio" | "ops">("tech");

  // A real PDF, generated client-side with jsPDF — not a fake alert() and
  // not a .txt wearing a PDF's name. This site is built to be honest about
  // what's actually wired up (see JarvisAssistant's ACTION_STUB messages
  // for the same principle), so this only claims "PDF" once it is one.
  const downloadDossier = () => {
    soundFX.playClickLock();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    let y = 72;

    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 200, 220);
    doc.text("CLASSIFIED OPERATOR DOSSIER // STUDIO NAVYA OS v4.0", marginX, y);
    y += 28;

    doc.setFontSize(13);
    doc.setTextColor(10, 10, 10);
    doc.text(TITLES[activeTab], marginX, y);
    y += 22;

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    for (const line of LINES[activeTab]) {
      const wrapped = doc.splitTextToSize(`- ${line}`, 480);
      doc.text(wrapped, marginX, y);
      y += 16 * wrapped.length;
    }

    doc.save(`Navya_Gupta_${activeTab}_Dossier.pdf`);
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
                  DOWNLOAD SECURE PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
