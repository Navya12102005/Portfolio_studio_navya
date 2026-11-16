/**
 * One tiny looping animation that fuses the two reference scenes on a 240x240 logical canvas:
 * the maroon hatched star (CORE STABILITY) pixelates into the tan pixel-grid eye, then back again.
 * Pure function of time, so it is deterministic and easy to test.
 */
export const S = 240;
export const HOLD = 1.6;        // seconds each state holds
export const DISS = 0.6;        // seconds each cell-by-cell dissolve to the next state takes
export const STEP = HOLD + DISS;
export const STATES = 4;        // star -> eye -> pulse -> code -> star ...
export const PERIOD = STEP * STATES;
export const BG = { star: "#251212", eye: "#BAB19F" };
const INK = "#E9DDCB", MID = "#534C43", DARK = "#1C1A17";

type Ctx = CanvasRenderingContext2D;
export type Fonts = { mono: string };

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

const hashX = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const N = 1100;
const seed = (() => {
  const r = rng(7);
  const f = (fn: () => number) => Float32Array.from({ length: N }, fn);
  return { th: f(() => r() * Math.PI * 2), u: f(() => Math.sqrt(r())), len: f(() => 4 + r() * 6), al: f(r), jt: f(() => r() - 0.5) };
})();

/* ---------- the star ---------- */
function drawStar(c: Ctx, t: number, f: Fonts) {
  c.fillStyle = BG.star; c.fillRect(0, 0, S, S);
  c.strokeStyle = INK; c.fillStyle = INK; c.lineWidth = 1.2; c.lineCap = "round";
  // corner brackets
  const b = 12, l = 22, r = 6;
  for (const [x, y, sx, sy] of [[b, b, 1, 1], [S - b, b, -1, 1], [b, S - b, 1, -1], [S - b, S - b, -1, -1]] as const) {
    c.beginPath(); c.moveTo(x + sx * l, y); c.lineTo(x + sx * r, y); c.quadraticCurveTo(x, y, x, y + sy * r); c.lineTo(x, y + sy * l); c.stroke();
  }
  c.font = `600 7.5px ${f.mono}`; c.textBaseline = "alphabetic";
  c.fillText("CORE", b + 9, b + 17); c.fillText("STABILITY", b + 9, b + 26);

  const cx = S / 2, cy = S / 2 + 2, R = 80;
  const tri = 1 - Math.abs(2 * ((t / 5) % 1) - 1);
  const k = 3 - 2.2 * smooth(tri / 0.5), m = smooth((tri - 0.5) / 0.5), phi = t * 0.4;
  const profile = (th: number) => {
    const star = 0.25 + 0.75 * Math.pow(Math.abs(Math.cos(2 * (th - phi))), k);
    const a = Math.abs(Math.cos(th - phi)), bb = Math.abs(Math.sin(th - phi));
    const sq = 0.86 / Math.pow(Math.pow(a, 4) + Math.pow(bb, 4), 0.25);
    return star * (1 - m) + Math.min(sq, 1.05) * 0.86 * m;
  };
  for (let bucket = 0; bucket < 3; bucket++) {
    c.globalAlpha = [0.4, 0.65, 0.92][bucket]; c.lineWidth = 0.8; c.beginPath();
    for (let i = 0; i < N; i++) {
      if (Math.min(2, Math.floor(seed.al[i] * 3)) !== bucket || seed.u[i] < 0.22) continue;
      const th = seed.th[i], rad = seed.u[i] * R * profile(th);
      const x = cx + Math.cos(th) * rad, y = cy + Math.sin(th) * rad;
      const a = th + 1.25 + 0.6 * Math.sin(t * 0.9) * seed.u[i] + seed.jt[i] * 0.4, hl = seed.len[i] * 0.5;
      c.moveTo(x - Math.cos(a) * hl, y - Math.sin(a) * hl); c.lineTo(x + Math.cos(a) * hl, y + Math.sin(a) * hl);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
  // breathing ring + orbiting dots, so the star never feels static
  c.strokeStyle = INK; c.lineWidth = 0.7; c.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2.2);
  c.beginPath(); c.arc(cx, cy, R * (1.04 + 0.04 * Math.sin(t * 1.6)), 0, Math.PI * 2); c.stroke();
  c.globalAlpha = 0.9; c.fillStyle = INK;
  for (let i = 0; i < 3; i++) { const a = t * 1.1 + (i * Math.PI * 2) / 3; c.beginPath(); c.arc(cx + Math.cos(a) * R * 1.04, cy + Math.sin(a) * R * 1.04, 1.8, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.25);
  g.addColorStop(0, "rgba(233,221,203,0.9)"); g.addColorStop(0.7, "rgba(233,221,203,0.45)"); g.addColorStop(1, "rgba(233,221,203,0.05)");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R * 0.25, 0, Math.PI * 2); c.fill();
}

/* ---------- the eye ---------- */
const CELL = 7, GX = 28, GY = 20;
function hatch(c: Ctx, x: number, y: number, kind: number) {
  const s = CELL - 1.5;
  c.strokeStyle = MID; c.lineWidth = 0.8; c.strokeRect(x + 0.75, y + 0.75, s, s); c.beginPath();
  for (let d = 2; d < s; d += 2) {
    if (kind === 0) { c.moveTo(x + 0.75 + d, y + 0.75); c.lineTo(x + 0.75, y + 0.75 + d); }
    else if (kind === 1) { c.moveTo(x + 0.75 + d, y + 0.75); c.lineTo(x + 0.75 + d, y + 0.75 + s); }
    else { c.moveTo(x + 0.75, y + 0.75 + d); c.lineTo(x + 0.75 + s, y + 0.75 + d); }
  }
  c.stroke();
}
function drawEye(c: Ctx, t: number, ts: number) {
  c.fillStyle = BG.eye; c.fillRect(0, 0, S, S);
  const x0 = (S - GX * CELL) / 2, y0 = 40;
  const blinkT = ts - 0.8, b = blinkT > 0 && blinkT < 0.3 ? Math.pow(Math.sin((blinkT / 0.3) * Math.PI), 1.5) : 0;
  const ex = 13.5, ey = 9, a = 12.5;
  const ix = ex + 5 * Math.sin((ts / HOLD) * Math.PI * 2 * 0.9 + 0.4), iy = ey;
  const sc = Math.round((1 - Math.abs(2 * ((ts / 1.2) % 1) - 1)) * (GX - 3)) + 1;
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
    const x = x0 + gx * CELL, y = y0 + gy * CELL, dx = gx - ex, lens = 1 - Math.pow(clamp(Math.abs(dx) / a), 2);
    const upperY = ey - 6.2 * lens * (1 - b), lowerY = ey + 4.2 * lens;
    const inEye = Math.abs(dx) < a && gy > upperY && gy < lowerY;
    const lid = Math.abs(gy - upperY) < 0.9 && Math.abs(dx) < a;
    const lid2 = Math.abs(gy - (upperY - 2.4 * lens * (1 - b * 0.7))) < 0.85 && Math.abs(dx) < a * 0.95;
    const lower = Math.abs(gy - (lowerY + 0.6)) < 0.55 && Math.abs(dx) < a * 0.9;
    const di = Math.hypot(gx - ix, gy - iy), pup = 1.9 + 0.45 * Math.sin(ts * 3.1);
    if (gx === sc && gy > 2 && gy < GY - 2) { c.fillStyle = DARK; c.fillRect(x + 0.5, y, CELL - 1, CELL); continue; }
    if (lid || lid2) hatch(c, x, y, (gx + gy) % 3);
    else if (lower) { c.strokeStyle = DARK; c.lineWidth = 0.8; c.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); }
    else if (inEye && di < pup) { c.fillStyle = DARK; c.fillRect(x, y, CELL, CELL); if (gx === Math.round(ix - 1) && gy === Math.round(iy - 1)) { c.fillStyle = BG.eye; c.fillRect(x + 2, y + 2, 3, 3); } }
    else if (inEye && di < 3) { c.fillStyle = MID; c.fillRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1); }
    else if (inEye && di < 4.2) hatch(c, x, y, (gx * 3 + gy) % 3);
  }
  // pulse line
  const cols = 24, cw = (S - 44) / cols, head = Math.floor(clamp(ts / 1.0) * cols), blip = [0, -4, -16, 14, -6, 2, 0];
  for (let i = 0; i <= Math.min(head, cols - 1); i++) {
    const bi = i - 8, off = bi >= 0 && bi < blip.length ? blip[bi] : 0;
    c.fillStyle = i === head ? DARK : MID; c.fillRect(22 + i * cw, 204 + off, cw - 1, 5);
  }
  void t;
}

