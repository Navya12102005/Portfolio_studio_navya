/**
 * n8n webhook callers for J.A.R.V.I.S.'s real-world actions. Each reads its
 * webhook URL from an environment variable and returns a typed result —
 * { ok: false, reason } rather than throwing, and with a hard timeout, so
 * the caller (the Gemini function-calling loop) always gets something to
 * turn into a function response, even if n8n is slow/down/unconfigured.
 */

type WebhookResult<T> = { ok: true; data: T } | { ok: false; reason: "not_configured" | "timeout" | "error"; detail?: string };

const TIMEOUT_MS = 8000;

async function callWebhook<T>(envVar: string, payload: unknown): Promise<WebhookResult<T>> {
  const url = process.env[envVar];
  if (!url) return { ok: false, reason: "not_configured" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, reason: "error", detail: `n8n responded ${res.status}` };
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: true, data };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return { ok: false, reason: "timeout" };
    return { ok: false, reason: "error", detail: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

export function scopeAndLogLead(payload: {
  clientName: string;
  email: string;
  domain: "Tech" | "Bio" | "Ops";
  projectSummary: string;
  timeline?: string;
}) {
  return callWebhook<{ rowId?: string }>("N8N_LEAD_WEBHOOK_URL", payload);
}

export function checkAvailabilityAndBook(payload: { date: string; timeSlot: string; attendeeEmail: string; topic: string }) {
  return callWebhook<{ confirmed?: boolean; meetLink?: string; eventTime?: string }>("N8N_CALENDAR_WEBHOOK_URL", payload);
}

export function dispatchServiceDossier(payload: { recipientEmail: string; domainRequested: "Tech" | "Bio" | "Ops" }) {
  return callWebhook<{ sent?: boolean }>("N8N_DOSSIER_WEBHOOK_URL", payload);
}
