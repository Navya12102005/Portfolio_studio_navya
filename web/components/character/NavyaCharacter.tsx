"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pointer, startPointerTracking } from "@/lib/pointer";
import { soundFX } from "@/utils/soundManager";

/**
 * Navya's comic cartoon, cut out (no background) and split into two layers:
 *   body.webp  - shoulders down
 *   head.webp  - head + hair, pivoting at the neck
 * Both layers share one 1073x1500 canvas, so they line up when stacked.
 *
 * Cursor sensitivity
 *  - the head turns / leans toward the cursor and the body counter-moves (parallax) + breathes
 *  - "expressions" are moods: a head pose + a comic emote + a speech bubble
 *      idle     default, follows the cursor
 *      curious  cursor comes close            -> leans in, "!" pops
 *      giggle   cursor hovers her             -> head shakes, hearts
 *      wow      click                         -> hop, star burst, cycles her lines
 *      tech/bio/ops  cursor over that nav link or hero button -> reacts to the pillar
 *      dizzy    cursor thrashing about        -> spirals
 *      sleepy   cursor still for ~9s          -> droops, ZZZ
 *
 * Real facial expressions: draw/generate more heads on the SAME canvas (1073x1500, same crop),
 * drop them in /public/character/ and register them in EXPRESSION_SPRITES below.
 * They replace the head layer while that mood is active.
 */

type Mood = "idle" | "curious" | "giggle" | "wow" | "tech" | "bio" | "ops" | "dizzy" | "sleepy";

/** Optional head sprites per mood, e.g. { wow: "/character/head_wow.webp", sleepy: "/character/head_sleepy.webp" } */
const EXPRESSION_SPRITES: Partial<Record<Mood, string>> = {};

const LINES = ["ENGINEER BY BRAIN.", "STORYTELLER BY CHOICE.", "HI, I'M NAVYA!", "ASK J.A.R.V.I.S. ANYTHING ▸"];

const MOOD_UI: Record<Mood, { line?: string; color: string; hold: number }> = {
  idle: { color: "#0A0A0A", hold: 0 },
  curious: { color: "#FF5A14", hold: 0 },
  giggle: { line: "HEHE!", color: "#FF2E7E", hold: 1500 },
  wow: { color: "#E8142A", hold: 2200 },
  tech: { line: "AI MODE: ON ✦", color: "#19E3F0", hold: 0 },
  bio: { line: "DNA, ANYONE?", color: "#FF5A14", hold: 0 },
  ops: { line: "LET'S MAKE A DEAL.", color: "#FF5A14", hold: 0 },
  dizzy: { line: "WHOA, SLOW DOWN!", color: "#6A4DFF", hold: 1800 },
  sleepy: { line: "ZZZ... WAKE ME UP", color: "#4a4f52", hold: 0 },
};

const W = 1073, H = 1500;
const PIVOT = { x: 0.5256, y: 0.3953 }; // neck, as a fraction of the canvas
const FACE = { x: 0.5, y: 0.2 };        // where she "looks from"
const RM = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = () => window.matchMedia(RM).matches;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function pillarOf(el: Element | null): Mood | null {
  const t = el?.closest("a,button");
  if (!t) return null;
  const txt = (t.textContent ?? "").replace(/[\[\]▸►\s]/g, "").toUpperCase();
  return txt === "TECH" ? "tech" : txt === "BIO" ? "bio" : txt === "OPS" ? "ops" : null;
}

