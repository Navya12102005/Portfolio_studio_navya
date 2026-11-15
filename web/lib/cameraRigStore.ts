"use client";

import { create } from "zustand";

export type CameraDomain = "tech" | "bio" | "ops" | "home";

// Real framing for each 3D centerpiece, spaced far apart in X/Y/Z so each
// floats alone instead of reading as one cluttered cluster: TechScene at
// group position [-9,0.5,-6], BioEngineeringScene at [8,0.5,-8],
// OperationsArenaScene at [0,-3,-13] (radius 2.5 arena).
export const CAMERA_TARGETS: Record<CameraDomain, { position: [number, number, number]; lookAt: [number, number, number] }> = {
  home: { position: [0, 1.4, 9], lookAt: [0, 0, -6] },
  tech: { position: [-6.5, 1.2, -1.5], lookAt: [-9, 0.5, -6] },
  bio: { position: [4.5, 0.5, 1], lookAt: [8, 0.5, -8] },
  ops: { position: [0, -1.5, -7], lookAt: [0, -3, -13] },
};

type CameraRigState = {
  domain: CameraDomain;
  /** bumped on every focus() call so the rig can react even to a repeat of the same domain */
  requestId: number;
  focus: (domain: CameraDomain) => void;
};

export const useCameraRigStore = create<CameraRigState>((set) => ({
  domain: "home",
  requestId: 0,
  focus: (domain) => set((s) => ({ domain, requestId: s.requestId + 1 })),
}));
