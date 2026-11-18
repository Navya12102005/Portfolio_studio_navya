/**
 * Saves a lead as a row in the Supabase "leads" table (see supabase/leads.sql) through Supabase's REST API.
 * Server-only: it uses the service-role key, which must never reach the browser (no NEXT_PUBLIC_ prefix).
 * Needs NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 */
export type LeadStoreResult = { ok: true } | { ok: false; reason: "not_configured" | "timeout" | "error"; detail?: string };

export async function saveLead(lead: { name: string; email: string; interest: string; message: string }): Promise<LeadStoreResult> {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: "not_configured" };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      signal: ctl.signal,
      body: JSON.stringify({ name: lead.name || null, email: lead.email, interest: lead.interest, message: lead.message, consent: true, source: "website" }),
    });
    if (!res.ok) return { ok: false, reason: "error", detail: `supabase ${res.status}` }; // status only: never log the visitor's details
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return { ok: false, reason: "timeout" };
    return { ok: false, reason: "error", detail: "network" };
  } finally {
    clearTimeout(timer);
  }
}
