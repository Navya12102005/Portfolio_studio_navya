"use client";

import { create } from "zustand";

export type CameraDomain = "tech" | "bio" | "ops" | "home";

// Real framing for the only two 3D centerpieces actually built so far
// (BioEngineeringScene at group position [2,0,0], OperationsArenaScene at
// [0,-2,0] with radius 2.5). "tech" has no dedicated centerpiece yet — it
// resolves to the default boot framing (the cursor-reactive schematic
// layer / dust field), which genuinely is the only "tech" visual that
// exists right now. Update this table if/when a Scene 1 tech centerpiece
// is built.
export const CAMERA_TARGETS: Record<CameraDomain, { position: [number, number, number]; lookAt: [number, number, number] }> = {
  home: { position: [0, 1.4, 9], lookAt: [0, 0, 0] },
  tech: { position: [0, 1.4, 9], lookAt: [0, 0, 0] },
  bio: { position: [2, 1.2, 4], lookAt: [2, 0, 0] },
  ops: { position: [0, -0.5, 6], lookAt: [0, -2, 0] },
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
