"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Background for the OPS slide: an original 80s "city-pop" street of flat-colour signs, striped discs and rainbow
 * arcs, drawn in neon (cyan / indigo / pink / amber) on near-black. Three layers drift upward at different speeds
 * and shift slightly with the cursor for depth. A dark scrim keeps the text on top readable.
 * Pure CSS + DOM: the layout is generated once from a fixed seed (same on server and client), the pointer writes two
 * CSS variables instead of re-rendering, and everything pauses off-screen and under prefers-reduced-motion.
 */
const WORDS = ["SALE", "NEW", "MAIL", "KPI", "GROWTH", "DEAL", "SEND", "OPEN", "LEADS", "ROI", "CRM", "POST", "LAUNCH", "BRAND", "PLAN", "CLOSE", "REPLY", "GO!"];
const NEON = ["#22d3ee", "#818cf8", "#f472b6", "#fbbf24", "#34d399", "#fb7185"];
const INK = "#030508";
const TILE = 80; // em: height of one repeating tile

type Kind = "sign" | "vsign" | "disc" | "arc" | "bld";
type Item = { kind: Kind; x: number; y: number; w: number; h: number; c: string; c2: string; word: string; rot: number; flick: boolean; v: number };

function rng(seed: number) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function layout(seed: number, cols: number, rows: number, kinds: Kind[], size: [number, number], sizeH: [number, number]): Item[] {
  const r = rng(seed), out: Item[] = [];
  for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
    const kind = kinds[Math.floor(r() * kinds.length)], w = size[0] + r() * (size[1] - size[0]), h = kind === "disc" ? w : sizeH[0] + r() * (sizeH[1] - sizeH[0]);
    out.push({
      kind, w, h, x: ((cx + 0.1 + r() * 0.5) / cols) * 100, y: ((cy + 0.1 + r() * 0.5) / rows) * TILE,
      c: NEON[Math.floor(r() * NEON.length)], c2: NEON[Math.floor(r() * NEON.length)], word: WORDS[Math.floor(r() * WORDS.length)],
      rot: (r() - 0.5) * 12, flick: r() < 0.25, v: Math.floor(r() * 3),
    });
  }
  return out;
}

const FAR = layout(11, 5, 4, ["bld"], [7, 13], [26, 52]);
const MID = layout(23, 3, 5, ["sign", "sign", "vsign", "sign"], [10, 17], [4.2, 6.5]);
const NEAR = layout(37, 2, 3, ["disc", "arc", "disc"], [8, 12], [4, 6]);

