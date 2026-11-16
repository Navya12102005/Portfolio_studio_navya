/**
 * Two canvas HUD scenes for the J.A.R.V.I.S. boot, drawn on a 420x640 logical canvas.
 * Both are pure functions of time (seconds) so they are deterministic and testable.
 *   A: dark maroon "CORE STABILITY" panel with a morphing hatched star
 *   B: tan panel with a pixel-grid eye, scan column, pulse line and equalizer
 */

export const W = 420;
export const H = 640;
export const PALETTE = {
  A: { bg: "#251212", bg2: "#220F0D", grid: "#3A2422", ink: "#E9DDCB", dim: "#463331" },
  B: { bg: "#BAB19F", grid: "#AEA595", mid: "#534C43", dark: "#1C1A17" },
};

export type Fonts = { mono: string };
type Ctx = CanvasRenderingContext2D;

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => { v = clamp(v); return v * v * (3 - 2 * v); };
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
/** cheap smooth value noise in 1-D */
const noise = (x: number, s: number) => { const i = Math.floor(x), f = smooth(x - i); return hash(i, s) * (1 - f) + hash(i + 1, s) * f; };

/* ============================== SCENE A ============================== */

const STAR_N = 1900;
const RING_N = 520;
const DISC_N = 260;
const starSeed = (() => {
  const r = rng(7);
  return {
    th: Float32Array.from({ length: STAR_N }, () => r() * Math.PI * 2),
    u: Float32Array.from({ length: STAR_N }, () => Math.sqrt(r())),
    len: Float32Array.from({ length: STAR_N }, () => 6 + r() * 8),
    al: Float32Array.from({ length: STAR_N }, () => r()),
    jt: Float32Array.from({ length: STAR_N }, () => r() - 0.5),
    ringA: Float32Array.from({ length: RING_N }, () => r() * Math.PI * 2),
    ringS: Float32Array.from({ length: RING_N }, () => 0.45 + r() * 0.55),
    ringK: Uint8Array.from({ length: RING_N }, () => (r() < 0.5 ? 0 : 1)),
    discR: Float32Array.from({ length: DISC_N }, () => Math.pow(r(), 0.7)),
    discA: Float32Array.from({ length: DISC_N }, () => r() * Math.PI * 2),
  };
})();

const LABELS = [
  ["INTERLINK HOLD", "BASELINE SEALED", "SYNC 99% TEMP"],
  ["UNIFY BOND CALM", "L-RAIL 0.08V HOLD", "LATTICE"],
  ["MEM-ECHO LTH LOW", "AFFECT FLAT 50", "CELLS 1 COM LOADED"],
  ["STATUS // NORMAL", "PHASE 02 // LOADED", "NOISE BURN 0"],
];
const CODES = ["YDJZ.RBT.282.AZE.BIM", "BDVB.NGZ.676.OOQ.CQX", "MTUG.USA.053.CDY.YSL", "ODFI.MEP.348.YZB.TZX"];
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function bracketFrame(c: Ctx, x0: number, y0: number, x1: number, y1: number, r: number, l: number) {
  const pts: [number, number, number, number][] = [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]];
  for (const [x, y, sx, sy] of pts) {
    c.beginPath();
    c.moveTo(x + sx * l, y);
    c.lineTo(x + sx * r, y);
    c.quadraticCurveTo(x, y, x, y + sy * r);
    c.lineTo(x, y + sy * l);
    c.stroke();
  }
}

function dotGrid(c: Ctx, x0: number, y0: number, x1: number, y1: number, step: number) {
  for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) c.fillRect(x, y, 1.5, 1.5);
}

