"use client";

import { useEffect, useState } from "react";

export type PerfTier = "high" | "low";

export type DevicePerformance = {
  tier: PerfTier;
  isMobile: boolean;
  isTouch: boolean;
  reason: string; // which signal decided the tier — useful for debugging/telemetry
  determined: boolean; // false until the client-side check has actually run
};

const LOW_POWER_RENDERER_PATTERNS = [
  /swiftshader/i,
  /llvmpipe/i,
  /software/i, // e.g. "ANGLE (Software...)" — catches this sandbox's own renderer, deliberately
  /mali-4/i,
  /adreno\s*(2|3)\d\d/i,
  /powervr\s*sgx/i,
  /intel.*hd graphics/i, // older integrated Intel (not Iris/Xe, which don't match this)
];

function detectGpuRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
  } catch {
    return null;
  }
}

function computeTier(): DevicePerformance {
  const width = window.innerWidth;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const isMobile = width < 768 || coarsePointer;

  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const renderer = detectGpuRenderer();
  const rendererIsLowPower = !!renderer && LOW_POWER_RENDERER_PATTERNS.some((p) => p.test(renderer));

  if (rendererIsLowPower) return { tier: "low", isMobile, isTouch: coarsePointer, reason: `gpu:${renderer}`, determined: true };
  if (memory !== undefined && memory <= 4) return { tier: "low", isMobile, isTouch: coarsePointer, reason: `deviceMemory:${memory}GB`, determined: true };
  if (cores <= 4 && isMobile) return { tier: "low", isMobile, isTouch: coarsePointer, reason: `cores:${cores}+mobile`, determined: true };
  if (isMobile && width < 420) return { tier: "low", isMobile, isTouch: coarsePointer, reason: `narrow-mobile:${width}px`, determined: true };

  return { tier: "high", isMobile, isTouch: coarsePointer, reason: "no low-power signal", determined: true };
}

/**
 * Detects whether this device should get the full WebGL experience
 * (bloom, chromatic aberration, the 3D canvas) or the lightweight
 * fallback (CSS glassmorphism + 2D canvas particle grid). Checks GPU
 * renderer string (via WEBGL_debug_renderer_info), core count, device
 * memory, and screen width/pointer type. Runs once on mount — the
 * result doesn't change mid-session.
 */
export function useDevicePerformance(): DevicePerformance {
  const [perf, setPerf] = useState<DevicePerformance>({ tier: "high", isMobile: false, isTouch: false, reason: "ssr-default", determined: false });

  useEffect(() => {
    // ?forceTier=low|high — lets this be verified deterministically in
    // environments (like this sandbox) whose own GPU renderer is a
    // software implementation and would otherwise always report "low".
    const forced = new URLSearchParams(window.location.search).get("forceTier");
    if (forced === "low" || forced === "high") {
      setPerf({ ...computeTier(), tier: forced, reason: `forced:${forced}`, determined: true });
      return;
    }
    setPerf(computeTier());
  }, []);

  return perf;
}