/* ---------- pulse trace + equalizer ---------- */
function drawPulse(c: Ctx, t: number, ts: number) {
  c.fillStyle = "#0A0A0A"; c.fillRect(0, 0, S, S);
  c.strokeStyle = "#2a2a2a"; c.lineWidth = 1; c.beginPath();
  for (let x = 0; x <= S; x += 20) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, S); }
  for (let y = 0; y <= S; y += 20) { c.moveTo(0, y + 0.5); c.lineTo(S, y + 0.5); }
  c.stroke();
  const head = clamp(ts / 0.9 + 0.05) * S;
  c.strokeStyle = "#FF5A14"; c.lineWidth = 2.2; c.lineJoin = "round"; c.shadowColor = "#FF5A14"; c.shadowBlur = 8; c.beginPath();
  for (let x = 0; x <= head; x += 2) {
    const ph = ((x + t * 60) % 120) / 120;
    const beat = ph < 0.1 ? 0 : ph < 0.16 ? -(ph - 0.1) * 900 : ph < 0.22 ? -54 + (ph - 0.16) * 2400 : ph < 0.28 ? 90 - (ph - 0.22) * 1500 : 0;
    const y = 92 + beat * 0.8 + Math.sin(x * 0.2 + t * 4) * 1.5;
    if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();
  c.fillStyle = "#FF5A14"; c.beginPath(); c.arc(Math.min(head, S - 2), 92, 3.5, 0, Math.PI * 2); c.fill();
  c.shadowBlur = 0;
  const q = Math.floor(t * 9);
  for (let i = 0; i < 20; i++) {
    const h = 6 + 52 * Math.pow(hashX(i, q), 0.8) * (0.5 + 0.5 * Math.sin(i * 0.7 + t * 3));
    c.fillStyle = i % 5 === 0 ? "#19E3F0" : "#FF5A14"; c.fillRect(14 + i * 11, 214 - h, 7, h);
  }
}