export function drawSceneA(c: Ctx, t: number, f: Fonts) {
  const P = PALETTE.A;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, P.bg); g.addColorStop(1, P.bg2);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = P.grid; c.lineWidth = 1;
  c.beginPath();
  for (let x = 0; x <= W; x += 24) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 24) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
  c.stroke();

  c.textBaseline = "alphabetic"; c.textAlign = "left";
  c.strokeStyle = P.ink; c.fillStyle = P.ink; c.lineWidth = 1.5;

  /* 1. bracket frame + labels */
  const fx0 = 20, fy0 = 20, fx1 = 400, fy1 = 272;
  bracketFrame(c, fx0, fy0, fx1, fy1, 10, 34);
  c.font = `600 10px ${f.mono}`;
  c.fillText("CORE", fx0 + 14, fy0 + 24); c.fillText("STABILITY", fx0 + 14, fy0 + 37);
  c.lineWidth = 1; c.strokeRect(fx1 - 24, fy0 + 14, 9, 9);
  const li = Math.floor(t / 0.5) % LABELS.length;
  c.font = `500 8.5px ${f.mono}`;
  LABELS[li].forEach((s, i) => c.fillText(s, fx0 + 14, fy1 - 36 + i * 11));
  if (Math.floor(t * 3) % 2 === 0) c.fillRect(fx1 - 24, fy1 - 24, 9, 9); else c.strokeRect(fx1 - 24, fy1 - 24, 9, 9);

  /* 2. the morphing hatched star */
  const cx = 210, cy = 146, R = 104;
  const T = 5, tri = 1 - Math.abs(2 * ((t / T) % 1) - 1);          // 0..1..0 over T seconds
  const k = 3 - 2.2 * smooth(tri / 0.5);                           // spiky star -> fat cross
  const m = smooth((tri - 0.5) / 0.5);                             // cross -> rounded square
  const ringG = Math.exp(-Math.pow((tri - 0.5) / 0.2, 2));         // ring loops fade in around the cross
  const phi = t * 0.35;
  const profile = (th: number) => {
    const star = 0.25 + 0.75 * Math.pow(Math.abs(Math.cos(2 * (th - phi))), k);
    const a = Math.abs(Math.cos(th - phi)), b = Math.abs(Math.sin(th - phi));
    const sq = 0.86 / Math.pow(Math.pow(a, 4) + Math.pow(b, 4), 0.25);
    return star * (1 - m) + Math.min(sq, 1.05) * 0.86 * m;
  };
  c.lineCap = "round";
  for (let bucket = 0; bucket < 3; bucket++) {
    c.strokeStyle = P.ink; c.globalAlpha = [0.38, 0.62, 0.9][bucket]; c.lineWidth = 0.9;
    c.beginPath();
    for (let i = 0; i < STAR_N; i++) {
      if (Math.min(2, Math.floor(starSeed.al[i] * 3)) !== bucket) continue;
      const th = starSeed.th[i], u = starSeed.u[i];
      if (u < 0.2) continue;
      const rad = u * R * profile(th) * (1 + starSeed.jt[i] * 0.05 * Math.sin(t * 2 + i));
      const x = cx + Math.cos(th) * rad, y = cy + Math.sin(th) * rad;
      const a = th + 1.25 + 0.6 * Math.sin(t * 0.9) * u + starSeed.jt[i] * 0.4;
      const hl = starSeed.len[i] * 0.5;
      c.moveTo(x - Math.cos(a) * hl, y - Math.sin(a) * hl); c.lineTo(x + Math.cos(a) * hl, y + Math.sin(a) * hl);
    }
    c.stroke();
  }
  if (ringG > 0.02) {
    c.globalAlpha = 0.7 * ringG; c.lineWidth = 0.9; c.beginPath();
    for (let i = 0; i < RING_N; i++) {
      const s = starSeed.ringS[i], a = starSeed.ringA[i];
      const rot = phi + (starSeed.ringK[i] ? Math.PI / 2 : 0);
      const ex = Math.cos(a) * R * s * 0.95, ey = Math.sin(a) * R * s * 0.32;
      const x = cx + ex * Math.cos(rot) - ey * Math.sin(rot), y = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
      const ta = a + Math.PI / 2 + rot; // tangent-ish
      c.moveTo(x - Math.cos(ta) * 3, y - Math.sin(ta) * 3); c.lineTo(x + Math.cos(ta) * 3, y + Math.sin(ta) * 3);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
  const disc = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.24);
  disc.addColorStop(0, "rgba(233,221,203,0.85)"); disc.addColorStop(0.7, "rgba(233,221,203,0.45)"); disc.addColorStop(1, "rgba(233,221,203,0.08)");
  c.fillStyle = disc; c.beginPath(); c.arc(cx, cy, R * 0.24, 0, Math.PI * 2); c.fill();
  c.fillStyle = P.bg;
  for (let i = 0; i < DISC_N; i++) { const rr = starSeed.discR[i] * R * 0.23, a = starSeed.discA[i] + t * 0.2; if (hash(i, Math.floor(t * 6)) > 0.55) c.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.4, 1.4); }

  /* 3. outline histogram */
  c.strokeStyle = P.ink; c.fillStyle = P.ink; c.lineWidth = 1;
  const hx = 24, hw = 372, hb = 316, n = 15, bw = hw / n;
  for (let i = 0; i < n; i++) {
    const hgt = 6 + 28 * Math.pow(noise(i * 0.55 + t * 1.1, 3), 1.2) * (0.55 + 0.45 * Math.sin(i / n * Math.PI));
    c.strokeRect(hx + i * bw + 1.5, hb - hgt, bw - 3, hgt);
  }
  c.beginPath(); c.moveTo(hx, hb + 0.5); c.lineTo(hx + hw, hb + 0.5); c.stroke();

  /* 4. SI// + stepped square wave */
  c.font = `600 11px ${f.mono}`; c.fillText("SI//", 24, 340);
  c.beginPath(); c.moveTo(58, 336.5); c.lineTo(396, 336.5); c.stroke();
  c.globalAlpha = 0.5; dotGrid(c, 26, 350, 396, 424, 12); c.globalAlpha = 1;
  const steps = 9, sw = 372 / steps, off = (t * 8) % sw;
  const stepY = (i: number) => 360 + 52 * hash(Math.floor((i + Math.floor((t * 8) / sw)) % 64), Math.floor(t / 0.4) % 3 + 11);
  c.lineWidth = 1.3; c.save(); c.beginPath(); c.rect(24, 346, 372, 82); c.clip();
  c.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = 24 - off + i * sw, y = stepY(i);
    if (i === 0) c.moveTo(x, y); else { c.lineTo(x, stepY(i - 1)); c.lineTo(x, y); }
    c.lineTo(x + sw, y);
  }
  c.stroke();
  for (let i = 0; i <= steps; i++) c.fillRect(24 - off + i * sw, stepY(i) - 7, sw, 14);
  c.restore();

  /* 5. four rotating code rows */
  c.font = `700 21px ${f.mono}`;
  const rot = Math.floor(t / 0.3);
  for (let r = 0; r < 4; r++) {
    const s = CODES[(r + rot) % 4];
    for (let ch = 0; ch < s.length; ch++) {
      let glyph = s[ch];
      if (glyph !== "." && hash(ch + r * 31, Math.floor(t * 16) + rot) > 0.965) glyph = GLYPHS[Math.floor(hash(ch, r + t * 16) * GLYPHS.length)];
      c.fillText(glyph, 24 + ch * 18.6, 458 + r * 27);
    }
  }

  /* 6. OE// + hopping bricks */
  c.font = `600 11px ${f.mono}`; c.fillText("OE//", 24, 578);
  c.lineWidth = 1; c.beginPath(); c.moveTo(58, 574.5); c.lineTo(396, 574.5); c.stroke();
  c.globalAlpha = 0.5; dotGrid(c, 26, 586, 396, 636, 12); c.globalAlpha = 1;
  const cyc = 612;
  c.beginPath(); c.moveTo(24, cyc + 0.5); c.lineTo(396, cyc + 0.5); c.stroke();
  const step = Math.floor(t / 0.25);
  for (let i = 0; i < 8; i++) {
    const x = 26 + i * 46, up = hash(i, step) > 0.5, off2 = 4 + Math.floor(hash(i + 9, step) * 14);
    const y = up ? cyc - off2 - 18 : cyc + off2;
    c.fillStyle = P.ink; c.fillRect(x, y, 38, 18);
    c.fillStyle = P.dim; for (let b = 3; b < 18; b += 6) c.fillRect(x, y + b, 38, 2);
    c.fillStyle = P.ink;
  }
}

