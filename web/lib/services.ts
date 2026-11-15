import raw from "@/data/services.json";

export type Pillar = "tech" | "bio" | "ops";
export type Motif = "neural" | "helix" | "bars" | "wave" | "cube";

export type Service = {
  code: string;
  slug: string;
  pillar: Pillar;
  complete: boolean;
  title: string;
  tagline: string;
  status: string;
  motif: Motif;
  problem?: string;
  steps?: { name: string; text: string }[];
  deliverables?: string[];
  stack?: string[];
  timeline?: { duration: string; revisions: string; style: string };
  price?: { model: string; label: string; from: number | null; note: string; placeholder?: boolean };
  proof?: { title: string; result: string; placeholder?: boolean }[];
  faq?: { q: string; a: string }[];
};

export const PILLARS = raw.pillars as Record<Pillar, { label: string; tagline: string; accent: string }>;
export const SERVICES = raw.services as Service[];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const servicesFor = (p: Pillar) => SERVICES.filter((s) => s.pillar === p);
/** true for any text still waiting on Navya, so the UI can flag it instead of presenting it as fact */
export const isPlaceholder = (text: string) => /\[[^\]]+\]/.test(text);