/* ---------- scrolling code ---------- */
const GLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function drawCode(c: Ctx, t: number, f: Fonts) {
  c.fillStyle = BG.star; c.fillRect(0, 0, S, S);
  c.font = `700 14px ${f.mono}`; c.textBaseline = "alphabetic"; c.fillStyle = INK;
  const rows = 11, off = (t * 26) % 20;
  for (let r = -1; r < rows; r++) {
    const row = r + Math.floor((t * 26) / 20);
    let line = "";
    for (let k = 0; k < 15; k++) line += k % 4 === 3 ? "." : GLY[Math.floor(hashX(k + row * 7, Math.floor(t * 5 + row)) * GLY.length)];
    const yy = 22 + r * 20 - off + 20, hot = Math.abs(yy - 120) < 10;
    c.globalAlpha = hot ? 1 : 0.35 + 0.65 * hashX(row, 3);
    c.fillStyle = hot ? "#FF9A66" : INK;
    c.fillText(line, 14, yy);
  }
  c.globalAlpha = 1;
  const col = Math.floor(t * 12) % 15;
  c.fillStyle = "#FF5A14"; c.fillRect(14 + col * 14, 110, 9, 16);
}

function drawState(c: Ctx, i: number, t: number, ts: number, f: Fonts) {
  if (i === 0) drawStar(c, t, f);
  else if (i === 1) drawEye(c, t, ts);
  else if (i === 2) drawPulse(c, t, ts);
  else drawCode(c, t, f);
}

/**
 * One frame of the "living machine": the current state is drawn, and while a dissolve is running the next state is
 * drawn offscreen and revealed cell by cell (a diagonal wave with per-cell noise), so there is never a hard cut.
 * A thin scan line sweeps the whole box the entire time.
 */
export function drawLoop(c: Ctx, off: HTMLCanvasElement, t: number, f: Fonts, animate: boolean) {
  const p = t % PERIOD, idx = Math.floor(p / STEP), local = p - idx * STEP;
  const ts = local;
  drawState(c, idx, t, ts, f);
  const prog = animate && local > HOLD ? (local - HOLD) / DISS : -1;
  if (prog >= 0) {
    const next = (idx + 1) % STATES, octx = off.getContext("2d")!;
    const k = off.width / S;
    octx.setTransform(k, 0, 0, k, 0, 0);
    drawState(octx, next, t, 0, f);
    const cells = 20, cs = S / cells;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    for (let cy = 0; cy < cells; cy++) for (let cx = 0; cx < cells; cx++) {
      const th = (cx + cy) / (2 * cells) * 0.55 + hashX(cx, cy) * 0.45;
      const d = prog * 1.02 - th;
      if (d > 0) c.drawImage(off, cx * cs * k, cy * cs * k, cs * k, cs * k, cx * cs * k, cy * cs * k, cs * k, cs * k);
      if (d > -0.05 && d < 0.07) { c.strokeStyle = "rgba(255,90,20,0.9)"; c.lineWidth = Math.max(1, k * 0.8); c.strokeRect(cx * cs * k + 0.5, cy * cs * k + 0.5, cs * k - 1, cs * k - 1); }
    }
    c.restore();
  }
  if (animate) {
    const v = c.createRadialGradient(S / 2, S / 2, S * 0.45, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.38)");
    c.fillStyle = v; c.fillRect(0, 0, S, S);
    c.fillStyle = `rgba(255,255,255,${0.012 + 0.02 * hashX(Math.floor(t * 24), 1)})`; c.fillRect(0, 0, S, S);
    const y = ((t * 0.9) % 1) * S;
    c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(0, y, S, 2);
  }
}
