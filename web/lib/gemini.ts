/**
 * Gemini function-calling client for J.A.R.V.I.S., talking to the plain
 * REST API directly (no SDK dependency — avoids pulling in an unverified
 * package version for a single endpoint). Declares the 3 real-world
 * tools from the spec, executes them against n8n when the model calls
 * one, and returns the model's final natural-language reply.
 *
 * Every failure mode (no credential, network error, bad response shape,
 * n8n timeout inside a tool call) is caught and surfaced as a thrown
 * GeminiError — app/api/jarvis/route.ts catches that and falls back to
 * the local keyword router, so a visitor never sees a raw error.
 *
 * Auth: the API key is a network-level credential injected by this
 * environment's outbound proxy into the `Authorization: Bearer` header on
 * requests to generativelanguage.googleapis.com — this code never reads
 * or holds the key itself. It sends a placeholder header value; the
 * proxy overwrites it with the real key in flight. (Gemini's REST API
 * accepts the key via `Authorization: Bearer` as well as `x-goog-api-key`
 * or `?key=`; Bearer is used here because it's the only one of the three
 * this sandbox's credential-injection system supports.) Set
 * GEMINI_DISABLE=1 to force the local router even when a credential may
 * be present.
 */
import { scopeAndLogLead, checkAvailabilityAndBook, dispatchServiceDossier } from "./n8n";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = 12000;
const MAX_TOOL_ROUNDS = 4;

export class GeminiError extends Error {}

export function isGeminiConfigured(): boolean {
  return process.env.GEMINI_DISABLE !== "1";
}

const SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S., the AI assistant running Studio Navya — Navya Gupta's portfolio.
Navya is a Bioengineering student at VIT Bhopal, Startup Club President, Operational Lead at the AWS Student Builder Group,
and a full-stack/AI developer across three domains:
- Tech & AI Systems: agentic AI workflows, conversational bots, full-stack 3D web, AWS deployment, deep learning (NoviCord, oculomics DL).
- Bioengineering & Computational R&D: liquid crystal biosensors, molecular docking (PDB: 5O7, Pseudomonas aeruginosa), biomedical optics, epigenetic/lncRNA wound-healing research.
- Operations, Marketing & Executive Support: Mailchimp email automation, Excel KPI/financial dashboards, executive assistant workflows, event/community growth.
Speak concisely, precisely, a little dry-witted — like a butler who is extremely good at his job. Use the provided tools when a visitor
actually wants to leave their details, book time, or get a dossier emailed. Never claim an action succeeded unless the tool result says so;
if a tool reports it failed or isn't configured, say that plainly and point them to hello.studionavya@gmail.com instead.`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "scopeAndLogLead",
        description: "Captures a visitor's project brief and logs it as a lead row in the CRM (Google Sheets, via n8n). Use when someone wants to hire Navya or scope a project.",
        parameters: {
          type: "object",
          properties: {
            clientName: { type: "string", description: "The visitor's name" },
            email: { type: "string", description: "The visitor's email address" },
            domain: { type: "string", enum: ["Tech", "Bio", "Ops"], description: "Which of Navya's 3 domains this project is for" },
            projectSummary: { type: "string", description: "One or two sentences describing what they need" },
            timeline: { type: "string", description: "Rough timeline, if given" },
          },
          required: ["clientName", "email", "domain", "projectSummary"],
        },
      },
      {
        name: "checkAvailabilityAndBook",
        description: "Checks Navya's Google Calendar for an open slot and creates a confirmed invite with a Meet link, via n8n. Use when someone wants to book a call/meeting.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Requested date, e.g. '2026-01-15' or 'next Tuesday'" },
            timeSlot: { type: "string", description: "Requested time, e.g. '3pm IST'" },
            attendeeEmail: { type: "string", description: "The visitor's email, for the invite" },
            topic: { type: "string", description: "What the call is about" },
          },
          required: ["attendeeEmail", "topic"],
        },
      },
      {
        name: "dispatchServiceDossier",
        description: "Sends a tailored service dossier/proposal to the visitor's email from hello.studionavya@gmail.com, via n8n (Gmail/Resend). Use when someone asks for a resume, dossier, or proposal.",
        parameters: {
          type: "object",
          properties: {
            recipientEmail: { type: "string", description: "Where to send the dossier" },
            domainRequested: { type: "string", enum: ["Tech", "Bio", "Ops"], description: "Which domain's dossier to send" },
          },
          required: ["recipientEmail", "domainRequested"],
        },
      },
    ],
  },
];

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "scopeAndLogLead":
      return scopeAndLogLead(args as Parameters<typeof scopeAndLogLead>[0]);
    case "checkAvailabilityAndBook":
      return checkAvailabilityAndBook(args as Parameters<typeof checkAvailabilityAndBook>[0]);
    case "dispatchServiceDossier":
      return dispatchServiceDossier(args as Parameters<typeof dispatchServiceDossier>[0]);
    default:
      return { ok: false, reason: "unknown_tool" };
  }
}

type GPart = { text?: string; functionCall?: { name: string; args: Record<string, unknown> }; functionResponse?: { name: string; response: unknown } };
type GContent = { role: "user" | "model" | "function"; parts: GPart[] };

async function callGemini(contents: GContent[]): Promise<{ parts: GPart[] }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Placeholder — this environment's outbound proxy overwrites this
        // header with the real credential for this host. Never put a real
        // key here.
        Authorization: "Bearer proxy-injected",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        tools: TOOLS,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new GeminiError(`Gemini API responded ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    const parts: GPart[] | undefined = json?.candidates?.[0]?.content?.parts;
    if (!parts) throw new GeminiError("Gemini API returned no content parts");
    return { parts };
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    if (e instanceof Error && e.name === "AbortError") throw new GeminiError("Gemini API request timed out");
    throw new GeminiError(e instanceof Error ? e.message : "Gemini API request failed");
  } finally {
    clearTimeout(timer);
  }
}

/** Runs one full J.A.R.V.I.S. turn: sends the prompt, executes any tool
 * call(s) the model requests (against n8n), and returns the final reply
 * text. Throws GeminiError on any failure — callers should catch and
 * fall back to the local router. */
export async function runJarvisTurn(prompt: string): Promise<string> {
  if (!isGeminiConfigured()) throw new GeminiError("Gemini disabled via GEMINI_DISABLE");

  const contents: GContent[] = [{ role: "user", parts: [{ text: prompt }] }];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const { parts } = await callGemini(contents);
    const call = parts.find((p) => p.functionCall)?.functionCall;

    if (!call) {
      const text = parts.map((p) => p.text).filter(Boolean).join(" ").trim();
      if (!text) throw new GeminiError("Gemini returned an empty reply");
      return text;
    }

    contents.push({ role: "model", parts: [{ functionCall: call }] });
    const result = await executeTool(call.name, call.args || {});
    contents.push({ role: "function", parts: [{ functionResponse: { name: call.name, response: result as object } }] });
  }

  throw new GeminiError("Exceeded max tool-call rounds without a final reply");
}
