import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES, getService } from "@/lib/services";
import ServiceContent from "@/components/services/ServiceContent";

export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getService((await params).slug);
  return s ? { title: `${s.title} — Navya Gupta`, description: s.tagline } : {};
}

/** Static, crawlable version of a service dossier (the in-scene overlay uses the same content). */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  if (!s) notFound();
  return (
    <main className="min-h-screen bg-[#05090B] text-[#e6edfb] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="sn-hud-text text-[11px] uppercase tracking-[0.12em] text-[var(--sn-cyan)]/80 hover:text-white">← BACK TO CORE</Link>
        <div className="mt-8"><ServiceContent service={s} /></div>
      </div>
    </main>
  );
}