/* ============================== SCENE B ============================== */

const CELL = 12, GX = 28, GY = 22, EX0 = 42, EY0 = 70;
const PX0 = 40, PY0 = 36, PX1 = 380, PY1 = 600;

function hatchCell(c: Ctx, x: number, y: number, kind: number, col: string) {
  const s = CELL - 3;
  c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(x + 1.5, y + 1.5, s, s);
  c.beginPath();
  if (kind === 0) for (let d = 3; d < s * 2; d += 3) { c.moveTo(x + 1.5 + Math.min(d, s), y + 1.5 + Math.max(0, d - s)); c.lineTo(x + 1.5 + Math.max(0, d - s), y + 1.5 + Math.min(d, s)); }
  else if (kind === 1) for (let d = 3; d < s; d += 3) { c.moveTo(x + 1.5 + d, y + 1.5); c.lineTo(x + 1.5 + d, y + 1.5 + s); }
  else for (let d = 3; d < s; d += 3) { c.moveTo(x + 1.5, y + 1.5 + d); c.lineTo(x + 1.5 + s, y + 1.5 + d); }
  c.stroke();
}

/** t = global time, ts = time since this scene became active (seconds, 0..~1.8) */
export function drawSceneB(c: Ctx, t: number, ts: number, f: Fonts) {
  const P = PALETTE.B;
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  c.strokeStyle = P.grid; c.lineWidth = 1; c.beginPath();
  for (let x = 0; x <= W; x += 24) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 24) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
  c.stroke();

  /* scribbles outside the panel, re-rolled 4x per second */
  const r = rng(1000 + Math.floor(t * 4));
  c.strokeStyle = P.dark; c.lineWidth = 1.5; c.beginPath();
  for (let i = 0; i < 170; i++) {
    const x = r() * W, y = r() * H, len = 6 + r() * 26, horiz = r() < 0.5;
    if (x > PX0 - 3 && x < PX1 + 3 && y > PY0 - 3 && y < PY1 + 3) continue;
    c.moveTo(x, y); if (horiz) c.lineTo(x + len, y); else c.lineTo(x, y + len);
  }
  c.stroke();
  c.fillStyle = P.bg; c.fillRect(PX0, PY0, PX1 - PX0, PY1 - PY0);
  c.strokeStyle = P.dark; c.lineWidth = 2; c.strokeRect(PX0, PY0, PX1 - PX0, PY1 - PY0);

  /* segmented progress */
  const fill = Math.floor(24 * (0.2 + 0.8 * clamp(ts / 1.7)));
  for (let i = 0; i < 24; i++) {
    const x = PX0 + 10 + i * 11;
    if (i < fill) { c.fillStyle = P.mid; c.fillRect(x, 48, 9, 8); } else hatchCell(c, x - 1.5, 47, 1, "#8f8776");
  }

  /* eye on a pixel grid */
  const blinkT = ts - 1.5;
  const b = blinkT > 0 && blinkT < 0.3 ? Math.pow(Math.sin((blinkT / 0.3) * Math.PI), 1.5) : 0;
  const ex = 13.5, ey = 11, a = 12.5;
  const ix = ex + 6 * Math.sin((ts / 1.8) * Math.PI * 2 * 0.9 + 0.4), iy = ey + 0.3 * Math.sin(t * 3);
  const sc = Math.round(((1 - Math.abs(2 * ((ts / 1.2) % 1) - 1)) * (GX - 3))) + 1; // scan column sweeps there and back
  for (let gy = 0; gy < GY; gy++) {
    for (let gx = 0; gx < GX; gx++) {
      const x = EX0 + gx * CELL, y = EY0 + gy * CELL;
      const dx = gx - ex, dxn = clamp(Math.abs(dx) / a, 0, 1), lens = 1 - dxn * dxn;
      const edge = gx === 0 || gy === 0 || gx === GX - 1 || gy === GY - 1;
      let kind = 0; // 0 dot, 1 hollow, 2..4 hatch, 5 solid mid, 6 solid dark
      const upperY = ey - 7.2 * lens * (1 - b), lowerY = ey + 4.6 * lens;
      const inEye = Math.abs(dx) < a && gy > upperY && gy < lowerY;
      const lidTop = Math.abs(gy - upperY) < 0.9 && Math.abs(dx) < a;
      const lid2 = Math.abs(gy - (upperY - 2.6 * lens * (1 - b * 0.7))) < 0.85 && Math.abs(dx) < a * 0.95;
      const brow = Math.abs(gy - (3.1 + 0.012 * dx * dx)) < 0.8 && dx > -9 && dx < 13;
      const lowerLid = Math.abs(gy - (lowerY + 0.6)) < 0.55 && Math.abs(dx) < a * 0.92;
      const di = Math.hypot(gx - ix, (gy - iy) * 1.0);
      if (edge) kind = 1;
      else if (lidTop || lid2 || brow) kind = 2 + (gx + gy) % 3;
      else if (lowerLid) kind = 1;
      else if (inEye && di < 2.1) kind = 6;
      else if (inEye && di < 3.3) kind = 5;
      else if (inEye && di < 4.5) kind = 2 + ((gx * 3 + gy) % 3);
      else if (inEye && hash(gx, gy) < 0.1) kind = 1;
      else if (!inEye && !edge && hash(gx + 5, gy) < 0.04) kind = 1;
      const glint = Math.abs(gx - Math.round(ix + 1)) < 1 && Math.abs(gy - Math.round(iy - 1)) < 1 && inEye;
      if (gx === sc && !edge) { c.fillStyle = hash(gx, gy + Math.floor(t * 20)) > 0.9 ? P.mid : P.dark; c.fillRect(x + 1, y, CELL - 2, CELL); continue; }
      if (glint) { c.strokeStyle = P.dark; c.lineWidth = 1; c.strokeRect(x + 2.5, y + 2.5, CELL - 6, CELL - 6); continue; }
      if (kind === 0) { if ((gx + gy) % 2 === 0) { c.fillStyle = P.mid; c.fillRect(x + CELL / 2 - 0.75, y + CELL / 2 - 0.75, 1.5, 1.5); } }
      else if (kind === 1) { c.strokeStyle = P.dark; c.lineWidth = 1; c.strokeRect(x + 3.5, y + 3.5, CELL - 7, CELL - 7); }
      else if (kind === 5) { c.fillStyle = P.mid; c.fillRect(x + 1, y + 1, CELL - 2, CELL - 2); }
      else if (kind === 6) { c.fillStyle = P.dark; c.fillRect(x, y, CELL, CELL); }
      else hatchCell(c, x, y, kind - 2, P.mid);
    }
  }

  /* pulse line */
  c.fillStyle = P.mid; c.globalAlpha = 0.5;
  for (let y = 352; y <= 446; y += 12) for (let x = PX0 + 12; x < PX1 - 6; x += 12) c.fillRect(x, y, 1.5, 1.5);
  c.globalAlpha = 1;
  const cols = 26, cw = (PX1 - PX0 - 24) / cols, head = Math.floor(clamp(ts / 1.5) * cols);
  const blip = [0, -6, -26, 22, -10, 4, 0];
  for (let i = 0; i < Math.min(head + 1, cols); i++) {
    const bi = i - 8, off = bi >= 0 && bi < blip.length ? blip[bi] : 0;
    const x = PX0 + 12 + i * cw, y = 398 + off;
    if (off !== 0) { for (let d = 0; d < 3; d++) { c.fillStyle = P.mid; c.globalAlpha = 0.28; for (let yy = -14; yy < 14; yy += 4) if ((i + d + yy / 4) % 2 === 0) c.fillRect(x + d * 3, 398 + off + yy - 4, 2, 2); } c.globalAlpha = 1; }
    c.fillStyle = i === head ? P.dark : P.mid; c.fillRect(x, y, cw - 1.5, 8);
  }
  c.fillStyle = P.mid; c.globalAlpha = 0.45; c.fillRect(PX0 + 12 + (head + 1) * cw, 401, PX1 - PX0 - 24 - (head + 1) * cw, 1); c.globalAlpha = 1;

  /* equalizer groups */
  const q = Math.floor(t / 0.12);
  for (let g = 0; g < 3; g++) for (let i = 0; i < 7; i++) {
    const x = 52 + g * 108 + i * 13;
    const h = 26 + 62 * Math.pow(hash(g * 7 + i, q), 0.8) * (0.6 + 0.4 * Math.sin((g * 7 + i) * 0.9 + t));
    c.fillStyle = P.mid; c.fillRect(x, 574 - h, 9, h);
    for (let d = 0; d < 6; d += 2) { c.fillRect(x + (d % 4 === 0 ? 0 : 3), 574 - h - 6 + d, 3, 2); c.fillRect(x + 6 - (d % 4 === 0 ? 0 : 3), 574 - h - 6 + d, 3, 2); }
    c.globalAlpha = 0.6; c.fillRect(x + 2, 580, 1.5, 1.5); c.fillRect(x + 6, 584, 1.5, 1.5); c.globalAlpha = 1;
  }
  void f;
}

/** glitch cut: horizontal slice jitter + a one-frame invert. p = 0..1 across the cut. */
export function glitchPass(c: Ctx, canvas: HTMLCanvasElement, p: number, seed: number) {
  const r = rng(seed), bands = 8, bh = canvas.height / bands;
  const amp = Math.sin(p * Math.PI) * 24 * (canvas.width / W);
  for (let i = 0; i < bands; i++) {
    const dx = (r() - 0.5) * 2 * amp;
    if (Math.abs(dx) < 1) continue;
    c.drawImage(canvas, 0, i * bh, canvas.width, bh, dx, i * bh, canvas.width, bh);
  }
  if (p < 0.34) { c.globalCompositeOperation = "difference"; c.fillStyle = "#fff"; c.fillRect(0, 0, canvas.width, canvas.height); c.globalCompositeOperation = "source-over"; }
}
