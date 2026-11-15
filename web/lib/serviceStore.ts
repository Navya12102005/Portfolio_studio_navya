"use client";

import { create } from "zustand";

type ServiceState = {
  openSlug: string | null;
  /** service the contact form should be pre-filled with (set by "START THIS PROJECT") */
  contactPrefill: string | null;
  open: (slug: string) => void;
  close: () => void;
  startProject: (code: string) => void;
};

export const useServiceStore = create<ServiceState>((set) => ({
  openSlug: null,
  contactPrefill: null,
  open: (slug) => set({ openSlug: slug }),
  close: () => set({ openSlug: null }),
  startProject: (code) => set({ contactPrefill: code, openSlug: null }),
}));
