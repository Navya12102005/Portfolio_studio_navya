"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JarvisWaveform from "./JarvisWaveform";
import { isSpeechRecognitionSupported, listenOnce, speak, stopSpeaking } from "@/lib/speech";
import { useSecondBrainStore } from "@/lib/secondBrainStore";
import type { GraphCluster } from "@/data/knowledgeGraph";
import { soundFX } from "@/utils/soundManager";

type Message = { role: "system" | "user"; text: string };

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: "View Bioengineering R&D", prompt: "tell me about your bioengineering R&D" },
  { label: "Check Tech Stack", prompt: "what's your tech stack" },
  { label: "Book Discovery Call", prompt: "book a discovery call" },
  { label: "Download Resume/Dossier", prompt: "send me the resume and dossier" },
  { label: "Open Second Brain", prompt: "open the knowledge graph" },
];

function isGraphCluster(d: unknown): d is GraphCluster {
  return d === "tech" || d === "bio" || d === "ops";
}

export default function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: "J.A.R.V.I.S. online. Studio Navya telemetry active. Select a domain or query capabilities." },
  ]);
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [micSupported, setMicSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // browser-feature check — must run post-mount: SpeechRecognition only
  // exists client-side, so a lazy useState initializer (which runs during
  // the hydration render itself) would mismatch the server's render.
  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // stop any in-flight speech if the panel closes or unmounts
  useEffect(() => {
    if (!isOpen) stopSpeaking();
    return () => stopSpeaking();
  }, [isOpen]);

  const openGraph = useSecondBrainStore((s) => s.openGraph);
  const focusCluster = useSecondBrainStore((s) => s.focusCluster);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    // explicit "open the graph" intent — handled client-side since it names
    // no domain keyword the API's local router would otherwise detect
    if (/second brain|knowledge graph/i.test(text)) {
      openGraph();
    }

    let replyText = "Telemetry connection interrupted. Try again.";
    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      replyText = data.response ?? replyText;
      // command bridge: a domain-shaped query (e.g. "show me her
      // bioengineering projects") isolates/zooms the matching Second Brain
      // cluster, independent of whether Gemini or the local router answered
      if (isGraphCluster(data.domain)) focusCluster(data.domain);
    } catch {
      // keep fallback message
    }

    setMessages((prev) => [...prev, { role: "system", text: replyText }]);
    if (voiceOut) {
      speak(replyText, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput("");
    await send(text);
  };

  const handleMic = async () => {
    if (!micSupported || listening) return;
    setListening(true);
    const transcript = await listenOnce();
    setListening(false);
    if (transcript) await send(transcript);
  };

  // bottom-14, not bottom-6: LiveTicker now occupies the bottom-0 edge
  // strip, so the orb trigger sits clear above it
  return (
    <div className="fixed bottom-14 right-6 z-50 font-mono">
      {/* Arc Reactor Trigger Orb */}
      <motion.button
        onClick={() => {
          soundFX.playClickLock();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => soundFX.playHoverTick()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#0044FF] p-[2px] shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center relative cursor-pointer"
      >
        <div className="w-full h-full bg-[#030508] rounded-full flex items-center justify-center relative overflow-hidden">
          <div className={`absolute inset-0 bg-[#00F0FF] opacity-20 ${speaking ? "animate-ping" : "animate-pulse"}`} />
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
            className="absolute bottom-20 right-0 w-[380px] h-[560px] bg-[#030508]/95 backdrop-blur-2xl border border-[#00F0FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#00F0FF]/10 border-b border-[#00F0FF]/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-[#00F0FF] ${speaking ? "animate-ping" : "animate-pulse"}`} />
                  <span className="text-[#00F0FF] text-xs font-bold tracking-wider">J.A.R.V.I.S. // STUDIO NAVYA</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVoiceOut((v) => !v);
                      if (voiceOut) stopSpeaking();
                    }}
                    title={voiceOut ? "Mute voice output" : "Unmute voice output"}
                    className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer ${voiceOut ? "border-[#00F0FF]/50 text-[#00F0FF]" : "border-gray-700 text-gray-500"}`}
                  >
                    {voiceOut ? "🔊" : "🔇"}
                  </button>
                  <button onClick={() => { soundFX.playClickLock(); setIsOpen(false); }} className="text-gray-400 hover:text-white text-sm cursor-pointer">✕</button>
                </div>
              </div>
              {/* audio-reactive waveform */}
              <div className="mt-2">
                <JarvisWaveform speaking={speaking} />
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl border ${m.role === "user" ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-cyan-200" : "bg-gray-900/90 border-gray-800 text-gray-300"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {listening && (
                <div className="flex items-start">
                  <div className="max-w-[85%] p-3 rounded-xl border bg-[#FF5E00]/10 border-[#FF5E00]/40 text-[#FFB347] animate-pulse">
                    listening...
                  </div>
                </div>
              )}
            </div>

            {/* Quick-action chips */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  onMouseEnter={() => soundFX.playHoverTick()}
                  className="text-[9px] px-2.5 py-1.5 rounded-full border border-[#00F0FF]/25 text-[#00F0FF]/80 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 cursor-pointer whitespace-nowrap"
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#00F0FF]/20 bg-black/50 flex items-center space-x-2">
              {micSupported && (
                <button
                  type="button"
                  onClick={handleMic}
                  disabled={listening}
                  title="Speak to J.A.R.V.I.S."
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border cursor-pointer shrink-0 ${
                    listening ? "border-[#FF5E00] text-[#FF5E00] animate-pulse" : "border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10"
                  }`}
                >
                  🎙
                </button>
              )}
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
