"use client";

import React, { useEffect, useState } from "react";

export default function LiveTicker() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#030508]/90 backdrop-blur-md border-t border-[#00F0FF]/20 px-6 py-2 flex justify-between items-center font-mono text-[10px] text-gray-400">
      <div className="flex items-center space-x-4">
        <span className="text-[#00F0FF]">LOC: 23.25° N, 77.41° E [SEHORE / BHOPAL, IN]</span>
        <span className="hidden sm:inline">LOCAL TIME: {time} IST</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-[#00FF88]">STATUS: ALL SYSTEMS NOMINAL</span>
        <span className="hidden md:inline text-gray-500">|</span>
        <span className="hidden md:inline">DEPLOYMENT: STUDIO NAVYA OS v4.0</span>
      </div>
    </div>
  );
}
