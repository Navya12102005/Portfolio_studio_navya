"use client";

import { useState } from "react";
import { INTERESTS, validateLead, type Interest, type LeadErrors } from "@/lib/leadValidation";
import { soundFX } from "@/utils/soundManager";

const EMAIL = "hello.studionavya@gmail.com";
type Status = "idle" | "sending" | "sent" | "unavailable" | "error";

/** Contact / lead form. Validates in the browser first, then POSTs to /api/leads (which re-validates). */
export default function LeadCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest>("Not sure");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    const found = validateLead({ name, email, interest, message, consent });
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, interest, message, consent, website }) });
      if (res.ok) { soundFX.playClickLock(); setStatus("sent"); setName(""); setEmail(""); setMessage(""); setConsent(false); return; }
      if (res.status === 400) { const d = await res.json().catch(() => null); if (d?.fields) setErrors(d.fields); setStatus("idle"); return; }
      setStatus(res.status === 503 ? "unavailable" : "error");
    } catch {
      setStatus("error");
    }
  };

  const field = "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#F2F2EE] placeholder-white/30 outline-none transition-colors focus:border-[#FF5A14]/70";
  const err = (k: keyof LeadErrors) => errors[k] && <p role="alert" className="mt-1.5 font-mono text-[11px] text-[#FF8A55]">{errors[k]}</p>;

  return (
    <section id="contact" className="relative scroll-mt-12 overflow-hidden bg-[#05060f] px-5 py-20 md:px-[8vw] md:py-28">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF5A14]">● Contact</p>
        <h2 className="font-anton mt-2 text-4xl leading-tight text-[#F2F2EE] md:text-5xl">Let&apos;s build something together</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">Tell me what you&apos;re working on. I read every message and reply by email.</p>

        {status === "sent" ? (
          <div role="status" className="mt-8 rounded-2xl border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-5 font-mono text-sm text-[#7FE9F2]">Message received. Navya will reply to the email you gave.</div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="lc-name" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-white/50">Name (optional)</label>
                <input id="lc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} className={field} placeholder="Your name" />
                {err("name")}
              </div>
              <div>
                <label htmlFor="lc-email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-white/50">Email</label>
                <input id="lc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} aria-invalid={!!errors.email} className={field} placeholder="you@example.com" />
                {err("email")}
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-white/50">Interested in</legend>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((o) => (
                  <button key={o} type="button" onClick={() => setInterest(o)} aria-pressed={interest === o}
                    className={`cursor-pointer rounded-full border px-4 py-1.5 font-mono text-xs transition-colors ${interest === o ? "border-[#FF5A14] bg-[#FF5A14]/15 text-[#FF5A14]" : "border-white/15 text-white/60 hover:bg-white/10"}`}>{o}</button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="lc-msg" className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-white/50">What are you building?</label>
              <textarea id="lc-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1500} aria-invalid={!!errors.message} className={`${field} resize-none`} placeholder="A few lines about your project, idea or question" />
              {err("message")}
            </div>

            {/* honeypot: hidden from people, tempting to bots */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/60">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#FF5A14]" />
                <span>I agree to be contacted about this inquiry. I only use what you enter here to reply to you, and I don&apos;t share it.</span>
              </label>
              {err("consent")}
            </div>

            <button type="submit" disabled={status === "sending"}
              className="w-full cursor-pointer rounded-xl bg-[#F2F2EE] px-4 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Send message →"}
            </button>

            {status === "unavailable" && <p role="alert" className="font-mono text-xs text-[#FF8A55]">The form isn&apos;t connected yet. Please email <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> instead.</p>}
            {status === "error" && <p role="alert" className="font-mono text-xs text-[#FF8A55]">That didn&apos;t go through. Try again, or email <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
          </form>
        )}
      </div>
    </section>
  );
}
