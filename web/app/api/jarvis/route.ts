import { NextResponse } from "next/server";

/**
 * J.A.R.V.I.S. backend — local, keyword-based intent router.
 *
 * This is deliberately NOT wired to a real LLM (Gemini) or to any real
 * backend action (Gmail, Google Calendar, CRM/Sheets) yet. Per the agreed
 * scope: build the agent UI + routing now, wire real sending later once
 * actual credentials/webhook URLs are provided. Every "action" intent below
 * says plainly that it's not live yet instead of pretending to have sent
 * something — never fabricate a successful send/booking.
 */

type Domain = "tech" | "bio" | "ops" | null;

const DOMAIN_KEYWORDS: Record<Exclude<Domain, null>, string[]> = {
  tech: ["tech", "ai", "novicord", "oculomics", "deep learning", "aws", "cloud", "agent", "full-stack", "fullstack", "web"],
  bio: ["bio", "bioengineer", "biosensor", "liquid crystal", "docking", "pdb", "pseudomonas", "lncrna", "wound", "epigenetic", "optics", "review"],
  ops: ["ops", "operation", "marketing", "mailchimp", "email campaign", "excel", "kpi", "executive", "calendar", "inbox", "event", "community", "growth"],
};

const ACTION_KEYWORDS = {
  book: ["book", "schedule", "calendar", "meeting", "call", "availability"],
  email: ["email", "send", "dossier", "proposal", "deck", "resume", "cv"],
  lead: ["hire", "quote", "project", "client", "scope", "budget", "cost", "price"],
  audit: ["csv", "data audit", "upload data", "analyze data", "spreadsheet audit"],
};

function detectDomain(text: string): Domain {
  const t = text.toLowerCase();
  for (const [domain, words] of Object.entries(DOMAIN_KEYWORDS) as [Exclude<Domain, null>, string[]][]) {
    if (words.some((w) => t.includes(w))) return domain;
  }
  return null;
}

function detectAction(text: string): keyof typeof ACTION_KEYWORDS | null {
  const t = text.toLowerCase();
  for (const [action, words] of Object.entries(ACTION_KEYWORDS) as [keyof typeof ACTION_KEYWORDS, string[]][]) {
    if (words.some((w) => t.includes(w))) return action;
  }
  return null;
}

const DOMAIN_BRIEF: Record<Exclude<Domain, null>, string> = {
  tech: "Tech & AI Systems: agentic AI workflows, conversational bots, full-stack 3D web architecture, cloud deployment on AWS, and deep learning (oculomics DL, NoviCord — a health-tech prototype). Ask me about a specific project, or say 'hire' to start a scope.",
  bio: "Bioengineering & Computational R&D: liquid crystal biosensor analysis, computational molecular docking against Pseudomonas aeruginosa (PDB: 5O7), biomedical optics, epigenetic/lncRNA wound-healing research, and scientific review authoring. Ask me about a specific project, or say 'hire' to start a scope.",
  ops: "Operations, Marketing & Executive Support: high-conversion email marketing automation (Mailchimp), automated Excel KPI/financial modeling, executive assistant workflows, and large-scale event/community growth operations. Ask me about a specific project, or say 'hire' to start a scope.",
};

const ACTION_STUB: Record<keyof typeof ACTION_KEYWORDS, string> = {
  book: "I'd normally check Navya's Google Calendar and drop a confirmed invite with a Meet link right here — that real integration isn't connected yet (needs Google OAuth credentials). For now, email hello.studionavya@gmail.com directly and she'll reply within 24h.",
  email: "I'd normally send a tailored service dossier straight to your inbox from hello.studionavya@gmail.com — that's not wired to a real mail sender yet (needs a Gmail/Resend API key). Tell me your email and what you need, and I'll log it so Navya can send it manually for now.",
  lead: "Happy to scope this. Tell me: your name, domain (tech / bio / ops), a one-line project summary, and your rough timeline. I'd normally log this straight into a CRM sheet — that part isn't connected to a live backend yet, so I'll just repeat it back clearly so you can forward it, or email hello.studionavya@gmail.com directly.",
  audit: "Live CSV parsing in the HUD isn't wired up yet — that needs a backend endpoint I haven't built. Paste a summary of your data/KPIs here instead and I can talk through what Navya's Excel/ops work would do with it.",
};

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt : "";
  } catch {
    return NextResponse.json({ response: "Malformed request — telemetry packet rejected." }, { status: 400 });
  }

  if (!prompt.trim()) {
    return NextResponse.json({ response: "Say something, and I'll route it." });
  }

  const action = detectAction(prompt);
  const domain = detectDomain(prompt);

  let response: string;
  if (action) {
    response = ACTION_STUB[action];
  } else if (domain) {
    response = DOMAIN_BRIEF[domain];
  } else if (/^(hi|hey|hello|yo|sup)\b/i.test(prompt.trim())) {
    response =
      "Hello. I'm J.A.R.V.I.S., running Studio Navya. Navya Gupta is a Bioengineering student at VIT Bhopal, Startup Club President, Operational Lead at the AWS Student Builder Group, and a full-stack/AI developer. Which domain are you here for: tech, bio, or ops?";
  } else {
    response =
      "I didn't catch a domain in that — try mentioning tech/AI, bioengineering, or operations/marketing, or just say 'hire' to start a project scope. (Routing here is local keyword-matching right now, not a live LLM — Gemini isn't connected yet.)";
  }

  return NextResponse.json({ response });
}
