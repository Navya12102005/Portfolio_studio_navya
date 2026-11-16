import { PROJECTS, PROJECT_ORDER } from "@/data/projects";

/**
 * Draws the texture atlas for the Orb Gallery: every plate is a little
 * piece of "UI" for one of Navya's projects, in the site's own palette.
 * 5 projects x 4 plate designs = 20 tiles. Tile t belongs to project (t % 5).
 */

export const TW = 480;
export const TH = 320; // 3:2, same plate ratio as the reference orb
export const COLS = 5;
export const VARIANTS = 4;
export const ROWS = VARIANTS;
export const TILES = COLS * ROWS;
export const PROJECT_COUNT = PROJECT_ORDER.length;

const INK = "#0A0A0A";
const BONE = "#F2F2EE";
const ORANGE = "#FF5A14";
const CYAN = "#19E3F0";

export type Fonts = { display: string; mono: string };

const SKIN = {
  tech: { solid: CYAN, onSolid: INK, accent: CYAN },
  bio: { solid: BONE, onSolid: INK, accent: ORANGE },
  ops: { solid: ORANGE, onSolid: INK, accent: ORANGE },
} as const;

/** short names that fit on a plate (the full title lives in the modal) */
const PLATE_TITLE: Record<string, string> = {
  "tech-novicord": "NOVICORD",
  "bio-docking": "MOLECULAR DOCKING",
  "bio-biosensor": "LIQUID CRYSTAL BIOSENSORS",
  "ops-mailchimp": "EMAIL AUTOMATION",
  "ops-excel": "KPI & FINANCE DASHBOARDS",
};

type Ctx = CanvasRenderingContext2D;

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** biggest Anton size (<= max) at which the text fits the box */
function fitTitle(ctx: Ctx, f: Fonts, text: string, maxW: number, maxH: number, max: number, min = 26) {
  for (let s = max; s >= min; s -= 2) {
    ctx.font = `${s}px ${f.display}`;
    const lines = wrap(ctx, text, maxW);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (lines.length * s * 1.0 <= maxH && widest <= maxW) return { size: s, lines };
  }
  ctx.font = `${min}px ${f.display}`;
  return { size: min, lines: wrap(ctx, text, maxW) };
}

function ellipsize(ctx: Ctx, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

/* ---------- motifs: one small drawing per project ---------- */

function neural(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  const layers = [3, 5, 4, 2];
  const pts: [number, number][][] = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => [cx - s / 2 + (li / (layers.length - 1)) * s, cy - s * 0.4 + ((i + 0.5) / n) * s * 0.8] as [number, number]),
  );
  ctx.strokeStyle = color; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
  for (let l = 0; l < pts.length - 1; l++) for (const a of pts[l]) for (const b of pts[l + 1]) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = color;
  for (const layer of pts) for (const [x, y] of layer) { ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
  // iris — a nod to the oculomics model
  ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, s * 0.62, 0, Math.PI * 2); ctx.stroke();
}

function molecule(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  const r = s * 0.26;
  const ring = (ox: number, oy: number) => {
    const v: [number, number][] = Array.from({ length: 6 }, (_, i) => [ox + r * Math.cos(Math.PI / 6 + (i * Math.PI) / 3), oy + r * Math.sin(Math.PI / 6 + (i * Math.PI) / 3)]);
    ctx.beginPath(); v.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = color; v.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); });
    return v;
  };
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  const dx = r * Math.sqrt(3);
  ring(cx - dx / 2, cy + r * 0.2); const v2 = ring(cx + dx / 2, cy - r * 0.8);
  // ligand tail docking into the pocket
  ctx.beginPath(); ctx.moveTo(v2[5][0], v2[5][1]); ctx.lineTo(cx + s * 0.55, cy - s * 0.05); ctx.lineTo(cx + s * 0.7, cy + s * 0.25); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + s * 0.7, cy + s * 0.25, 12, 0, Math.PI * 2); ctx.fillStyle = ORANGE === color ? INK : ORANGE; ctx.fill();
}

function rods(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  // liquid-crystal rods: orientation rotates smoothly across the field
  const cols = 9, rows = 5, gx = (s * 1.3) / cols, gy = (s * 0.8) / rows;
  ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineWidth = 7;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = cx - (s * 1.3) / 2 + (i + 0.5) * gx, y = cy - (s * 0.8) / 2 + (j + 0.5) * gy;
    const a = (i / (cols - 1)) * Math.PI * 0.9 + Math.sin(j * 0.9) * 0.35;
    const l = gx * 0.36;
    ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(a));
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function mail(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  const w = s * 0.8, h = s * 0.56, x = cx - w * 0.75, y = cy - h / 2;
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineJoin = "round";
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y + h * 0.58); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.fillStyle = color;
  [-0.3, 0, 0.3].forEach((o, i) => {
    const ay = cy + o * s * 0.6, ax = x + w + 28 + i * 10;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + s * 0.3, ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax + s * 0.3 + 12, ay); ctx.lineTo(ax + s * 0.3, ay - 8); ctx.lineTo(ax + s * 0.3, ay + 8); ctx.closePath(); ctx.fill();
  });
}

function bars(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  const hs = [0.3, 0.5, 0.42, 0.72, 0.95], bw = s * 0.18, gap = s * 0.07;
  const total = hs.length * bw + (hs.length - 1) * gap, x0 = cx - total / 2, base = cy + s * 0.45;
  ctx.fillStyle = color;
  const tops: [number, number][] = [];
  hs.forEach((h, i) => { const x = x0 + i * (bw + gap), hh = h * s * 0.9; ctx.fillRect(x, base - hh, bw, hh); tops.push([x + bw / 2, base - hh - 16]); });
  ctx.strokeStyle = BONE; ctx.lineWidth = 4; ctx.beginPath(); tops.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.fillStyle = BONE; tops.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); });
}

