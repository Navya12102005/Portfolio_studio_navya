/**
 * Emails a lead to the site owner through Resend (https://resend.com), using a plain fetch: no extra package.
 * Needs RESEND_API_KEY (a secret: set it in Vercel, never in code). Optional: LEAD_TO_EMAIL (comma-separated
 * recipients) and LEAD_FROM_EMAIL. Until a domain is verified in Resend, its free sender
 * (onboarding@resend.dev) can only deliver to the email address of the Resend account itself.
 */
export type LeadMailResult = { ok: true } | { ok: false; reason: "not_configured" | "timeout" | "error"; detail?: string };

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendLeadEmail(lead: { name: string; email: string; interest: string; message: string }): Promise<LeadMailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "not_configured" };
  const to = (process.env.LEAD_TO_EMAIL || process.env.CONTACT_EMAIL || "hello.studionavya@gmail.com").split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.LEAD_FROM_EMAIL || "Studio Navya <onboarding@resend.dev>";

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: ctl.signal,
      body: JSON.stringify({
        from, to,
        reply_to: lead.email,
        subject: `New inquiry (${oneLine(lead.interest)}) from ${oneLine(lead.name) || "a visitor"}`,
        text: `Name: ${oneLine(lead.name) || "(not given)"}\nEmail: ${lead.email}\nInterested in: ${oneLine(lead.interest)}\n\n${lead.message}\n\nSent from the Studio Navya contact form.`,
      }),
    });
    if (!res.ok) return { ok: false, reason: "error", detail: `resend ${res.status}` };
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return { ok: false, reason: "timeout" };
    return { ok: false, reason: "error", detail: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}
