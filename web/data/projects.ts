import type { ProjectId } from "@/lib/projectModalStore";

export type ProjectSpec = {
  id: ProjectId;
  domain: "tech" | "bio" | "ops";
  title: string;
  tagline: string;
  metrics: { label: string; value: string }[];
  architecture: string[];
  github?: string;
  live?: string;
};

/**
 * Case-study content for the modal tabs. Metrics are kept structural/
 * qualitative rather than invented outcome numbers — real figures should
 * replace the "—" placeholders once Navya supplies them; nothing here
 * states a specific result that hasn't been confirmed.
 */
export const PROJECTS: Record<ProjectId, ProjectSpec> = {
  "tech-novicord": {
    id: "tech-novicord",
    domain: "tech",
    title: "NoviCord",
    tagline: "Health-tech prototype: conversational triage + oculomics deep learning.",
    metrics: [
      { label: "Status", value: "Prototype" },
      { label: "Model type", value: "Deep learning (oculomics)" },
      { label: "Deployment", value: "AWS" },
    ],
    architecture: [
      "Agentic conversational front-end for patient intake/triage",
      "Deep learning pipeline for oculomics (eye-imaging biomarker) inference",
      "Cloud deployment on AWS",
      "Full-stack 3D web interface",
    ],
    github: undefined,
    live: undefined,
  },
  "bio-docking": {
    id: "bio-docking",
    domain: "bio",
    title: "Molecular Docking — Pseudomonas aeruginosa",
    tagline: "Computational docking study against PDB structure 5O7.",
    metrics: [
      { label: "Target", value: "Pseudomonas aeruginosa" },
      { label: "PDB ID", value: "5O7" },
      { label: "Method", value: "Molecular docking (AutoDock, PyMOL)" },
    ],
    architecture: [
      "Target structure retrieved from the Protein Data Bank (PDB: 5O7)",
      "Ligand preparation and binding-site analysis",
      "Docking simulation and binding-affinity scoring",
      "Results compiled toward a scientific review write-up",
      "Related docking work: phytochemicals from Tridax, Nerium and Cascabela against microbial targets (AutoDock, PyMOL)",
      "HPV-18 E1 blind docking: scores of -7.2 and -7.3 kcal/mol, with ARG349 as a shared contact residue",
    ],
    github: undefined,
    live: undefined,
  },
  "bio-biosensor": {
    id: "bio-biosensor",
    domain: "bio",
    title: "Liquid Crystal Biosensors",
    tagline: "Biomedical optics research into liquid-crystal-based sensing.",
    metrics: [
      { label: "Field", value: "Biomedical optics" },
      { label: "Sensing medium", value: "Liquid crystal" },
      { label: "Related work", value: "Epigenetic / lncRNA wound-healing" },
    ],
    architecture: [
      "Liquid crystal biosensor analysis for biomarker detection",
      "Optical readout characterization",
      "Connected research track: epigenetic/lncRNA wound-healing",
      "Scientific review authorship",
      "Literature review of liquid-crystal biosensors for disease diagnostics, and of optical biosensing for point-of-care testing",
      "Evaluating sensitivity and specificity of biosensor platforms; assisting with manuscript preparation",
    ],
    github: undefined,
    live: undefined,
  },
  "ops-mailchimp": {
    id: "ops-mailchimp",
    domain: "ops",
    title: "Automated Email Campaigns",
    tagline: "High-conversion marketing automation built on Mailchimp.",
    metrics: [
      { label: "Platform", value: "Mailchimp" },
      { label: "Type", value: "Lifecycle + campaign automation" },
      { label: "Scope", value: "Event / community growth ops" },
    ],
    architecture: [
      "Segmented audience flows and triggered sequences",
      "Campaign automation wired to community/event growth operations",
      "Open/click performance tracked per send",
    ],
    github: undefined,
    live: undefined,
  },
  "ops-excel": {
    id: "ops-excel",
    domain: "ops",
    title: "Excel KPI & Financial Dashboards",
    tagline: "Automated KPI/financial modeling for operations & leadership reporting.",
    metrics: [
      { label: "Tooling", value: "Excel (formulas + automation)" },
      { label: "Output", value: "KPI / financial dashboards" },
      { label: "Consumers", value: "Leadership & stakeholder reporting" },
    ],
    architecture: [
      "Automated KPI roll-ups from raw operational data",
      "Financial modeling views for leadership reporting",
      "Executive-assistant workflow integration (calendar/inbox triage)",
    ],
    github: undefined,
    live: undefined,
  },
};

export const PROJECT_ORDER: ProjectId[] = [
  "tech-novicord",
  "bio-docking",
  "bio-biosensor",
  "ops-mailchimp",
  "ops-excel",
];
