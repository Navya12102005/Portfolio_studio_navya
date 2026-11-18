import { NextResponse } from "next/server";
import { scopeAndLogLead } from "@/lib/n8n";
import { sendLeadEmail } from "@/lib/leadMail";
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

/** Visitor inquiries. Validated, origin-checked, rate-limited, then emailed to the owner via Resend (RESEND_API_KEY), falling back to the n8n lead workflow (N8N_LEAD_WEBHOOK_URL).
 *  Nothing is logged or stored here: this is personal data. If neither delivery route is set up we say so honestly (503). */
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

  const lead = { name: input.name.trim(), email: input.email.trim(), interest, message: input.message.trim() };
  // Email via Resend is the main route; the n8n lead workflow is used if Resend is not set up.
  const mail = await sendLeadEmail(lead);
  if (mail.ok) return NextResponse.json({ ok: true });
  if (mail.reason === "not_configured") {
    const n8n = await scopeAndLogLead({ clientName: lead.name || "Website visitor", email: lead.email, domain: interest === "Not sure" ? "Unspecified" : interest, projectSummary: lead.message });
    if (n8n.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: n8n.reason === "not_configured" ? "not_configured" : "delivery_failed" }, { status: n8n.reason === "not_configured" ? 503 : 502 });
  }
  return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
}
