/**
 * One tiny looping animation that fuses the two reference scenes on a 240x240 logical canvas:
 * the maroon hatched star (CORE STABILITY) pixelates into the tan pixel-grid eye, then back again.
 * Pure function of time, so it is deterministic and easy to test.
 */
export const S = 240;
export const PERIOD = 4.4;      // seconds per full loop
export const HOLD = 1.8;        // seconds each scene is shown
export const SWAP = 0.4;        // seconds each pixelate transition takes
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
  const blinkT = ts - 1.35, b = blinkT > 0 && blinkT < 0.3 ? Math.pow(Math.sin((blinkT / 0.3) * Math.PI), 1.5) : 0;
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
    const di = Math.hypot(gx - ix, gy - iy);
    if (gx === sc && gy > 2 && gy < GY - 2) { c.fillStyle = DARK; c.fillRect(x + 0.5, y, CELL - 1, CELL); continue; }
    if (lid || lid2) hatch(c, x, y, (gx + gy) % 3);
    else if (lower) { c.strokeStyle = DARK; c.lineWidth = 0.8; c.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); }
    else if (inEye && di < 1.9) { c.fillStyle = DARK; c.fillRect(x, y, CELL, CELL); }
    else if (inEye && di < 3) { c.fillStyle = MID; c.fillRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1); }
    else if (inEye && di < 4.2) hatch(c, x, y, (gx * 3 + gy) % 3);
  }
  // pulse line
  const cols = 24, cw = (S - 44) / cols, head = Math.floor(clamp(ts / 1.5) * cols), blip = [0, -4, -16, 14, -6, 2, 0];
  for (let i = 0; i <= Math.min(head, cols - 1); i++) {
    const bi = i - 8, off = bi >= 0 && bi < blip.length ? blip[bi] : 0;
    c.fillStyle = i === head ? DARK : MID; c.fillRect(22 + i * cw, 204 + off, cw - 1, 5);
  }
  void t;
}

/** Draws one frame of the loop into `c` (already scaled to the 240 logical px) using scratch canvases for the pixelate cut. */
export function drawLoop(c: Ctx, scratch: HTMLCanvasElement, t: number, f: Fonts, pixel: boolean) {
  const p = t % PERIOD;
  const showEye = p >= HOLD + SWAP / 2 && p < PERIOD - SWAP / 2;
  const ts = showEye ? p - (HOLD + SWAP / 2) : 0;
  const cut = p > HOLD - SWAP / 2 && p < HOLD + SWAP / 2 ? (p - (HOLD - SWAP / 2)) / SWAP
    : p > PERIOD - SWAP / 2 ? (p - (PERIOD - SWAP / 2)) / SWAP
    : p < SWAP / 2 ? (p + SWAP / 2) / SWAP : -1;
  if (showEye) drawEye(c, t, ts); else drawStar(c, t, f);
  if (!pixel || cut < 0) return;
  // pixelate: block size swells to a peak at the middle of the cut, then relaxes
  const block = 1 + 20 * Math.sin(cut * Math.PI);
  if (block < 2) return;
  const cw = c.canvas.width, ch = c.canvas.height;
  const w = Math.max(2, Math.round(cw / (block * (cw / S)))), h = Math.max(2, Math.round(ch / (block * (ch / S))));
  scratch.width = w; scratch.height = h;
  const sc = scratch.getContext("2d")!;
  sc.imageSmoothingEnabled = true; sc.drawImage(c.canvas, 0, 0, cw, ch, 0, 0, w, h);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  c.drawImage(scratch, 0, 0, w, h, 0, 0, cw, ch); c.restore();
}
