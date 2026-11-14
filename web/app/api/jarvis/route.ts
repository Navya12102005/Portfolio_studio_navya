import { NextResponse } from "next/server";
import { runJarvisTurn, isGeminiConfigured, GeminiError } from "@/lib/gemini";

/**
 * J.A.R.V.I.S. backend.
 *
 * Primary path: real Gemini function-calling (lib/gemini.ts) with tools
 * wired to n8n (lib/n8n.ts) — scopeAndLogLead / checkAvailabilityAndBook /
 * dispatchServiceDossier. Used automatically once GEMINI_API_KEY is set.
 *
 * Fallback path: the local keyword router below. Used whenever Gemini
 * isn't configured, or the Gemini call fails for any reason (network,
 * bad response, timeout) — so a visitor never sees a raw error, and a
 * missing n8n webhook URL inside a tool call surfaces as an honest
 * "that part isn't connected yet" rather than a fabricated success, at
 * both layers (n8n.ts returns ok:false rather than throwing; Gemini then
 * reports that back truthfully per its system instruction).
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

  if (isGeminiConfigured()) {
    try {
      const response = await runJarvisTurn(prompt);
      return NextResponse.json({ response, engine: "gemini" });
    } catch (e) {
      // fall through to the local router below; log server-side for debugging
      console.error("Gemini turn failed, falling back to local router:", e instanceof GeminiError ? e.message : e);
    }
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

  return NextResponse.json({ response, engine: "local" });
}
