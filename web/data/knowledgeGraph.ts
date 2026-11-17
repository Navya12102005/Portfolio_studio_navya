export type GraphCluster = "tech" | "bio" | "ops";

export type GraphNode = {
  id: string;
  label: string;
  cluster: GraphCluster;
  position: [number, number, number];
  methodology: string;
  techStack: string[];
  outcomes: string[];
};

export type GraphEdge = [string, string];

export const CLUSTER_COLOR: Record<GraphCluster, string> = {
  tech: "#00F0FF",
  bio: "#FF5E00",
  ops: "#00FF88",
};

export const NODES: GraphNode[] = [
  // Tech & AI — cyan
  {
    id: "agentic-workflows",
    label: "Agentic Workflows",
    cluster: "tech",
    position: [-2.6, 1.4, 0],
    methodology: "Multi-step LLM tool-calling loops (Gemini function-calling) orchestrating external actions instead of single-shot prompts.",
    techStack: ["Gemini API", "ElevenLabs", "Next.js API routes", "n8n webhooks", "Claude Code", "Google BigQuery"],
    outcomes: [
      "Built the J.A.R.V.I.S. assistant's own tool-calling loop for this site",
      "Developed the J.A.R.V.I.S. voice agent with cloned vocal synthesis (ElevenLabs + Gemini)",
      "Google Gen AI APAC Academy cohort graduate",
      "AI health-app prototyping using Google Antigravity",
    ],
  },
  {
    id: "aws-cloud",
    label: "AWS Cloud",
    cluster: "tech",
    position: [-3.4, 0.2, 1.2],
    methodology: "Cloud infrastructure fundamentals — compute, storage, and deployment pipelines.",
    techStack: ["AWS"],
    outcomes: ["Coursework + self-directed deployment experiments"],
  },
  {
    id: "novicord",
    label: "NoviCord",
    cluster: "tech",
    position: [-1.6, -0.6, 0.6],
    methodology: "Full-stack health-platform build: patient-facing UI backed by a structured data layer.",
    techStack: ["React", "Node.js"],
    outcomes: ["Shipped a working prototype health platform"],
  },
  {
    id: "studio-navya",
    label: "Studio Navya",
    cluster: "tech",
    position: [-4.2, -0.9, -0.2],
    methodology: "Creative direction and personal brand: a design studio crafting brand identity, marketing copy and immersive 3D digital experiences.",
    techStack: ["Next.js", "Tailwind CSS", "GSAP", "React Three Fiber", "Figma"],
    outcomes: ["Creator of the Studio Navya brand and this immersive web portfolio", "Minimalist dark-mode aesthetics, custom gradients and glassmorphism"],
  },
  {
    id: "fullstack-3d",
    label: "Full-Stack 3D",
    cluster: "tech",
    position: [-2.9, -1.6, -0.8],
    methodology: "Real-time 3D web experiences — WebGL scene graphs, shader-driven backgrounds, GSAP-synced camera work.",
    techStack: ["React Three Fiber", "Three.js", "GLSL", "GSAP"],
    outcomes: ["This portfolio itself"],
  },

  // Bioengineering — amber
  {
    id: "liquid-crystal-biosensors",
    label: "Liquid Crystal Biosensors",
    cluster: "bio",
    position: [2.6, 1.3, -0.4],
    methodology: "Optical biosensing via liquid-crystal phase transitions triggered by target-molecule binding.",
    techStack: ["Liquid crystal optics", "Biomedical instrumentation"],
    outcomes: ["Case study: label-free detection approach"],
  },
  {
    id: "molecular-docking",
    label: "Molecular Docking — P. aeruginosa (PDB:5O7)",
    cluster: "bio",
    position: [3.4, 0.1, 0.8],
    methodology: "In-silico docking against the PDB:5O7 structure to screen candidate inhibitors of Pseudomonas aeruginosa virulence factors.",
    techStack: ["PyMOL", "AutoDock", "PDB:5O7"],
    outcomes: ["Identified binding-affinity candidates for further study"],
  },
  {
    id: "biomedical-optics",
    label: "Biomedical Optics",
    cluster: "bio",
    position: [2.1, -0.9, 1.1],
    methodology: "Light-matter interaction principles applied to diagnostic and sensing instrumentation.",
    techStack: ["Optical spectroscopy"],
    outcomes: ["Coursework foundation underpinning the biosensor work"],
  },
  {
    id: "lncrna-research",
    label: "lncRNA Research",
    cluster: "bio",
    position: [3.0, -1.7, -0.6],
    methodology: "Investigating long non-coding RNA regulatory roles via literature synthesis and sequence analysis.",
    techStack: ["Bioinformatics literature review"],
    outcomes: ["Ongoing research interest"],
  },

  // Operations & Marketing — emerald
  {
    id: "financial-dashboards",
    label: "Excel Financial/Ops Dashboards",
    cluster: "ops",
    position: [0.2, -2.8, 1.4],
    methodology: "KPI dashboard design — structured data models feeding pivot-driven, auto-refreshing views.",
    techStack: ["Excel", "Power Query"],
    outcomes: ["Built recurring KPI dashboards for ops reporting"],
  },
  {
    id: "mailchimp-campaigns",
    label: "Mailchimp Campaigns",
    cluster: "ops",
    position: [-0.6, -3.4, 0.2],
    methodology: "Segmented, automated email-campaign funnels with performance tracking.",
    techStack: ["Mailchimp", "A/B testing"],
    outcomes: ["Ran automated campaign sequences with measurable open/click data"],
  },
  {
    id: "startup-club",
    label: "Startup Club Leadership",
    cluster: "ops",
    position: [0.9, -3.6, -0.9],
    methodology: "Organizing and leading a student startup club — event ops, member growth, partner outreach.",
    techStack: ["Community ops"],
    outcomes: [
      "President of the Startup Club at VIT Bhopal (2026–2027 tenure)",
      "Spearheading the CODEVERSE 2.0 overnight hackathon (₹30K prize pool)",
      "Mentoring core teams across design, technical and sponsorship verticals; 15+ hackathons and meetups led",
    ],
  },
  {
    id: "executive-assistant",
    label: "Executive Assistant Workflows",
    cluster: "ops",
    position: [0.0, -4.4, 0.6],
    methodology: "Calendar/inbox/task-pipeline systems that keep a founder's operational load light.",
    techStack: ["Workflow automation"],
    outcomes: ["Ran EA-style ops support workflows"],
  },

  // Added from Navya's CV and confirmed details
  {
    id: "oculomics-dl",
    label: "Oculomics Deep Learning (IEEE)",
    cluster: "tech",
    position: [-0.9, 2.4, 0.8],
    methodology: "Deep-learning framework for cardiovascular disease prediction from retinal OCTA imaging and clinical biomarkers, with a quantum machine-learning component.",
    techStack: ["Deep learning", "Retinal OCTA imaging", "Quantum ML"],
    outcomes: ["IEEE Silchar Subsection Student Summer Internship Program (IS3IP-2026)"],
  },
  {
    id: "breakhis-dl",
    label: "BreakHis Histopathology DL",
    cluster: "tech",
    position: [-4.2, 1.2, -1.0],
    methodology: "Comparing ResNet50, MobileNetV3-Small and a custom CNN for benign vs malignant breast histopathology classification, with patient-level data separation and attention to sensitivity, specificity and model efficiency.",
    techStack: ["Python", "CNNs", "Transfer learning"],
    outcomes: ["Ongoing project"],
  },
  {
    id: "hackathons",
    label: "Hackathons & Ideathons",
    cluster: "tech",
    position: [-4.3, -0.9, 0.5],
    methodology: "Rapid prototyping and pitching in competitive health-tech and AI events.",
    techStack: ["Prototyping", "Pitching"],
    outcomes: ["AMD Slingshot", "PromptWars 2026", "Health Hacks"],
  },
  // Bioengineering additions
  {
    id: "iron-nanoparticle-docking",
    label: "Iron Nanoparticle Project: Docking",
    cluster: "bio",
    position: [4.2, 1.0, -0.8],
    methodology: "Molecular docking of phytochemicals from Tridax, Nerium and Cascabela against microbial target proteins, for plant-based iron nanoparticle formulations with antimicrobial applications.",
    techStack: ["AutoDock", "PyMOL", "RCSB Protein Data Bank"],
    outcomes: ["Research team member, Jan to Apr 2026: protein preparation, docking, binding-affinity analysis and visualization"],
  },
  {
    id: "hpv18-docking",
    label: "HPV-18 E1 Docking",
    cluster: "bio",
    position: [4.5, -0.8, 0.3],
    methodology: "Blind docking of two phytochemicals against the HPV-18 E1 DNA-binding domain, then mapping protein-ligand contacts within 5 angstroms.",
    techStack: ["AutoDock Vina", "PyMOL"],
    outcomes: ["Docking scores of -7.2 and -7.3 kcal/mol", "ARG349 identified as a shared contact residue"],
  },
  {
    id: "phyloseek",
    label: "Phyloseek",
    cluster: "bio",
    position: [1.7, 1.9, 0.4],
    methodology: "Educational bioinformatics application: sequence retrieval, alignment and similarity search, with Needleman-Wunsch and Smith-Waterman implemented to explain how sequence comparison works.",
    techStack: ["Python", "Sequence alignment"],
    outcomes: ["Ongoing; phylogenetic analysis and more features planned"],
  },
  // Operations & leadership additions
  {
    id: "aws-student-group",
    label: "AWS Student Builder Group",
    cluster: "ops",
    position: [-1.8, -3.3, -0.4],
    methodology: "Operational leadership of a student cloud-builder community.",
    techStack: ["AWS", "Linux", "Docker", "Serverless architecture"],
    outcomes: [
      "Operational Lead",
      "Coordinating cloud bootcamps and serverless architecture labs; bridging training with real student deployments",
    ],
  },
  {
    id: "community-leadership",
    label: "Community Leadership",
    cluster: "ops",
    position: [1.9, -3.0, 0.6],
    methodology: "Representing and leading design and tech communities beyond the home campus.",
    techStack: ["Design leadership", "Ambassador programs"],
    outcomes: ["Techfest IIT Bombay Ambassador", "Metaversity Design Team Lead"],
  },
];

