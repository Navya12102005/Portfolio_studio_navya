"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Background for the OPS slide: an original 80s "city-pop" street of flat-colour signs, striped discs and rainbow
 * arcs, drawn in a strict orange / black / grey / white palette. Three layers drift upward at different speeds
 * and shift slightly with the cursor for depth. A dark scrim keeps the text on top readable.
 * Pure CSS + DOM: the layout is generated once from a fixed seed (same on server and client), the pointer writes two
 * CSS variables instead of re-rendering, and everything pauses off-screen and under prefers-reduced-motion.
 */
const WORDS = ["SALE", "NEW", "MAIL", "KPI", "GROWTH", "DEAL", "SEND", "OPEN", "LEADS", "ROI", "CRM", "POST", "LAUNCH", "BRAND", "PLAN", "CLOSE", "REPLY", "GO!"];
// Strict palette: orange, black, grey, white, plus the neon blue already used on the AI button. Nothing else.
const NB = "#00F0FF";
const OR = "#FF5A14", WH = "#F2F2EE", BK = "#0A0A0A", G1 = "#1a1a1a", G2 = "#2c2c2c", G3 = "#5c5c5c", G4 = "#9a9a9a";
const INK = "#050505";
const TILE = 80; // em: height of one repeating tile

type Kind = "sign" | "vsign" | "arrow" | "pill" | "disc" | "arc" | "checker" | "hazard" | "bld";
type Item = { kind: Kind; x: number; y: number; w: number; h: number; c: string; c2: string; word: string; rot: number; flick: boolean; v: number };

function rng(seed: number) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];

function layout(seed: number, cols: number, rows: number, kinds: Kind[], size: [number, number], sizeH: [number, number], fills: string[]): Item[] {
  const r = rng(seed), out: Item[] = [];
  for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
    const kind = pick(r, kinds), w = size[0] + r() * (size[1] - size[0]), h = kind === "disc" || kind === "checker" ? w : sizeH[0] + r() * (sizeH[1] - sizeH[0]);
    out.push({
      kind, w, h, x: ((cx + 0.1 + r() * 0.5) / cols) * 100, y: ((cy + 0.1 + r() * 0.5) / rows) * TILE,
      c: pick(r, fills), c2: pick(r, [OR, WH, G4]), word: pick(r, WORDS), rot: (r() - 0.5) * 12, flick: r() < 0.25, v: Math.floor(r() * 3),
    });
  }
  return out;
}

const FAR = layout(11, 5, 4, ["bld"], [7, 13], [26, 52], [G1, G2, G3]);
const MID = layout(23, 3, 5, ["sign", "sign", "vsign", "arrow", "pill", "sign"], [10, 17], [4.2, 6.5], [OR, WH, OR, BK]);
const NEAR = layout(37, 2, 4, ["disc", "arc", "checker", "disc", "hazard"], [8, 12], [3, 4.5], [OR, WH, G4]);

const halftone = (c: string) => `radial-gradient(${c} 0.14em, transparent 0.16em) 0 0 / 0.75em 0.75em`;
const textOn = (bg: string) => (bg === OR || bg === WH || bg === G4 ? BK : WH);

