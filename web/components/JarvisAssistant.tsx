"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", text: "J.A.R.V.I.S. online. Studio Navya telemetry active. Select a domain or query capabilities." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "system", text: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "system", text: "Telemetry connection interrupted. Try again." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono">
      {/* Arc Reactor Trigger Orb */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#0044FF] p-[2px] shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center relative cursor-pointer"
      >
        <div className="w-full h-full bg-[#030508] rounded-full flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00F0FF] opacity-20 animate-pulse" />
          <span className="text-[#00F0FF] text-xs font-bold tracking-widest">AI</span>
        </div>
      </motion.button>

      {/* HUD Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[380px] h-[500px] bg-[#030508]/95 backdrop-blur-2xl border border-[#00F0FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#00F0FF]/10 border-b border-[#00F0FF]/20 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
                <span className="text-[#00F0FF] text-xs font-bold tracking-wider">J.A.R.V.I.S. // STUDIO NAVYA</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl border ${m.role === "user" ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-cyan-200" : "bg-gray-900/90 border-gray-800 text-gray-300"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#00F0FF]/20 bg-black/50 flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask J.A.R.V.I.S. about Navya's domains..."
                className="flex-1 bg-transparent border border-[#00F0FF]/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
              <button type="submit" className="px-4 py-2 bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] rounded-lg text-xs font-bold hover:bg-[#00F0FF]/30 transition-colors cursor-pointer">
                SEND
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