function Piece({ it }: { it: Item }) {
  const base: CSSProperties = { position: "absolute", left: `${it.x}%`, top: `${it.y}em`, width: `${it.w}em`, height: `${it.h}em` };
  const cls = it.flick ? "cp-flick" : undefined;
  if (it.kind === "bld")
    return <div style={{ ...base, background: `linear-gradient(180deg, ${it.c}33, ${it.c}14)`, border: `0.25em solid ${it.c}55`, backgroundImage: `repeating-linear-gradient(90deg, ${it.c}40 0 0.5em, transparent 0.5em 1.7em), repeating-linear-gradient(0deg, transparent 0 1.2em, ${INK}99 1.2em 1.5em)` }} />;
  if (it.kind === "sign")
    return <div className={cls} style={{ ...base, transform: `rotate(${it.rot}deg) skewX(-6deg)`, background: `${it.c}`, color: INK, border: `0.3em solid ${INK}`, borderRadius: "0.7em", boxShadow: `0.4em 0.4em 0 ${it.c2}, 0 0 2.2em ${it.c}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="font-anton" style={{ fontSize: `${it.h * 0.62}em`, letterSpacing: "0.04em", lineHeight: 1 }}>{it.word}</span></div>;
  if (it.kind === "vsign")
    return <div className={cls} style={{ ...base, width: `${it.h * 0.9}em`, height: `${it.w * 1.3}em`, background: INK, border: `0.3em solid ${it.c}`, boxShadow: `0 0 2em ${it.c}77`, borderRadius: "0.5em", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", color: it.c }}>
      {it.word.slice(0, 4).split("").map((ch, i) => <span key={i} className="font-anton" style={{ fontSize: `${it.h * 0.6}em`, lineHeight: 1 }}>{ch}</span>)}</div>;
  if (it.kind === "arc")
    return <div className="cp-float" style={{ ...base, width: `${it.w}em`, height: `${it.w / 2}em`, borderRadius: `${it.w}em ${it.w}em 0 0`, background: `radial-gradient(circle at 50% 100%, transparent 0 24%, ${it.c} 24% 40%, ${INK} 40% 44%, ${it.c2} 44% 60%, ${INK} 60% 64%, #f4ebd3 64% 80%, transparent 80%)`, filter: `drop-shadow(0 0 1.2em ${it.c}99)` }} />;
  // disc: starburst, stripes or dots
  const bg = it.v === 0 ? `conic-gradient(from 0deg, ${it.c} 0 10%, ${INK} 10% 20%, ${it.c} 20% 30%, ${INK} 30% 40%, ${it.c} 40% 50%, ${INK} 50% 60%, ${it.c} 60% 70%, ${INK} 70% 80%, ${it.c} 80% 90%, ${INK} 90%)`
    : it.v === 1 ? `repeating-linear-gradient(45deg, ${it.c} 0 0.9em, #f4ebd3 0.9em 1.8em)` : `radial-gradient(circle, ${INK} 0 22%, ${it.c} 22% 62%, ${it.c2} 62%)`;
  return <div className="cp-float" style={{ ...base, animationDelay: `${-it.x / 10}s` }}><div className={it.v === 0 ? "cp-spin" : undefined} style={{ width: "100%", height: "100%", borderRadius: "50%", background: bg, border: `0.3em solid ${INK}`, boxShadow: `0.4em 0.4em 0 ${it.c2}, 0 0 2em ${it.c}77` }} /></div>;
}

const DEPTH = [0.5, 1.2, 2.2]; // how far each layer travels with the camera: far layers barely move, near ones a lot
const ZOOM = [0.35, 0.8, 1.6];  // how much each layer scales during the push-in (real parallax dolly)

function Layer({ items, dur, opacity, idx }: { items: Item[]; dur: number; opacity: number; idx: number }) {
  const tile = <div style={{ position: "relative", height: `${TILE}em` }}>{items.map((it, i) => <Piece key={i} it={it} />)}</div>;
  return (
    <div data-layer={idx} className="absolute inset-0" style={{ opacity, transformOrigin: "50% 40%", willChange: "transform" }}>
      <div className="cp-drift" style={{ ["--d" as string]: `${dur}s`, height: `${TILE * 2}em` }}>{tile}{tile}</div>
    </div>
  );
}

/**
 * The "camera": one smoothed (x, y, zoom) shared by all layers. The cursor pans it (strongly), and on top of that it
 * runs its own slow shot: a gentle wander plus a push-in / pull-out every ~20s, like the dolly moves in the reference.
 * Each frame writes transforms straight to the DOM, so pointer moves never re-render React.
 */
export default function OpsCityPop({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-layer]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false, raf = 0, last = performance.now();
    const target = { x: 0, y: 0 }, cam = { x: 0, y: 0, vx: 0, vy: 0 }, light = { x: 50, y: 40, tx: 50, ty: 40 };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; el.dataset.paused = visible ? "0" : "1"; }, { threshold: 0 });
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      target.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / Math.max(1, Math.min(r.height, window.innerHeight) / 2)));
      light.tx = ((e.clientX - r.left) / r.width) * 100; light.ty = ((e.clientY - r.top) / r.height) * 100;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!visible) return;
      const t = now / 1000;
      // critically-damped spring toward the cursor: smooth and weighty, never jittery
      const k = 26, c = 9.5;
      cam.vx += ((target.x - cam.x) * k - cam.vx * c) * dt; cam.x += cam.vx * dt;
      cam.vy += ((target.y - cam.y) * k - cam.vy * c) * dt; cam.y += cam.vy * dt;
      light.x += (light.tx - light.x) * Math.min(1, dt * 8); light.y += (light.ty - light.y) * Math.min(1, dt * 8);
      const wanderX = Math.sin(t * 0.11) * 0.45, wanderY = Math.cos(t * 0.07) * 0.3;
      const push = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 20); // 0 -> 1 -> 0 every 20s
      layers.forEach((l, i) => {
        const z = 1 + push * 0.16 * ZOOM[i] + 0.04 * ZOOM[i];
        l.style.transform = `translate3d(${(-(cam.x * 1.0 + wanderX) * DEPTH[i] * 3.2).toFixed(2)}em, ${(-(cam.y * 0.8 + wanderY) * DEPTH[i] * 3.2).toFixed(2)}em, 0) scale(${z.toFixed(4)}) rotate(${(cam.x * 0.35 * ZOOM[i]).toFixed(3)}deg)`;
      });
      el.style.setProperty("--lx", `${light.x.toFixed(1)}%`);
      el.style.setProperty("--ly", `${light.y.toFixed(1)}%`);
    };
    if (reduce) { el.dataset.paused = "1"; layers.forEach((l) => { l.style.transform = "scale(1.04)"; }); }
    else raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <div ref={root} aria-hidden data-paused="1" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: INK, fontSize: "clamp(9px, 1.05vw, 15px)" }}>
      <Layer items={FAR} dur={150} opacity={0.9} idx={0} />
      <Layer items={MID} dur={95} opacity={0.95} idx={1} />
      <Layer items={NEAR} dur={62} opacity={1} idx={2} />
      {/* swaying cable */}
      <svg className="cp-cable absolute left-0 top-[38%] w-full" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: "10em", filter: "drop-shadow(0 0 6px #fbbf24)" }}>
        <path d="M0 30 Q 200 -10 400 30" fill="none" stroke="#fbbf24" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* scrim keeps text readable, but thins out under the cursor so the art lights up where you point */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030508]/74 via-[#030508]/48 to-[#030508]/78"
        style={{ WebkitMaskImage: "radial-gradient(circle 17em at var(--lx, 50%) var(--ly, 40%), rgba(0,0,0,0.3), #000)", maskImage: "radial-gradient(circle 17em at var(--lx, 50%) var(--ly, 40%), rgba(0,0,0,0.3), #000)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle 13em at var(--lx, 50%) var(--ly, 40%), rgba(244,114,182,0.22), rgba(34,211,238,0.10) 55%, transparent)", mixBlendMode: "screen" }} />
      {/* film feel: vignette + faint flicker */}
      <div className="absolute inset-0 cp-film" style={{ background: "radial-gradient(ellipse at center, transparent 55%, #030508cc)" }} />
    </div>
  );
}