/* ---------- tiny comic emotes ---------- */
function Star({ c, s = 28, x, y, d = 0 }: { c: string; s?: number; x: number; y: number; d?: number }) {
  return (
    <svg className="nc-pop" width={s} height={s} viewBox="0 0 24 24" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>
      <path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4Z" fill={c} stroke="#0A0A0A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function Heart({ x, d }: { x: number; d: number }) {
  return (
    <svg className="nc-rise" width="30" height="28" viewBox="0 0 24 22" style={{ left: `${x}%`, top: "8%", animationDelay: `${d}s` }}>
      <path d="M12 21 C3 14 1 9 1 6 C1 3 3.4 1 6 1 C8.4 1 10.8 2.6 12 5 C13.2 2.6 15.6 1 18 1 C20.6 1 23 3 23 6 C23 9 21 14 12 21Z" fill="#FF2E7E" stroke="#0A0A0A" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function Emote({ mood }: { mood: Mood }) {
  switch (mood) {
    case "giggle":
      return <><Heart x={22} d={0} /><Heart x={48} d={0.25} /><Heart x={72} d={0.5} /></>;
    case "wow":
      return <><Star c="#FFD21A" s={44} x={14} y={2} /><Star c="#19E3F0" s={30} x={70} y={0} d={0.1} /><Star c="#FF2E7E" s={26} x={84} y={14} d={0.2} />
        <span className="nc-pop font-anton" style={{ left: "46%", top: "-4%", fontSize: 64, color: "#E8142A", WebkitTextStroke: "3px #0A0A0A", paintOrder: "stroke fill" }}>!</span></>;
    case "curious":
      return <span className="nc-pop font-anton" style={{ left: "58%", top: "-2%", fontSize: 52, color: "#FF5A14", WebkitTextStroke: "3px #0A0A0A", paintOrder: "stroke fill" }}>!</span>;
    case "tech":
      return <><Star c="#19E3F0" s={34} x={20} y={4} /><Star c="#FFD21A" s={24} x={70} y={-2} d={0.15} /><Star c="#19E3F0" s={20} x={84} y={16} d={0.3} /></>;
    case "bio":
      return (
        <svg className="nc-pop" width="46" height="70" viewBox="0 0 46 70" style={{ left: "70%", top: "-6%" }}>
          <path d="M8 2 C40 18 6 34 38 50 M38 2 C6 18 40 34 8 50" fill="none" stroke="#0A0A0A" strokeWidth="9" strokeLinecap="round" />
          <path d="M8 2 C40 18 6 34 38 50" fill="none" stroke="#19E3F0" strokeWidth="5" strokeLinecap="round" />
          <path d="M38 2 C6 18 40 34 8 50" fill="none" stroke="#FF5A14" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "ops":
      return <span className="nc-pop font-anton" style={{ left: "68%", top: "-4%", fontSize: 50, color: "#FF5A14", WebkitTextStroke: "3px #0A0A0A", paintOrder: "stroke fill" }}>$</span>;
    case "dizzy":
      return (
        <svg className="nc-spin" width="64" height="64" viewBox="0 0 64 64" style={{ left: "40%", top: "-6%" }}>
          <path d="M32 32 m0 0 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0" fill="none" stroke="#6A4DFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "sleepy":
      return <>{[0, 1, 2].map((i) => (
        <span key={i} className="nc-rise font-anton" style={{ left: `${60 + i * 9}%`, top: "6%", fontSize: 26 + i * 12, color: "#F2F2EE", WebkitTextStroke: "2px #0A0A0A", paintOrder: "stroke fill", animationDelay: `${i * 0.6}s`, animationDuration: "2.4s" }}>Z</span>
      ))}</>;
    default:
      return null;
  }
}

export default function NavyaCharacter({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [mood, setMood] = useState<Mood>("idle");
  const [line, setLine] = useState<string | null>(null);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);

  const moodRef = useRef<Mood>("idle");
  const holdUntil = useRef(0);
  const lineIdx = useRef(0);
  const hovering = useRef(false);
  const clicked = useRef(0);
  const timers = useRef<number[]>([]);

  const setMoodNow = useCallback((m: Mood, text?: string) => {
    moodRef.current = m;
    setMood(m);
    setLine(text ?? MOOD_UI[m].line ?? null);
    holdUntil.current = performance.now() + MOOD_UI[m].hold;
  }, []);

  /* hover / click */
  const onEnter = () => {
    hovering.current = true;
    if (moodRef.current === "idle" || moodRef.current === "curious" || moodRef.current === "sleepy") {
      soundFX.playHoverTick();
      setMoodNow("giggle");
    }
  };
  const onLeave = () => { hovering.current = false; };
  const onActivate = () => {
    soundFX.playClickLock();
    clicked.current = performance.now();
    const text = LINES[lineIdx.current++ % LINES.length];
    setMoodNow("wow", text);
  };

  useEffect(() => {
    if (reduced) return;
    startPointerTracking();

    // current (smoothed) pose
    const cur = { rot: 0, x: 0, y: 0, sc: 1, brot: 0, bx: 0 };
    let lastMoveAt = performance.now();
    let lastX = pointer.x, lastY = pointer.y;
    let thrash = 0;
    let raf = 0;

    const frame = (now: number) => {
      const box = boxRef.current, head = headRef.current, body = bodyRef.current;
      if (!box || !head || !body) { raf = requestAnimationFrame(frame); return; }
      const r = box.getBoundingClientRect();
      const t = now / 1000;
      const hx = r.left + r.width * FACE.x, hy = r.top + r.height * FACE.y;
      const px = pointer.x || window.innerWidth * 0.5, py = pointer.y || window.innerHeight * 0.5;

      /* pointer activity: wakes her up, detects thrashing */
      const dMove = Math.hypot(pointer.x - lastX, pointer.y - lastY);
      lastX = pointer.x; lastY = pointer.y;
      if (dMove > 0.5) lastMoveAt = now;
      thrash = Math.max(0, thrash * 0.93 + (dMove > 55 ? 1 : 0));

      const m = moodRef.current;
      const held = now < holdUntil.current;

      if (!held) {
        let next: Mood = "idle";
        const pill = pillarOf(pointer.targetEl);
        const dist = Math.hypot(px - hx, py - hy);
        if (thrash > 5) next = "dizzy";
        else if (hovering.current) next = "giggle";
        else if (pill) next = pill;
        else if (now - lastMoveAt > 9000) next = "sleepy";
        else if (dist < Math.max(220, r.width * 0.55)) next = "curious";
        if (next !== m) {
          if (next === "dizzy") thrash = 0;
          setMoodNow(next);
        } else if (!held && m === "giggle" && !hovering.current) setMoodNow("idle");
      }

      /* target pose */
      const dx = px - hx, dy = py - hy;
      const nx = clamp(dx / (window.innerWidth * 0.45), -1, 1);
      const ny = clamp(dy / (window.innerHeight * 0.45), -1, 1);
      let tr = nx * 3.6, tx = nx * 10, ty = ny * 6, ts = 1 + (1 - Math.min(1, Math.hypot(dx, dy) / 700)) * 0.014;

      const mm = moodRef.current;
      const k = held ? clamp((holdUntil.current - now) / Math.max(1, MOOD_UI[mm].hold), 0, 1) : 1;
      if (mm === "curious") { ts += 0.02; ty += -4; }
      if (mm === "giggle") tr += Math.sin(t * 24) * 2.6 * (held ? k : 0.7);
      if (mm === "wow") { ty += -Math.sin(Math.min(1, (now - clicked.current) / 420) * Math.PI) * 26 * 1; ts += 0.035 * k; tr += Math.sin(t * 18) * 0.8 * k; }
      if (mm === "dizzy") { tr += Math.sin(t * 9) * 5.5; tx += Math.cos(t * 9) * 8; }
      if (mm === "sleepy") { tr = 5 + Math.sin(t * 1.1) * 0.8; tx = 4; ty = 10 + Math.sin(t * 1.1) * 3; ts = 1; }
      if (mm === "tech") { tr += -2; ty += -5; ts += 0.012; }
      if (mm === "bio") { tr += 2.4; ty += -3; }
      if (mm === "ops") { tr += -1.4; ty += -2; ts += 0.012; }

      const a = mm === "giggle" || mm === "dizzy" ? 0.35 : 0.11;
      cur.rot += (tr - cur.rot) * a; cur.x += (tx - cur.x) * a; cur.y += (ty - cur.y) * a; cur.sc += (ts - cur.sc) * a;
      cur.brot += (-cur.rot * 0.18 - cur.brot) * 0.1; cur.bx += (-cur.x * 0.22 - cur.bx) * 0.1;

      head.style.transform = `translate(${cur.x.toFixed(2)}px,${cur.y.toFixed(2)}px) rotate(${cur.rot.toFixed(2)}deg) scale(${cur.sc.toFixed(4)})`;
      const breathe = 1 + Math.sin(t * 1.6) * 0.0045;
      body.style.transform = `translateX(${cur.bx.toFixed(2)}px) rotate(${cur.brot.toFixed(2)}deg) scaleY(${breathe.toFixed(4)})`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const ts = timers.current;
    return () => { cancelAnimationFrame(raf); ts.forEach(clearTimeout); };
  }, [reduced, setMoodNow]);

  const headSrc = EXPRESSION_SPRITES[mood] ?? "/character/head.webp";
  const ui = MOOD_UI[mood];

  return (
    <div className={`nc-root pointer-events-none absolute z-[1] hidden md:block ${className}`} style={{ right: "2vw", bottom: 52, height: "clamp(340px, 62vh, 720px)", aspectRatio: `${W} / ${H}` }}>
      <style>{CSS}</style>
      <div
        ref={boxRef}
        role="button"
        tabIndex={0}
        aria-label="Navya's cartoon. Hover, click or move your cursor around to see her react."
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onClick={onActivate}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onActivate(); } }}
        className="nc-box pointer-events-auto absolute inset-0 cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19E3F0]"
      >
        <div className="nc-shadow absolute inset-0">
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/character/char_full.webp" alt="Cartoon of Navya Gupta, smiling with her arms crossed" className="nc-art absolute inset-0 h-full w-full select-none" draggable={false} />
        ) : (
          <>
            <div ref={bodyRef} className="absolute inset-0" style={{ transformOrigin: "50% 100%", willChange: "transform" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/character/body.webp" alt="" className="nc-art h-full w-full select-none" draggable={false} />
            </div>
            <div ref={headRef} className="absolute inset-0" style={{ transformOrigin: `${PIVOT.x * 100}% ${PIVOT.y * 100}%`, willChange: "transform" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={headSrc} alt="Cartoon of Navya Gupta, smiling with her arms crossed" className="nc-art h-full w-full select-none" draggable={false} />
            </div>
          </>
        )}
        </div>

        {/* comic emote layer, above the head */}
        <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 h-[34%]">
          <div key={mood} className="relative h-full w-full"><Emote mood={mood} /></div>
        </div>

        {/* speech bubble to her left */}
        {line && (
          <div aria-live="polite" key={mood + line} className="nc-bubble font-anton" style={{ color: ui.color }}>
            {line}
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
.nc-shadow{ filter: drop-shadow(10px 10px 0 #0A0A0A) }
.nc-art{ -webkit-user-drag:none }
.nc-box > * { position:absolute }
.nc-pop{ position:absolute; transform-origin:center; animation:nc-pop .45s cubic-bezier(.2,1.6,.4,1) both }
.nc-rise{ position:absolute; animation:nc-rise 1.5s ease-out both }
.nc-spin{ position:absolute; animation:nc-spin 1.1s linear infinite }
.nc-bubble{ position:absolute; right:74%; top:4%; max-width:15em; width:max-content; padding:.35em .7em .3em; background:#fff; border:4px solid #0A0A0A; border-radius:14px;
  box-shadow:6px 6px 0 #0A0A0A; font-size:clamp(20px,2.2vw,34px); line-height:1.05; letter-spacing:.01em; animation:nc-bubble .35s cubic-bezier(.2,1.5,.4,1) both; transform-origin:100% 100%; pointer-events:none }
.nc-bubble::after{ content:""; position:absolute; right:-17px; bottom:12px; width:22px; height:22px; background:#fff; border-right:4px solid #0A0A0A; border-top:4px solid #0A0A0A; transform:rotate(45deg) skew(10deg,10deg) }
@keyframes nc-pop{ from{ transform:scale(0) rotate(-20deg) } to{ transform:scale(1) rotate(0) } }
@keyframes nc-rise{ 0%{ transform:translateY(20px) scale(.4); opacity:0 } 20%{ opacity:1 } 100%{ transform:translateY(-60px) scale(1.1); opacity:0 } }
@keyframes nc-spin{ to{ transform:rotate(360deg) } }
@keyframes nc-bubble{ from{ transform:scale(.2); opacity:0 } to{ transform:scale(1); opacity:1 } }
`;