function Piece({ it }: { it: Item }) {
  const base: CSSProperties = { position: "absolute", left: `${it.x}%`, top: `${it.y}em`, width: `${it.w}em`, height: `${it.h}em` };
  const cls = it.flick ? "cp-flick" : undefined;
  const glow = `0 0 2.2em ${OR}66`;
  if (it.kind === "bld") {
    // tower: tonal grey body, window grid, a few lit orange windows, roof ledge and antenna
    return (
      <div style={base}>
        <div style={{ position: "absolute", left: "50%", top: "-3.4em", width: "0.22em", height: "3.4em", background: G3, boxShadow: `0 -0.5em 0 0.15em ${OR}` }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${it.c}, ${INK})`, border: `0.25em solid ${G3}`, backgroundImage: `repeating-linear-gradient(90deg, ${WH}22 0 0.55em, transparent 0.55em 1.8em), repeating-linear-gradient(0deg, transparent 0 1.3em, ${INK} 1.3em 1.6em)` }} />
        <div style={{ position: "absolute", left: "-0.5em", right: "-0.5em", top: "-0.4em", height: "0.8em", background: G3, border: `0.2em solid ${INK}` }} />
        <div style={{ position: "absolute", left: `${12 + it.v * 22}%`, top: "30%", width: "1.2em", height: "1.4em", background: OR, boxShadow: `0 0 1.2em ${OR}, 2.4em 4.3em 0 ${NB}, -1em 8.6em 0 ${OR}, 3.4em 12em 0 ${NB}` }} />
      </div>
    );
  }
  if (it.kind === "sign")
    return (
      <div className={cls} style={{ ...base, transform: `rotate(${it.rot}deg) skewX(-6deg)`, background: it.c, color: textOn(it.c), border: `0.3em solid ${INK}`, borderRadius: "0.7em", boxShadow: `0.4em 0.4em 0 ${it.c2 === it.c ? G4 : it.c2}, ${glow}`, display: "flex", alignItems: "center", justifyContent: "center", outline: `0.12em solid ${it.c === BK ? OR : INK}`, outlineOffset: "-0.75em" }}>
        <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "0.5em", background: halftone(it.c === OR ? BK + "40" : G3 + "55"), mixBlendMode: "multiply" }} />
        {[0, 1, 2, 3].map((i) => <i key={i} style={{ position: "absolute", top: i < 2 ? "0.45em" : "auto", bottom: i >= 2 ? "0.45em" : "auto", left: i % 2 === 0 ? "0.45em" : "auto", right: i % 2 === 1 ? "0.45em" : "auto", width: "0.3em", height: "0.3em", borderRadius: "50%", background: INK, opacity: 0.7 }} />)}
        <span className="font-anton" style={{ position: "relative", fontSize: `${it.h * 0.6}em`, letterSpacing: "0.05em", lineHeight: 1 }}>{it.word}</span>
      </div>
    );
  if (it.kind === "pill")
    return (
      <div className={cls} style={{ ...base, height: `${it.h * 0.85}em`, background: BK, color: it.v === 0 ? NB : OR, border: `0.28em solid ${it.v === 0 ? NB : OR}`, borderRadius: "99em", boxShadow: `inset 0 0 1.2em ${(it.v === 0 ? NB : OR)}55, 0 0 2.2em ${(it.v === 0 ? NB : OR)}66`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${it.rot}deg)` }}>
        <span className="font-anton" style={{ fontSize: `${it.h * 0.5}em`, letterSpacing: "0.14em", textShadow: `0 0 0.6em ${it.v === 0 ? NB : OR}` }}>● {it.word}</span>
      </div>
    );
  if (it.kind === "arrow")
    return (
      <div className={cls} style={{ ...base, transform: `rotate(${it.rot * 0.6}deg)`, filter: `drop-shadow(0.3em 0.3em 0 ${INK}) drop-shadow(0 0 1.2em ${OR}77)` }}>
        <div style={{ width: "100%", height: "100%", background: WH, color: BK, clipPath: "polygon(0 18%, 68% 18%, 68% 0, 100% 50%, 68% 100%, 68% 82%, 0 82%)", display: "flex", alignItems: "center", paddingLeft: "1em", boxSizing: "border-box" }}>
          <span className="font-anton" style={{ fontSize: `${it.h * 0.55}em`, lineHeight: 1, letterSpacing: "0.04em" }}>{it.word}</span>
        </div>
      </div>
    );
  if (it.kind === "vsign")
    return (
      <div className={cls} style={{ ...base, width: `${it.h * 0.9}em`, height: `${it.w * 1.3}em`, background: BK, border: `0.3em solid ${OR}`, boxShadow: `0 0 2em ${OR}77, inset 0 0 1em ${OR}33`, borderRadius: "0.5em", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", color: WH }}>
        {it.word.slice(0, 4).split("").map((ch, i) => <span key={i} className="font-anton" style={{ fontSize: `${it.h * 0.6}em`, lineHeight: 1, color: i % 2 ? WH : it.v === 1 ? NB : OR }}>{ch}</span>)}
      </div>
    );
  if (it.kind === "hazard")
    return <div style={{ ...base, width: `${it.w * 1.6}em`, height: `${it.h * 0.9}em`, background: `repeating-linear-gradient(-45deg, ${OR} 0 1em, ${BK} 1em 2em)`, border: `0.28em solid ${INK}`, boxShadow: `0.4em 0.4em 0 ${G3}`, transform: `rotate(${it.rot}deg)` }} />;
  if (it.kind === "checker")
    return <div className="cp-float" style={{ ...base, background: `conic-gradient(${WH} 25%, ${BK} 0 50%, ${WH} 0 75%, ${BK} 0) 0 0 / 2em 2em`, border: `0.3em solid ${INK}`, boxShadow: `0.4em 0.4em 0 ${OR}`, borderRadius: "0.4em" }} />;
  if (it.kind === "arc")
    return <div className="cp-float" style={{ ...base, width: `${it.w}em`, height: `${it.w / 2}em`, borderRadius: `${it.w}em ${it.w}em 0 0`, background: `radial-gradient(circle at 50% 100%, transparent 0 22%, ${OR} 22% 36%, ${INK} 36% 40%, ${WH} 40% 54%, ${INK} 54% 58%, ${NB} 58% 72%, ${INK} 72% 76%, ${G2} 76% 90%, transparent 90%)`, filter: `drop-shadow(0 0 1.2em ${OR}88)` }} />;
  // disc: starburst, stripes or halftone dots
  const bg = it.v === 0 ? `conic-gradient(from 0deg, ${OR} 0 8%, ${INK} 8% 16%, ${OR} 16% 24%, ${INK} 24% 32%, ${OR} 32% 40%, ${INK} 40% 48%, ${OR} 48% 56%, ${INK} 56% 64%, ${OR} 64% 72%, ${INK} 72% 80%, ${OR} 80% 88%, ${INK} 88%)`
    : it.v === 1 ? `repeating-linear-gradient(45deg, ${OR} 0 0.9em, ${WH} 0.9em 1.8em)` : `${halftone(OR)}, radial-gradient(circle, ${BK} 0 20%, ${NB} 20% 46%, ${WH} 46%)`;
  return <div className="cp-float" style={{ ...base, animationDelay: `${-it.x / 10}s` }}><div className={it.v === 0 ? "cp-spin" : undefined} style={{ width: "100%", height: "100%", borderRadius: "50%", background: bg, border: `0.3em solid ${INK}`, boxShadow: `0.4em 0.4em 0 ${it.c2 === OR ? G3 : OR}, 0 0 2em ${OR}66` }} /></div>;
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
      <svg className="cp-cable absolute left-0 top-[38%] w-full" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: "10em", filter: `drop-shadow(0 0 6px ${OR})` }}>
        <path d="M0 30 Q 200 -10 400 30" fill="none" stroke={OR} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* scrim keeps text readable, but thins out under the cursor so the art lights up where you point */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/74 via-[#050505]/48 to-[#050505]/78"
        style={{ WebkitMaskImage: "radial-gradient(circle 17em at var(--lx, 50%) var(--ly, 40%), rgba(0,0,0,0.3), #000)", maskImage: "radial-gradient(circle 17em at var(--lx, 50%) var(--ly, 40%), rgba(0,0,0,0.3), #000)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle 13em at var(--lx, 50%) var(--ly, 40%), rgba(255,90,20,0.28), rgba(0,240,255,0.12) 55%, transparent)", mixBlendMode: "screen" }} />
      {/* film feel: vignette + faint flicker */}
      <div className="absolute inset-0 cp-film" style={{ background: "radial-gradient(ellipse at center, transparent 55%, #050505cc)" }} />
    </div>
  );
}