const MOTIF: Record<string, (c: Ctx, cx: number, cy: number, s: number, color: string) => void> = {
  "tech-novicord": neural,
  "bio-docking": molecule,
  "bio-biosensor": rods,
  "ops-mailchimp": mail,
  "ops-excel": bars,
};

/* ---------- the four plate designs ---------- */

function drawPlate(ctx: Ctx, f: Fonts, x: number, y: number, p: number, v: number) {
  const id = PROJECT_ORDER[p];
  const spec = PROJECTS[id];
  const skin = SKIN[spec.domain];
  const title = PLATE_TITLE[id] ?? spec.title.toUpperCase();
  const code = `${spec.domain.toUpperCase()} // 0${p + 1}`;
  const m = 44;
  const W = TW, H = TH;

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, W, H); ctx.clip();
  ctx.translate(x, y);
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";

  if (v === 0) {
    // hard colour block with the big title
    ctx.fillStyle = skin.solid; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = skin.onSolid; ctx.font = `600 20px ${f.mono}`; ctx.fillText(code, m, m + 12);
    ctx.font = `${44}px ${f.display}`; ctx.textAlign = "right"; ctx.fillText("▸", W - m, m + 16); ctx.textAlign = "left";
    const { size, lines } = fitTitle(ctx, f, title, W - m * 2, H * 0.58, 78, 34);
    ctx.font = `${size}px ${f.display}`;
    lines.forEach((l, i) => ctx.fillText(l, m, H - m - (lines.length - 1 - i) * size * 1.02));
  } else if (v === 1) {
    // dark plate with the project's motif
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = skin.accent; ctx.globalAlpha = 0.25; ctx.lineWidth = 2; ctx.strokeRect(14, 14, W - 28, H - 28); ctx.globalAlpha = 1;
    MOTIF[id](ctx, W / 2, H * 0.44, 150, skin.accent);
    ctx.fillStyle = BONE; ctx.font = `600 18px ${f.mono}`; ctx.fillText(code, m, m - 6);
    ctx.font = `600 18px ${f.mono}`; ctx.fillStyle = skin.accent; ctx.fillText(ellipsize(ctx, title, W - m * 2), m, H - m + 8);
  } else if (v === 2) {
    // bone "spec sheet" with the project's real metrics
    ctx.fillStyle = BONE; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = skin.accent === CYAN ? INK : skin.accent; ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = INK; ctx.font = `600 17px ${f.mono}`; ctx.fillText(code, m, m + 10);
    const t = fitTitle(ctx, f, title, W - m * 2, 76, 40, 26);
    ctx.font = `${t.size}px ${f.display}`;
    t.lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, m, m + 46 + i * t.size));
    const top = m + 46 + Math.min(2, t.lines.length) * t.size + 10;
    spec.metrics.slice(0, 3).forEach((mt, i) => {
      const yy = top + i * 36;
      ctx.fillStyle = "#0A0A0A33"; ctx.fillRect(m, yy - 22, W - m * 2, 2);
      ctx.fillStyle = "#4a4f52"; ctx.font = `500 14px ${f.mono}`; ctx.fillText(mt.label.toUpperCase(), m, yy + 2);
      ctx.fillStyle = INK; ctx.font = `700 15px ${f.mono}`; ctx.textAlign = "right";
      ctx.fillText(ellipsize(ctx, mt.value, W * 0.5), W - m, yy + 2); ctx.textAlign = "left";
    });
  } else {
    // dark "pipeline" plate with the first build steps
    ctx.fillStyle = "#121212"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = skin.accent; ctx.fillRect(0, 0, 10, H);
    ctx.font = `600 16px ${f.mono}`; ctx.fillText("BUILD LOG", m, m + 6);
    ctx.fillStyle = "#9aa6a8"; ctx.textAlign = "right"; ctx.fillText(code, W - m, m + 6); ctx.textAlign = "left";
    spec.architecture.slice(0, 3).forEach((a, i) => {
      const yy = m + 52 + i * 40;
      ctx.fillStyle = skin.accent; ctx.font = `700 16px ${f.mono}`; ctx.fillText(`0${i + 1}`, m, yy);
      ctx.fillStyle = BONE; ctx.font = `500 16px ${f.mono}`; ctx.fillText(ellipsize(ctx, a, W - m * 2 - 40), m + 40, yy);
      ctx.fillStyle = "#ffffff22"; ctx.fillRect(m, yy + 12, W - m * 2, 1);
    });
    ctx.fillStyle = skin.accent; ctx.font = `30px ${f.display}`; ctx.fillText(ellipsize(ctx, title, W - m * 2), m, H - m + 6);
  }
  ctx.restore();
}

export function buildAtlas(f: Fonts): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TW * COLS; c.height = TH * ROWS;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = INK; ctx.fillRect(0, 0, c.width, c.height);
  for (let t = 0; t < TILES; t++) {
    // tile t -> project (t % COLS), design floor(t / COLS)
    drawPlate(ctx, f, (t % COLS) * TW, Math.floor(t / COLS) * TH, t % PROJECT_COUNT, Math.floor(t / COLS));
  }
  return c;
}

export const projectOfTile = (tile: number) => PROJECT_ORDER[tile % PROJECT_COUNT];
