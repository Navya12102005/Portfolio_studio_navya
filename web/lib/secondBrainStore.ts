"use client";

import { create } from "zustand";
import type { GraphCluster } from "@/data/knowledgeGraph";

type SecondBrainState = {
  open: boolean;
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  focusedCluster: GraphCluster | null;

  openGraph: () => void;
  closeGraph: () => void;
  hoverNode: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  /** Isolates/zooms the graph to a cluster — called by J.A.R.V.I.S. when a
   *  query names a domain ("show me her bioengineering projects"), and by
   *  the boot sequence's quick-action pills. Opens the graph if closed. */
  focusCluster: (cluster: GraphCluster | null) => void;
};

export const useSecondBrainStore = create<SecondBrainState>((set) => ({
  open: false,
  hoveredNodeId: null,
  selectedNodeId: null,
  focusedCluster: null,

  openGraph: () => set({ open: true }),
  closeGraph: () => set({ open: false, selectedNodeId: null }),
  hoverNode: (id) => set({ hoveredNodeId: id }),
  selectNode: (id) => set({ selectedNodeId: id }),
  focusCluster: (cluster) => set({ open: true, focusedCluster: cluster, selectedNodeId: null }),
}));
