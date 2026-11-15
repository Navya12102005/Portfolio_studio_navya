"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PILLARS, isPlaceholder, type Service } from "@/lib/services";
import Motif from "./Motif";

const mono = "sn-hud-text uppercase tracking-[0.12em] text-[11px]";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 md:mt-12" aria-labelledby={`sec-${n}`}>
      <h3 id={`sec-${n}`} className={`${mono} text-[var(--sn-cyan)]/80 flex items-center gap-3`}>
        <span className="opacity-50">{n}</span>
        <span>{title}</span>
        <span className="h-px flex-1 bg-[var(--sn-cyan)]/20" />
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Unfilled [PLACEHOLDER] text is shown as a clearly flagged dashed chip, never as a real claim. */
function Ph({ text }: { text: string }) {
  return isPlaceholder(text) ? (
    <span className="inline-block border border-dashed border-[#F2C14E]/60 text-[#F2C14E]/90 px-2 py-0.5 text-[12px] rounded-sm">{text}</span>
  ) : (
    <>{text}</>
  );
}

/** The service-detail template: used by the in-scene dossier overlay and the static /services/[slug] page. */
export default function ServiceContent({ service, onStart }: { service: Service; onStart?: (code: string) => void }) {
  const accent = PILLARS[service.pillar].accent;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!service.complete) {
    return (
      <div>
        <p className={`${mono}`} style={{ color: accent }}>{service.code} · DOSSIER IN PROGRESS</p>
        <h2 className="sn-title text-3xl mt-2 text-[#e6edfb]">{service.title}</h2>
        <p className="mt-3 text-[#b9c6e8]">{service.tagline}</p>
        <p className="mt-6 text-sm text-[#b9c6e8]/70">The full breakdown for this service isn&apos;t written yet. Ask J.A.R.V.I.S. or get in touch for details.</p>
      </div>
    );
  }

  return (
    <article>
      {/* 1 · header */}
      <header className="grid md:grid-cols-[1fr_220px] gap-6 items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={mono} style={{ color: accent }}>{service.code}</span>
            <span className={`${mono} border px-2 py-0.5`} style={{ borderColor: accent + "66", color: accent }}>● {service.status}</span>
          </div>
          <h2 className="sn-title text-3xl md:text-5xl font-bold text-[#e6edfb] mt-3 leading-tight">{service.title}</h2>
          <p className="text-lg text-[#b9c6e8] mt-3 max-w-xl">{service.tagline}</p>
        </div>
        <div className="hidden md:block h-[200px]" aria-hidden><Motif kind={service.motif} color={accent} /></div>
      </header>

      {/* 2 · problem */}
      <Section n="01" title="The problem"><p className="text-[#c9d3ee] max-w-2xl leading-relaxed">{service.problem}</p></Section>

      {/* 3 · pipeline */}
      <Section n="02" title="How I solve it">
        <ol className="grid gap-3 md:grid-cols-3">
          {service.steps?.map((s, i) => (
            <motion.li
              key={s.name}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative border border-white/10 bg-white/[0.03] p-4"
            >
              <span className={`${mono} opacity-50`} style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span>
              <p className={`${mono} mt-1 text-[#e6edfb]`}>{s.name}</p>
              <p className="text-sm text-[#b9c6e8] mt-2 leading-relaxed">{s.text}</p>
              <motion.span className="absolute left-0 top-0 h-[2px]" style={{ background: accent }} initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.2, duration: 0.6 }} />
            </motion.li>
          ))}
        </ol>
      </Section>

      {/* 4 · deliverables */}
      <Section n="03" title="Deliverables">
        <ul className="grid gap-2 md:grid-cols-2">
          {service.deliverables?.map((d) => (
            <li key={d} className="flex gap-3 text-[#c9d3ee]"><span style={{ color: accent }} aria-hidden>✓</span><span>{d}</span></li>
          ))}
        </ul>
      </Section>

      {/* 5 · stack */}
      <Section n="04" title="Tools & stack">
        <ul className="flex flex-wrap gap-2">
          {service.stack?.map((t) => (<li key={t} className={`${mono} border border-white/15 px-2.5 py-1 text-[#c9d3ee]`}>{t}</li>))}
        </ul>
      </Section>

      {/* 6 · timeline */}
      <Section n="05" title="Timeline & engagement">
        <dl className="grid gap-4 md:grid-cols-3">
          {([["Duration", service.timeline?.duration], ["Revisions", service.timeline?.revisions], ["Working style", service.timeline?.style]] as const).map(([k, v]) => (
            <div key={k} className="border-l border-[var(--sn-cyan)]/30 pl-4"><dt className={`${mono} opacity-60`}>{k}</dt><dd className="mt-1 text-[#e6edfb]"><Ph text={v ?? ""} /></dd></div>
          ))}
        </dl>
      </Section>

      {/* 7 · price */}
      <Section n="06" title="Pricing">
        <div className="inline-flex flex-col border p-4" style={{ borderColor: accent + "55" }}>
          <span className={`${mono}`} style={{ color: accent }}>{service.price?.model.toUpperCase()} MODEL</span>
          <span className="sn-title text-2xl text-[#e6edfb] mt-1">{service.price?.label}</span>
          <span className="text-sm text-[#b9c6e8] mt-2"><Ph text={service.price?.note ?? ""} /></span>
        </div>
      </Section>

      {/* 8 · proof */}
      <Section n="07" title="Proof">
        <div className="grid gap-3 md:grid-cols-2">
          {service.proof?.map((p) => (
            <div key={p.title} className="border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[#e6edfb]"><Ph text={p.title} /></p>
              <p className={`${mono} mt-2`} style={{ color: accent }}><Ph text={p.result} /></p>
            </div>
          ))}
        </div>
      </Section>

      {/* 9 · faq */}
      <Section n="08" title="FAQ">
        <div className="divide-y divide-white/10 border-y border-white/10">
          {service.faq?.map((f, i) => (
            <div key={f.q}>
              <h4>
                <button className="w-full text-left py-3 flex justify-between gap-4 text-[#e6edfb] cursor-pointer" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span><span aria-hidden style={{ color: accent }}>{openFaq === i ? "−" : "+"}</span>
                </button>
              </h4>
              {openFaq === i && <p className="pb-4 text-sm text-[#b9c6e8] leading-relaxed max-w-2xl"><Ph text={f.a} /></p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 10 · CTA */}
      <div className="mt-12">
        <button
          onClick={() => onStart?.(service.code)}
          className={`${mono} px-6 py-3 border cursor-pointer transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sn-cyan)]`}
          style={{ borderColor: accent, color: accent }}
        >
          [ START THIS PROJECT ▸ ]
        </button>
      </div>
    </article>
  );
}
