import { NextResponse } from "next/server";
import { scopeAndLogLead } from "@/lib/n8n";
import { INTERESTS, validateLead, type Interest } from "@/lib/leadValidation";

// Route files may only export HTTP handlers, so everything else stays module-private.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now(), win = 10 * 60 * 1000, max = 5;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < win);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < win)) hits.delete(k);
  return recent.length > max;
}

/** Visitor inquiries. Validated, origin-checked, rate-limited, then forwarded to the n8n lead workflow (N8N_LEAD_WEBHOOK_URL).
 *  Nothing is logged or stored here: this is personal data. If the webhook is not set up we say so honestly (503). */
export async function POST(req: Request) {
  const origin = req.headers.get("origin"), host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (limited(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown")) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const interest = (INTERESTS as readonly string[]).includes(str(body.interest)) ? (str(body.interest) as Interest) : "Not sure";
  const input = { name: str(body.name), email: str(body.email), interest, message: str(body.message), consent: body.consent === true };
  const errors = validateLead(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });

  const result = await scopeAndLogLead({
    clientName: input.name.trim() || "Website visitor",
    email: input.email.trim(),
    domain: interest === "Not sure" ? "Unspecified" : interest,
    projectSummary: input.message.trim(),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason === "not_configured" ? "not_configured" : "delivery_failed" }, { status: result.reason === "not_configured" ? 503 : 502 });
  }
  return NextResponse.json({ ok: true });
}