// Cross-cluster edges are the interesting ones — they're what make this a
// "second brain" instead of three separate lists. Most edges stay within
// a cluster (local structure); a handful deliberately cross clusters.
export const EDGES: GraphEdge[] = [
  // tech internal
  ["agentic-workflows", "fullstack-3d"],
  ["agentic-workflows", "aws-cloud"],
  ["novicord", "fullstack-3d"],
  ["studio-navya", "fullstack-3d"],
  ["studio-navya", "agentic-workflows"],
  ["novicord", "aws-cloud"],

  // bio internal
  ["liquid-crystal-biosensors", "biomedical-optics"],
  ["molecular-docking", "lncrna-research"],
  ["biomedical-optics", "molecular-docking"],

  // ops internal
  ["financial-dashboards", "mailchimp-campaigns"],
  ["startup-club", "executive-assistant"],
  ["mailchimp-campaigns", "startup-club"],

  // cross-cluster — AI <-> Bioengineering (deep-learning predictions on
  // molecular/sensor data) and Tech <-> Ops (automation underlying both)
  ["agentic-workflows", "molecular-docking"],
  ["agentic-workflows", "liquid-crystal-biosensors"],
  ["fullstack-3d", "financial-dashboards"],
  ["novicord", "executive-assistant"],

  // from the CV
  ["oculomics-dl", "breakhis-dl"],
  ["oculomics-dl", "biomedical-optics"],
  ["iron-nanoparticle-docking", "molecular-docking"],
  ["iron-nanoparticle-docking", "hpv18-docking"],
  ["phyloseek", "lncrna-research"],
  ["aws-student-group", "aws-cloud"],
  ["aws-student-group", "startup-club"],
  ["community-leadership", "startup-club"],
];
