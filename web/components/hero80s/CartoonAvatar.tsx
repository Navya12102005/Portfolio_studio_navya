"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export type Mood = "idle" | "curious" | "hyped";

/**
 * 80s Saturday-morning-cartoon avatar, drawn as layered SVG: thick black outlines, flat saturated fills and hard
 * two-tone cel shading. It reacts to the cursor anywhere on the page:
 *  - the pupils track the pointer, the head tilts in 3D toward it,
 *  - the closer the pointer gets, the more the brows lift and the mouth morphs from a smile to a wide grin,
 *  - it always floats and breathes, and blinks every few seconds.
 * Everything animated is a motion value, so pointer moves never re-render React.
 */
const INK = "#0B0B10", SKIN = "#F8B88B", SKIN_SHADE = "#E88F66", HAIR = "#1A1030", HAIR_SHEEN = "#5B3DB8";
const RED = "#E4152B", RED_SHADE = "#A50E20", PATTERN = "#FFE2A0";
const OUT = 5; // outline weight

// Mouth morph: both paths share one structure so Framer can interpolate them.
const MOUTH_SMILE = "M 168 247 Q 200 261 232 247 Q 200 251 168 247 Z";
const MOUTH_GRIN = "M 152 238 Q 200 258 248 238 Q 200 306 152 238 Z";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function CartoonAvatar({ className = "", onMoodChange }: { className?: string; onMoodChange?: (m: Mood) => void }) {
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // raw pointer-derived targets (-1..1) and closeness (0..1)
  const rx = useMotionValue(0), ry = useMotionValue(0), rm = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const gx = useSpring(rx, spring), gy = useSpring(ry, spring), mood = useSpring(rm, { stiffness: 90, damping: 16 });

  useEffect(() => {
    let last: Mood = "idle";
    const report = (m: number) => {
      const next: Mood = m > 0.66 ? "hyped" : m > 0.2 ? "curious" : "idle";
      if (next !== last) { last = next; onMoodChange?.(next); }
    };
    const onMove = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
      rx.set(clamp((e.clientX - cx) / (window.innerWidth / 2), -1, 1));
      ry.set(clamp((e.clientY - cy) / (window.innerHeight / 2), -1, 1));
      const m = clamp(1 - Math.hypot(e.clientX - cx, e.clientY - cy) / 520);
      rm.set(m); report(m);
    };
    const onLeave = () => { rx.set(0); ry.set(0); rm.set(0); report(0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave); };
  }, [rx, ry, rm, onMoodChange]);

  // derived transforms
  const rotateY = useTransform(gx, [-1, 1], [-12, 12]);
  const rotateX = useTransform(gy, [-1, 1], [7, -7]);
  const rotateZ = useTransform(gx, [-1, 1], [-3, 3]);
  const pupilX = useTransform(gx, [-1, 1], [-7, 7]);
  const pupilY = useTransform(gy, [-1, 1], [-4.5, 4.5]);
  const browY = useTransform(mood, [0, 1], [0, -9]);
  const browTilt = useTransform(mood, [0, 1], [0, -7]);
  const mouthD = useTransform(mood, [0, 1], [MOUTH_SMILE, MOUTH_GRIN]);
  const blush = useTransform(mood, [0, 1], [0.15, 0.6]);
  const eyeOpen = useTransform(mood, [0, 1], [1, 1.14]);

  const idle = reduce ? undefined : { y: [0, -9, 0] };
  const breathe = reduce ? undefined : { scaleY: [1, 1.012, 1], scaleX: [1, 1.006, 1] };
  const blink = reduce ? undefined : { scaleY: [1, 1, 0.08, 1] };

  const eye = (cx: number) => (
    <g key={cx}>
      <clipPath id={`${uid}-eye-${cx}`}><ellipse cx={cx} cy={176} rx={25} ry={18} /></clipPath>
      <motion.g animate={blink} transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.94, 0.97, 1] }} style={{ transformBox: "fill-box", transformOrigin: "center", scaleY: eyeOpen }}>
        <ellipse cx={cx} cy={176} rx={25} ry={18} fill="#fff" stroke={INK} strokeWidth={OUT} />
        <g clipPath={`url(#${uid}-eye-${cx})`}>
          <motion.g style={{ x: pupilX, y: pupilY }}>
            <circle cx={cx} cy={177} r={13} fill="#5A3320" stroke={INK} strokeWidth={2.5} />
            <circle cx={cx} cy={177} r={6} fill={INK} />
            <circle cx={cx + 4} cy={172} r={3.4} fill="#fff" />
          </motion.g>
          <path d={`M ${cx - 26} 166 Q ${cx} 150 ${cx + 26} 166 L ${cx + 26} 158 L ${cx - 26} 158 Z`} fill={SKIN_SHADE} opacity={0.55} />
        </g>
        <path d={`M ${cx - 26} 172 Q ${cx} 152 ${cx + 26} 172`} fill="none" stroke={INK} strokeWidth={OUT + 2} strokeLinecap="round" />
      </motion.g>
    </g>
  );

  return (
    <div ref={box} className={className} style={{ perspective: 900 }} aria-hidden>
      <motion.div animate={idle} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ rotateX, rotateY, rotateZ, transformStyle: "preserve-3d" }}>
        <svg viewBox="0 0 400 480" className="w-full h-auto drop-shadow-[0_0_40px_rgba(255,46,136,0.35)]" role="img">
          <defs>
            <pattern id={`${uid}-pat`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
              <rect width="22" height="22" fill={RED} />
              <circle cx="6" cy="6" r="2.6" fill={PATTERN} /><circle cx="17" cy="17" r="2.6" fill={PATTERN} />
              <path d="M17 4 l2 3 -2 3 -2 -3 z" fill="#FFB300" />
            </pattern>
            <clipPath id={`${uid}-mouth`}><motion.path d={mouthD} /></clipPath>
            <clipPath id={`${uid}-face`}><path d="M 120 150 C 120 105 160 82 200 82 C 240 82 280 105 280 150 L 278 225 L 222 300 Q 200 312 178 300 L 122 225 Z" /></clipPath>
          </defs>

          {/* back hair */}
          <path d="M 92 190 C 70 90 130 40 200 40 C 275 40 332 92 308 190 L 330 360 L 280 392 L 120 392 L 70 360 Z" fill={HAIR} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <path d="M 300 120 C 322 190 318 270 326 350 L 292 372 C 298 290 300 200 270 110 Z" fill={HAIR_SHEEN} opacity={0.35} />

          {/* torso (breathes) */}
          <motion.g animate={breathe} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <path d="M 60 480 C 60 380 128 338 200 338 C 272 338 340 380 340 480 Z" fill={`url(#${uid}-pat)`} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
            <path d="M 250 345 C 310 360 340 410 340 480 L 270 480 C 286 420 270 372 238 350 Z" fill={RED_SHADE} opacity={0.55} />
            <path d="M 168 340 L 200 392 L 232 340 Z" fill={SKIN} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
            <path d="M 160 336 L 200 400 L 240 336" fill="none" stroke={INK} strokeWidth={OUT} strokeLinecap="round" strokeLinejoin="round" />
            {/* neck */}
            <path d="M 170 285 L 170 345 Q 200 372 230 345 L 230 285 Z" fill={SKIN} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
            <path d="M 170 300 Q 200 322 230 300 L 230 285 L 170 285 Z" fill={SKIN_SHADE} />
          </motion.g>

          {/* face */}
          <path d="M 120 150 C 120 105 160 82 200 82 C 240 82 280 105 280 150 L 278 225 L 222 300 Q 200 312 178 300 L 122 225 Z" fill={SKIN} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <g clipPath={`url(#${uid}-face)`}>
            <path d="M 232 80 C 286 110 290 200 270 232 L 222 300 L 196 312 C 236 270 250 160 232 80 Z" fill={SKIN_SHADE} opacity={0.6} />
          </g>
          {/* cheeks */}
          <motion.ellipse cx={142} cy={222} rx={17} ry={9} fill="#FF4F6D" style={{ opacity: blush }} />
          <motion.ellipse cx={258} cy={222} rx={17} ry={9} fill="#FF4F6D" style={{ opacity: blush }} />

          {eye(160)}{eye(240)}

          {/* brows */}
          <motion.g style={{ y: browY }}>
            <motion.path d="M 131 148 Q 160 130 190 142" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" style={{ rotate: browTilt, transformBox: "fill-box", transformOrigin: "100% 100%" }} />
            <motion.path d="M 210 142 Q 240 130 269 148" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" style={{ rotate: useTransform(browTilt, (v) => -v), transformBox: "fill-box", transformOrigin: "0% 100%" }} />
          </motion.g>

          {/* nose */}
          <path d="M 198 196 Q 192 220 204 226" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />

          {/* mouth */}
          <motion.path d={mouthD} fill="#6B0F22" stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <g clipPath={`url(#${uid}-mouth)`}>
            <rect x="140" y="230" width="120" height="20" fill="#fff" />
            <line x1="200" y1="230" x2="200" y2="250" stroke={INK} strokeWidth={1.6} />
          </g>
          <motion.path d={mouthD} fill="none" stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />

          {/* front hair: bangs + side locks over the shoulders */}
          <path d="M 200 62 C 140 62 102 112 112 182 C 130 142 168 110 200 86 Z" fill={HAIR} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <path d="M 200 62 C 260 62 298 112 288 182 C 270 142 232 110 200 86 Z" fill={HAIR} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <path d="M 150 86 C 168 70 190 66 198 68 C 178 76 164 88 150 104 Z" fill={HAIR_SHEEN} opacity={0.75} />
          <path d="M 250 86 C 232 70 210 66 202 68 C 222 76 236 88 250 104 Z" fill={HAIR_SHEEN} opacity={0.75} />
          <path d="M 112 170 C 98 240 100 330 84 384 L 134 372 C 128 300 126 240 126 196 Z" fill={HAIR} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <path d="M 288 172 C 302 240 300 330 316 384 L 268 372 C 276 300 276 240 274 196 Z" fill={HAIR} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
          <circle cx={121} cy={226} r={5} fill="none" stroke="#FFB300" strokeWidth={2.6} />
          <path d="M 104 220 C 100 280 104 330 96 372" fill="none" stroke={HAIR_SHEEN} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        </svg>
      </motion.div>
    </div>
  );
}
