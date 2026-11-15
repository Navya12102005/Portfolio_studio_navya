/* scenes3.js — S10–S14 + loop wipe. Pure (g, W, H, u, T) like the rest. */
(function () {
  const U = window.U, E = U.easeOutExpo, RAD = Math.PI / 180;
  const MONO = 'ui-monospace, "JetBrains Mono", monospace', ANTON = '"Anton", Impact, sans-serif', SLAB = '"Archivo Black", "Arial Black", sans-serif';
  const hud = (g, T, text, x, y, alpha = 0.7, color) => { g.save(); g.font = `11px ${MONO}`; g.fillStyle = color || T.C.pal.bone; g.globalAlpha = alpha; g.textBaseline = "top"; g.fillText(text, x, y); g.restore(); };
  const word = (g, T, str, font, color, cx, baseY, height, opts) => {
    const b = U.textBitmap(str, font, 120, color, T.res * 2, opts), k = height / 120;
    g.drawImage(b.c, cx - (b.w * k) / 2, baseY - 120 * k, b.w * k, b.h * k); return b.w * k;
  };
  const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };

  /* S10 · MONOGRAM TILE → TILE GRID */
  function s10(g, W, H, u, T) {
    const P = T.C.pal, cx = W / 2, cy = H / 2; g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(242,242,238,0.12)"; for (let x = 40; x < W; x += 80) g.fillRect(x, 0, 1, H);
    if (u < 1.5) {
      const p = U.easeOutBack(U.clamp(u / 0.5)), ex = U.clamp((u - 1.2) / 0.3);
      if (ex < 1) {
        g.save(); g.translate(cx, cy); g.scale(p * (1 - ex * 0.3), p * (1 - ex * 0.3)); g.globalAlpha = 1 - ex;
        g.fillStyle = P.lime; g.fillRect(-100, -100, 200, 200);
        word(g, T, T.C.words.monogram, SLAB, P.ink, 0, 40, 112);
        g.beginPath(); g.arc(0, -125, 52, Math.PI, 0); g.fill(); g.beginPath(); g.arc(0, 125, 52, 0, Math.PI); g.fill(); g.restore();
        if (u < 1.2) { hud(g, T, "NG // MONOGRAM TILE", cx - 68, cy + 192, 0.8, P.lime); return; }
      }
    }
    const cols = 8, rows = 3, cw = W / cols, ch = H / rows, v = U.clamp((u - 1.2) / 0.35), tick = Math.floor(u / 0.08), letters = "NGAIBM";
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c, h = U.rnd(idx * 7.13 + tick * 1.31), kind = Math.floor(h * 5);
      const ex = E(v), x = U.lerp(cx - cw / 2, c * cw, ex), y = U.lerp(cy - ch / 2, r * ch, ex);
      g.save(); g.beginPath(); g.rect(x + 2, y + 2, cw - 4, ch - 4); g.clip();
      if (kind === 0) { g.fillStyle = P.lime; g.fillRect(x, y, cw, ch); }
      else if (kind === 1) { g.fillStyle = P.bone; g.fillRect(x, y, cw, ch); }
      else if (kind === 2) { g.fillStyle = "#0e0e0e"; g.fillRect(x, y, cw, ch); g.fillStyle = P.lime; for (let s = 0; s < cw; s += 14) g.fillRect(x + s + ((u * 60) % 14), y, 4, ch); }
      else if (kind === 3) { g.fillStyle = P.lime; g.fillRect(x, y, cw, ch); word(g, T, letters[Math.floor(U.rnd(idx + tick) * 6)], SLAB, P.ink, x + cw / 2, y + ch * 0.78, ch * 0.62); }
      else { g.fillStyle = P.bone; g.fillRect(x, y, cw, ch); g.fillStyle = P.ink; let bx = x + ((u * 90) % 30) - 30; for (let i = 0; bx < x + cw; i++) { const w = 1 + Math.floor(U.rnd(idx * 3 + i) * 5); g.fillRect(bx, y + 12, w, ch - 24); bx += w + 2 + Math.floor(U.rnd(i + idx) * 3); } }
      g.restore();
    }
    hud(g, T, "SEQ 10 / 14  ·  GRID 8×3", 28, 20, 0.9, P.ink);
    T.glitch = u < 1.5 ? 0.4 : 0;
  }

  /* S11 · HOLOGRAM SPIRAL → ITALIC TITLE */
  function s11(g, W, H, u, T, dur) {
    const P = T.C.pal, cx = W / 2, cy = H / 2; g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const holo = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); [[0, "#00E5FF"], [0.35, "#7A3CFF"], [0.7, "#B6FF00"], [1, "#FF2E93"]].forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
    if (u < 1.5) {
      for (let i = 8; i >= 0; i--) {
        const R = 70 + i * 88, dir = i % 2 ? 1 : -1;
        g.save(); g.translate(cx, cy); g.scale(1, 0.4 + i * 0.012); g.globalAlpha = 0.35 + 0.65 * (1 - i / 9);
        U.circText(g, "MEDTECH · AI · MEDTECH · AI · MEDTECH · AI · MEDTECH · AI · ".slice(0, Math.max(14, Math.floor((2 * Math.PI * R) / (16 + i * 2.2)))), 0, 0, R, dir * (u * 0.9 + i * 0.7), ANTON, 22 + i * 3, holo(-R, R));
        g.restore();
      }
      hud(g, T, "SEQ 11 / 14  ·  SPIRAL", 28, 20); T.glitch = 0.3; return;
    }
    const v = u - 1.5, size = 190, txt = "BIOMEDICAL × AI", jolt = u > T.dur - 0.1;
    const b = U.textBitmap(txt, SLAB, size, "#C6F600", T.res), sc = Math.min(1, 1700 / b.w);
    const draw = (col, yy, alpha) => {
      g.save(); g.globalAlpha = alpha; g.translate(cx, yy); g.transform(1, 0, -0.21, 1, 0, 0); g.scale(sc, 1);
      g.font = `${size}px ${SLAB}`; g.textBaseline = "alphabetic"; g.fillStyle = col; g.textAlign = "center"; g.fillText(txt, 0, 0); g.restore();
    };
    const hl = (U.fract(v * 0.6) * 2 - 0.5) * W, gr = g.createLinearGradient(hl - 380, 0, hl + 380, 0);
    gr.addColorStop(0, "#9fd100"); gr.addColorStop(0.5, "#F6FFB8"); gr.addColorStop(1, "#9fd100");
    const slide = E(U.clamp(v / 0.45)) , oy = (1 - slide) * 80;
    const run = (off) => { draw("#1d2400", 330 - 120 + oy, 0.7); draw("#1d2400", 330 + 120 + oy, 0.7); draw(gr, 330 + oy, 1); };
    if (jolt) { U.sliceDraw(g, W, H, 6, () => run(), (i) => (U.rnd(i * 3.7 + Math.floor(u * 30)) - 0.5) * 60); T.glitch = 1; } else run();
    hud(g, T, "SEQ 11 / 14  ·  BIOMEDICAL × AI", 28, 20); T.glitch = jolt ? 1 : 0.1;
  }

  /* S12 · WARPED WORDS */
  function s12(g, W, H, u, T) {
    const P = T.C.pal; g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const rows = [["PROJECTS · RESEARCH · STORIES · NETWORK · ", P.bone], ["NETWORK · STORIES · RESEARCH · PROJECTS · ", "#FF2E52"], ["PROJECTS · RESEARCH · STORIES · NETWORK · ", P.bone], ["NETWORK · STORIES · RESEARCH · PROJECTS · ", "#FF2E52"]];
    rows.forEach(([str, col], r) => {
      const b = U.textBitmap(str.repeat(3), ANTON, 132, col, T.res), unit = b.w / 3, dir = r % 2 ? 1 : -1, scroll = (u * 260 * dir) % unit, rowY = 14 + r * 104;
      for (let x = 0; x < W; x += 2) {
        const dy = Math.sin((x + u * 420 * dir) / 600 * Math.PI * 2) * 40, sc = 1 + 0.25 * Math.sin((x + u * 300) / 420 + r);
        const sx = (((x - scroll + unit * 4) % unit) + unit) * T.res;
        g.drawImage(b.c, sx % (b.c.width - 3 * T.res * 2), 0, 2 * T.res, b.c.height, x, rowY + dy - 60 * (sc - 1) * 0.5, 2.05, 132 * 1.35 * 0.78 * sc);
      }
    });
    hud(g, T, `SEQ 12 / 14  ·  WARP A=40 λ=600`, 28, 20, 0.8);
    T.glitch = u < 0.2 ? 0.8 : 0;
  }

  /* S13 · CUBE HUD */
  function s13(g, W, H, u, T) {
    const P = T.C.pal, cx = W / 2, cy = H / 2 + 6; g.fillStyle = "#0c0d0e"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(242,242,238,0.07)"; g.lineWidth = 1; for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // wiping bars
    const wp = E(U.clamp(u / 0.8)); g.fillStyle = "#E8431C"; g.fillRect(0, 150, 430 * wp, 50); g.fillRect(W - 430 * wp, 236, 430 * wp, 50); g.fillStyle = "#8f2a10"; g.fillRect(0, 205, 300 * wp, 14); g.fillRect(W - 300 * wp, 292, 300 * wp, 14);
    // marquees
    [[2, 1], [H - 34, -1]].forEach(([y, dir]) => { g.fillStyle = "rgba(242,242,238,0.08)"; g.fillRect(0, y, W, 32); const b = U.textBitmap("NAVYA //// GUPTA //// ".repeat(8), ANTON, 28, P.bone, T.res), un = b.w / 8; g.save(); g.beginPath(); g.rect(0, y, W, 32); g.clip(); g.drawImage(b.c, ((u * 140 * dir) % un) - un, y - 1, b.w, b.h); g.restore(); });
    // hexagon + corner brackets
    g.strokeStyle = P.bone; g.lineWidth = 2; g.globalAlpha = 0.8; poly(g, Array.from({ length: 6 }, (_, k) => [cx + Math.cos(k * 60 * RAD + 30 * RAD) * 190, cy + Math.sin(k * 60 * RAD + 30 * RAD) * 190])); g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = P.orange; g.lineWidth = 3;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.moveTo(cx + sx * 250, cy + sy * 150); g.lineTo(cx + sx * 250, cy + sy * 190); g.lineTo(cx + sx * 210, cy + sy * 190); g.stroke(); });
    // isometric cube
    const s = 118 * U.easeOutBack(U.clamp(u / 0.6)), rot = Math.sin(u * 1.2) * 0.12, X = (a) => cx + Math.cos(a + rot) * s, top = [[cx, cy - s * 1.05], [cx + s, cy - s * 0.52], [cx, cy], [cx - s, cy - s * 0.52]];
    const left = [[cx - s, cy - s * 0.52], [cx, cy], [cx, cy + s * 1.05], [cx - s, cy + s * 0.52]], right = [[cx + s, cy - s * 0.52], [cx, cy], [cx, cy + s * 1.05], [cx + s, cy + s * 0.52]];
    [[top, "#FF7A3C"], [left, P.orange], [right, "#C93E08"]].forEach(([pts, col]) => { poly(g, pts); g.fillStyle = col; g.fill(); g.strokeStyle = P.ink; g.lineWidth = 2; g.stroke(); });
    g.save(); g.fillStyle = P.ink; g.translate(cx - s * 0.5, cy + s * 0.3); g.transform(1, 0.52, 0, 1, 0, 0); g.font = `${s * 0.62}px ${SLAB}`; g.textAlign = "center"; g.fillText("N", 0, 0); g.restore();
    g.save(); g.fillStyle = P.ink; g.translate(cx + s * 0.5, cy + s * 0.3); g.transform(1, -0.52, 0, 1, 0, 0); g.font = `${s * 0.62}px ${SLAB}`; g.textAlign = "center"; g.fillText("G", 0, 0); g.restore();
    // radar sweep
    g.save(); g.translate(W - 120, cy); g.strokeStyle = P.lime; g.lineWidth = 1.2; g.globalAlpha = 0.9; [20, 38, 56].forEach((r) => { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); });
    const a = u * 3.4, rg = g.createConicGradient ? g.createConicGradient(a, 0, 0) : null; if (rg) { rg.addColorStop(0, "rgba(198,246,0,0.55)"); rg.addColorStop(0.2, "rgba(198,246,0,0)"); rg.addColorStop(1, "rgba(198,246,0,0)"); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 56, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 56, Math.sin(a) * 56); g.stroke(); g.restore();
    const tc = (t) => `00:${String(Math.floor(t)).padStart(2, "0")}:${String(Math.floor(U.fract(t) * 30)).padStart(2, "0")}`;
    hud(g, T, `TC ${tc(37.4 + u)}`, 30, 46); hud(g, T, "NG-13 // ISO", W - 150, 46); hud(g, T, `SEQ 13 / 14`, 30, H - 54); hud(g, T, `${(u * 30).toFixed(0)} FPS-CNT`, W - 150, H - 54);
  }

  /* S14 · FINAL UI CARD */
  function s14(g, W, H, u, T) {
    const P = T.C.pal; g.fillStyle = "#cfd0cc"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#c2c3bf"; for (let y = 0; y < H; y += 24) for (let x = ((y / 24) % 2) * 24; x < W; x += 48) g.fillRect(x, y, 24, 24);
    const card = (x, y, w, h, a) => { g.save(); g.globalAlpha = a; g.fillStyle = "#e8e8e4"; g.fillRect(x, y, w, h); g.strokeStyle = P.ink; g.lineWidth = 2; g.strokeRect(x, y, w, h); g.restore(); };
    const pc = E(U.clamp(u / 0.4)); card(36, 36, 250, 250, pc); card(36, 300, 250, 100, pc);
    // 3×3 toggle grid
    for (let i = 0; i < 9; i++) { const on = u > 0.3 + i * 0.12, x = 62 + (i % 3) * 72, y = 62 + Math.floor(i / 3) * 72; g.fillStyle = on ? "#2bd96b" : "#b6b8b2"; g.fillRect(x, y, 56, 56); g.strokeStyle = P.ink; g.lineWidth = 2; g.strokeRect(x, y, 56, 56); }
    // 7 circles
    for (let i = 0; i < 7; i++) { const x = 66 + i * 31, on = u > 0.9 + i * 0.12; g.beginPath(); g.arc(x, 350, 12, 0, Math.PI * 2); g.fillStyle = on ? P.ink : "#b6b8b2"; g.fill(); g.strokeStyle = P.ink; g.lineWidth = 2; g.stroke(); }
    // wide plate
    const pw = E(U.clamp((u - 0.5) / 0.55)), px = 320, pwid = 1340 * pw; card(px, 36, 1340, 250, 1);
    g.save(); g.beginPath(); g.rect(px, 36, pwid, 250); g.clip(); g.fillStyle = "#f2f2ee"; g.fillRect(px, 36, 1340, 250);
    word(g, T, T.C.words.name, ANTON, P.ink, px + 670, 218, 168);
    g.fillStyle = P.lime; g.fillRect(px + 150, 236, 1040 * U.easeInOutCubic(U.clamp((u - 0.9) / 0.7)), 9); g.restore();
    // caption typing + marquee
    const cap = T.C.words.caption.slice(0, Math.floor(Math.max(0, u - 1.0) * 38));
    g.font = `15px ${MONO}`; g.fillStyle = P.ink; g.textBaseline = "top"; g.fillText(cap + (Math.floor(u * 3) % 2 ? "▌" : ""), px + 6, 304);
    const b = U.textBitmap((T.C.words.lifestyle + "  ·  ").repeat(8), ANTON, 24, P.ink, T.res), un = b.w / 8;
    g.save(); g.beginPath(); g.rect(px, 336, 1340, 32); g.clip(); g.drawImage(b.c, px + ((u * -90) % un) , 334, b.w, b.h); g.restore();
    // project tiles (clickable DOM buttons are overlaid on these rects by the page)
    T.C.projects.forEach((label, i) => { const p = E(U.clamp((u - 1.3 - i * 0.12) / 0.4)); const x = px + i * 456, w = 430 * p; g.fillStyle = P.ink; g.fillRect(x, 380, w, 46); if (p > 0.9) { g.fillStyle = P.lime; g.font = `600 14px ${MONO}`; g.fillText(label + "  ▸", x + 16, 396); } });
    hud(g, T, tc14(u), 36, 414, 0.8, P.ink); hud(g, T, "SEQ 14 / 14", 190, 414, 0.8, P.ink);
  }
  const tc14 = (u) => `TC 00:40:${String(Math.floor(u * 30) % 30).padStart(2, "0")}`;

  /* loop wipe: noisy white slab with a cut-out N wipes across, then hard cut to S1 */
  function loop(g, W, H, u, T) {
    const P = T.C.pal; g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const p = U.easeInOutCubic(U.clamp(u / 1.2)), x = U.lerp(-W, W, p), f = Math.floor(u * 30);
    g.save(); g.beginPath(); g.rect(Math.max(0, x), 0, W, H); g.rect(x, 0, W, H); g.clip();
    g.fillStyle = P.bone; g.fillRect(x, 0, W, H);
    g.fillStyle = "rgba(10,10,10,0.18)"; for (let i = 0; i < 900; i++) g.fillRect(x + U.rnd(i * 1.3 + f) * W, U.rnd(i * 2.9 + f * 3) * H, 2 + U.rnd(i) * 4, 2);
    word(g, T, "N", SLAB, P.ink, x + W / 2, H + 20, 520);
    g.restore(); T.glitch = 0.4;
  }

  window.SCENES[9] = s10; window.SCENES[10] = s11; window.SCENES[11] = s12; window.SCENES[12] = s13; window.SCENES[13] = s14; window.SCENES[14] = loop;
})();
