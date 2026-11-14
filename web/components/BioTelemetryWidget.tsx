"use client";

import React, { useEffect, useState } from "react";

/**
 * Positioned at top-20 (not top-6): PerimeterHUD already occupies
 * top-6 left-6 with "STUDIO.NAVYA // OS v4.0" + rotation readout, so this
 * sits directly below it instead of overlapping.
 */
export default function BioTelemetryWidget() {
  const [bpm, setBpm] = useState(72);
  const [cpuLoad, setCpuLoad] = useState(14);
  const [status, setStatus] = useState("STABLE");

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let speedSum = 0;
    let count = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      speedSum += speed;
      count++;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      const avgSpeed = count > 0 ? speedSum / count : 0;
      speedSum = 0;
      count = 0;

      const calculatedBpm = Math.min(130, Math.max(65, Math.round(70 + avgSpeed * 0.4)));
      const calculatedCpu = Math.min(85, Math.max(10, Math.round(12 + avgSpeed * 0.25)));

      setBpm(calculatedBpm);
      setCpuLoad(calculatedCpu);
      setStatus(calculatedBpm > 95 ? "HIGH INTENSITY" : "STABLE");
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed top-20 left-6 z-40 hidden md:flex items-center space-x-4 bg-[#030508]/80 backdrop-blur-xl border border-[#00F0FF]/30 px-4 py-2 rounded-xl font-mono text-xs text-[#00F0FF]">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${status === "STABLE" ? "bg-[#00F0FF]" : "bg-[#FF5E00]"} animate-pulse`} />
        <span>SYS: {status}</span>
      </div>
      <div className="text-gray-500">|</div>
      <div>HR: <span className="text-white font-bold">{bpm} BPM</span></div>
      <div className="text-gray-500">|</div>
      <div>LOAD: <span className="text-white font-bold">{cpuLoad}%</span></div>
    </div>
  );
}
