"use client";

import { create } from "zustand";

export type ProjectId =
  | "tech-novicord"
  | "bio-docking"
  | "bio-biosensor"
  | "ops-mailchimp"
  | "ops-excel";

type Origin = { x: number; y: number };

type ProjectModalState = {
  activeProject: ProjectId | null;
  origin: Origin;
  openProject: (id: ProjectId, origin: Origin) => void;
  close: () => void;
};

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  activeProject: null,
  origin: { x: 0, y: 0 },
  openProject: (id, origin) => set({ activeProject: id, origin }),
  close: () => set({ activeProject: null }),
}));
