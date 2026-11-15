/* scenes2.js — S2–S8. Same contract as scenes.js: pure (g, W, H, u, T). Text bitmaps are only ever rasterised at
   FIXED sizes (then scaled when drawn) so the bitmap cache can't grow unbounded on animated sizes. */
(function () {
  const U = window.U, E = U.easeOutExpo, RAD = Math.PI / 180;
  const MONO = 'ui-monospace, "JetBrains Mono", monospace', ANTON = '"Anton", Impact, sans-serif', SLAB = '"Archivo Black", "Arial Black", sans-serif';

  const hud = (g, T, text, x, y, alpha = 0.7, color) => {
    g.save(); g.font = `11px ${MONO}`; g.fillStyle = color || T.C.pal.bone; g.globalAlpha = alpha; g.textBaseline = "top"; g.fillText(text, x, y); g.restore();
  };
  /* draw `str` centred on cx with its baseline at baseY, `height` px tall, from a fixed 120px bitmap */
  const word = (g, T, str, font, color, cx, baseY, height, opts) => {
    const b = U.textBitmap(str, font, 120, color, T.res * 2, opts), k = height / 120;
    g.drawImage(b.c, cx - (b.w * k) / 2, baseY - 120 * k, b.w * k, b.h * k);
    return b.w * k;
  };
  const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };

  /* S2 · TYPE TUNNEL */
  function s2(g, W, H, u, T) {
    const P = T.C.pal, cx = W / 2, cy = H / 2, words = T.C.tunnel;
    g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const pulse = 0.5 + 0.5 * Math.sin(u * Math.PI * 4);
    const gl = g.createRadialGradient(cx, cy, 0, cx, cy, 300);
    gl.addColorStop(0, `rgba(255,200,0,${0.3 + 0.35 * pulse})`); gl.addColorStop(1, "rgba(255,200,0,0)");
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    g.save(); g.strokeStyle = P.amber; g.lineWidth = 2; g.setLineDash([16, 12]); g.lineDashOffset = -u * 240;
    [[0, 0], [W, 0], [0, H], [W, H], [cx, 0], [cx, H]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(cx + (x - cx) * 0.03, cy + (y - cy) * 0.03); g.stroke(); });
    g.restore();
    const rings = Array.from({ length: 12 }, (_, i) => ({ i, p: U.fract(i / 12 + u * 0.35) })).sort((a, b) => a.p - b.p);
    rings.forEach(({ i, p }) => {
      const s = Math.pow(p, 2.2), hw = cx * 1.7 * s + 4, hh = cy * 1.7 * s + 3;
      g.lineWidth = 1 + 12 * s; g.strokeStyle = [P.bone, P.amber, P.orange][i % 3]; g.globalAlpha = Math.min(1, p * 5);
      g.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);
      const wordH = Math.max(10, hh * 0.5);
      word(g, T, words[(i + Math.floor(u * 2)) % words.length], ANTON, P.bone, cx, cy - hh - 2, wordH, { stroke: P.ink, strokeW: 9 });
      g.globalAlpha = 1;
    });
    hud(g, T, `SEQ 02 / 14  ·  DEPTH ${(u * 0.35).toFixed(2)}`, 28, 20);
    T.glitch = 0.15 + 0.6 * (u / 3.2);
  }

  /* S3 · OUTLINE TITLE + GLOBES */
  function globe(g, T, r, rot, label, u) {
    const P = T.C.pal;
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, P.lime); gr.addColorStop(0.55, "#4de88a"); gr.addColorStop(1, "#00B8D4");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(10,10,10,0.55)"; g.lineWidth = 1.4;
    for (let k = 0; k < 6; k++) { const a = rot + (k / 6) * Math.PI; g.beginPath(); g.ellipse(0, 0, Math.abs(Math.cos(a)) * r, r, 0, 0, Math.PI * 2); g.stroke(); }
    for (let k = -2; k <= 2; k++) { const y = (k / 3) * r, w = Math.sqrt(r * r - y * y); g.beginPath(); g.ellipse(0, y, w, w * 0.18, 0, 0, Math.PI * 2); g.stroke(); }
    g.restore();
    g.strokeStyle = P.bone; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r + 5, 0, Math.PI * 2); g.stroke();
    const unit = label, cnt = Math.ceil((2 * Math.PI * (r + 22)) / (U.fract(0) + 150));
    U.circText(g, unit.repeat(2), 0, 0, r + 24, u * 0.8, `700 ${SLAB}`.replace("700 ", ""), 15, P.bone);
  }
  function s3(g, W, H, u, T) {
    const P = T.C.pal, res = T.res;
    g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const o = U.textBitmap(T.C.words.role1, ANTON, 330, null, res, { stroke: P.bone, strokeW: 1.5 });
    const f = U.textBitmap(T.C.words.role1, ANTON, 330, P.bone, res);
    const span = o.w + 90, shift = -((90 * u) % span);
    const drawRow = (bm, yy, a, clipW) => {
      g.save(); g.globalAlpha = a; if (clipW !== undefined) { g.beginPath(); g.rect(0, 0, clipW, H); g.clip(); }
      for (let k = 0; k < 3; k++) g.drawImage(bm.c, shift + k * span - 33, yy - 330, bm.w, bm.h);
      g.restore();
    };
    drawRow(o, H / 2 + 120 - 20, 0.1); drawRow(o, H / 2 + 120 + 240, 0.1); drawRow(o, H / 2 - 190 + 0, 0.1);
    drawRow(o, H / 2 + 120, 1);
    const wipe = U.clamp((u - 0.6) / 1.3);
    if (wipe > 0) drawRow(f, H / 2 + 120, 1, W * U.easeInOutCubic(wipe));
    [[480, "MEDTECH · AI/ML · "], [960, "BIO · DATA · CARE · "], [1440, "HEALTHCARE AI · "]].forEach(([x, lab], i) => {
      const p = U.clamp((u - 0.2 * i - 0.1) / 0.55); if (p <= 0) return;
      g.save(); g.translate(x, H / 2); g.scale(U.easeOutBack(p), U.easeOutBack(p));
      globe(g, T, 104, u * (0.6 + i * 0.2), lab, u); g.restore();
    });
    hud(g, T, "SEQ 03 / 14  ·  OUTLINE → FILL", 28, 20);
  }

  /* S4 · RAINBOW SMEAR → SHARDS */
  function s4(g, W, H, u, T) {
    const P = T.C.pal; g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    if (u < 1.1) {
      const unit = U.textBitmap("MEDTECH ", SLAB, 120, "#fff", T.res).w, str = "MEDTECH ".repeat(8);
      for (let r = 0; r < 4; r++) {
        const dir = r % 2 ? 1 : -1, sc = (2400 * u * dir) % unit;
        for (let k = 8; k >= 0; k--) {
          g.save(); g.globalAlpha = k === 0 ? 1 : 0.5 * (1 - k / 9) ** 1.6;
          const hue = (r * 70 + k * 28 + u * 400) % 360, b = U.textBitmap(str, SLAB, 120, `hsl(${hue},100%,${k ? 60 : 92}%)`, T.res);
          g.drawImage(b.c, sc - unit + dir * k * 30, 38 + r * 100, b.w, b.h); g.restore();
        }
      }
      T.glitch = 1;
      return;
    }
    const v = u - 1.1, cols = [P.bone, P.orange, "#161616", P.steel, P.bone, P.orange, P.steel, "#161616", P.bone], letters = "AIMLAIMLB";
    const exit = U.clamp((u - 2.6) / 0.4), beat = Math.floor(v / 0.5);
    for (let i = 0; i < 9; i++) {
      const p = E(U.clamp((v - i * 0.06) / 0.5)); if (p <= 0) continue;
      const x = i * 215 - 70 - exit * exit * 900, dx = (1 - p) * 700, dy = -(1 - p) * H * 1.2;
      g.save(); g.translate(dx, dy);
      const cxm = x + 140, cym = H / 2;
      g.translate(cxm, cym); g.rotate(exit * 8 * RAD); g.translate(-cxm, -cym);
      poly(g, [[x + 90, -20], [x + 290, -20], [x + 190, H + 20], [x - 10, H + 20]]); g.fillStyle = cols[i]; g.fill();
      g.save(); g.clip();
      const lc = cols[i] === P.bone ? "#111" : cols[i] === "#161616" ? P.bone : "#111";
      g.translate(cxm, cym); g.rotate((beat * 3 + i * 7) * RAD); word(g, T, letters[i], SLAB, lc, 0, 150, 420); g.restore();
      g.restore();
    }
    T.glitch = u < 1.25 ? 0.7 : 0;
  }

  /* S5 · VINYL DISC */
  function s5(g, W, H, u, T) {
    const P = T.C.pal, cx = W / 2, cy = H / 2;
    const bgr = g.createRadialGradient(cx, cy, 20, cx, cy, W * 0.6); bgr.addColorStop(0, P.amber); bgr.addColorStop(1, P.orange);
    g.fillStyle = bgr; g.fillRect(0, 0, W, H);
    // tilted marquee panels left + right
    [[-1, 0], [1, 1]].forEach(([side, k]) => {
      g.save(); g.translate(side < 0 ? 330 : W - 330, cy); g.rotate(side * 4 * RAD);
      g.fillStyle = P.orange; g.fillRect(-330, -H, 660, H * 2);
      g.beginPath(); g.rect(-330, -H, 660, H * 2); g.clip();
      for (let r = -3; r <= 3; r++) {
        const dir = (r + k) % 2 ? 1 : -1, b = U.textBitmap("NAVYA GUPTA ///// ".repeat(5), ANTON, 60, P.ink, T.res), un = b.w / 5;
        g.drawImage(b.c, -330 + ((u * 160 * dir) % un) - un, r * 74 - 40, b.w, b.h);
      }
      g.restore();
    });
    const R = [330, 288, 246, 204, 162, 120, 78], cols = [P.ink, P.amber, P.bone, P.orange, P.ink, P.amber];
    const labels = ["BIOMEDICAL INNOVATION · ", "NAVYA GUPTA · ", "MACHINE LEARNING · "];
    for (let i = 0; i < 6; i++) {
      const mid = (R[i] + R[i + 1]) / 2, dir = i % 2 ? 1 : -1, rot = dir * 40 * RAD * u;
      g.beginPath(); g.arc(cx, cy, R[i], 0, Math.PI * 2); g.arc(cx, cy, R[i + 1], 0, Math.PI * 2, true); g.fillStyle = cols[i]; g.fill("evenodd");
      if (i % 2 === 0) {
        const txt = labels[(i / 2) | 0], reps = Math.max(1, Math.round((2 * Math.PI * mid) / 330));
        U.circText(g, txt.repeat(reps), cx, cy, mid, rot, ANTON, 26, cols[i] === P.ink ? P.bone : P.ink);
      } else {
        g.save(); g.translate(cx, cy); g.rotate(rot); g.strokeStyle = cols[i] === P.bone ? P.ink : P.ink; g.lineWidth = 1.5;
        for (let k = 0; k < 72; k++) { g.rotate((Math.PI * 2) / 72); g.beginPath(); g.moveTo(R[i + 1] + 4, 0); g.lineTo(R[i] - 4, 0); g.stroke(); }
        g.restore();
      }
    }
    const beat = Math.exp(-U.fract(u * 2) * 5);
    g.fillStyle = `rgba(255,255,255,${0.25 + 0.4 * beat})`; g.beginPath(); g.arc(cx, cy, 44 + 22 * beat, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.bone; g.beginPath(); g.arc(cx, cy, 20, 0, Math.PI * 2); g.fill();
    hud(g, T, `SEQ 05 / 14  ·  ${(120).toFixed(0)} BPM`, 28, 20, 0.8, P.ink);
    T.glitch = beat > 0.7 ? 0.3 : 0;
  }

  /* S6 · MONOGRAM SLICES */
  function s6(g, W, H, u, T) {
    const P = T.C.pal, res = T.res, f = Math.floor(u * 30);
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#2b2e31"); bg.addColorStop(1, "#60666b");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = P.orange; g.lineWidth = 2; g.globalAlpha = 0.75;
    for (let i = 0; i < 34; i++) {
      let x = U.rnd(f * 3.1 + i) * W, y = U.rnd(f * 7.7 + i * 1.3) * H; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += 40 + U.rnd(f + i * 9 + k) * 60; y += (U.rnd(f * 2 + i * 5 + k) - 0.35) * 70; g.lineTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
    const lay = T.layer("mono"), lg = lay.g;
    const slice = H / 5, settle = Math.exp(-u / 0.5);
    [["N", 520], ["G", 1120]].forEach(([ch, x]) => {
      const b = U.textBitmap(ch, SLAB, 470, P.bone, res);
      for (let k = 0; k < 5; k++) {
        const off = Math.sin(k * 2.3 + u * 12 + (ch === "G" ? 2 : 0)) * 140 * settle;
        lg.save(); lg.beginPath(); lg.rect(0, k * slice, W, slice + 0.6); lg.clip(); lg.translate(x + off, 0);
        lg.transform(1, 0, -0.2, 1, 0, 0); lg.drawImage(b.c, 0, H - 470 * 1.05 + 16, b.w, b.h); lg.restore();
      }
    });
    lg.globalCompositeOperation = "source-atop"; lg.fillStyle = "rgba(20,20,20,0.28)";
    for (let i = 0; i < 700; i++) lg.fillRect(U.rnd(i * 1.7 + f) * W, U.rnd(i * 3.3 + f * 2) * H, 2 + U.rnd(i) * 3, 1.2);
    lg.globalCompositeOperation = "source-over";
    g.drawImage(lay.c, 0, 0, W, H);
    // black bars sliding across
    [[0.7, 0.25, 90], [1.3, 0.3, 170], [1.9, 0.3, 40]].forEach(([t0, d, y], i) => {
      const p = U.clamp((u - t0) / d); if (p > 0 && p < 1) { g.fillStyle = P.ink; g.fillRect(i % 2 ? W * (1 - p) : 0, y, W * p, 70); }
    });
    const fl = U.step(u, 2.65, 2.8); if (fl > 0) { g.fillStyle = `rgba(242,242,238,${fl})`; g.fillRect(0, 0, W, H); }
    hud(g, T, "SEQ 06 / 14  ·  MONOGRAM", 28, 20, 0.8);
    T.glitch = u < 0.5 ? 0.6 : 0;
  }

  /* S7 · RADIAL STARBURST */
  function s7(g, W, H, u, T) {
    const P = T.C.pal, cx = W / 2, cy = H / 2, ws = T.C.tunnel;
    g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    [-1, 1].forEach((side) => {
      let x = side < 0 ? 24 : W - 24;
      for (let i = 0; i < 6; i++) {
        const w = 92 * (1 - i * 0.13); g.save(); g.globalAlpha = 1 - i * 0.14;
        const cxp = x + side * (w / 2) * (side < 0 ? 1 : -1) * 0 + (side < 0 ? w / 2 : -w / 2);
        g.translate(cxp, cy); g.rotate(-Math.PI / 2); g.scale(1, 1);
        const b = U.textBitmap(ws.join(" ").repeat(2), ANTON, 120, P.bone, T.res), k = w / 120 * 1.15;
        const off = ((u * 90 * (i % 2 ? 1 : -1)) % (b.w * k / 2));
        g.drawImage(b.c, -b.w * k / 2 + off, -w * 0.5, b.w * k, b.h * k); g.restore();
        x += side * (w + 6);
      }
    });
    g.save(); g.translate(cx, cy); g.rotate(25 * RAD * u);
    for (let i = 0; i < 12; i++) {
      g.save(); g.rotate(i * 30 * RAD); const b = U.textBitmap(i % 2 ? "GUPTA" : "NAVYA", ANTON, 120, P.bone, T.res * 2), k = 0.55;
      g.globalAlpha = 0.95; g.drawImage(b.c, 52, -b.h * k * 0.5 + 8, b.w * k, b.h * k); g.restore();
    }
    g.restore();
    g.strokeStyle = P.lime; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 190, cy); g.lineTo(cx + 190, cy); g.moveTo(cx, cy - 190); g.lineTo(cx, cy + 190); g.stroke();
    g.beginPath(); g.arc(cx, cy, 190, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 72; k++) { const a = k * 5 * RAD, l = k % 6 === 0 ? 12 : 5; g.beginPath(); g.moveTo(cx + Math.cos(a) * 190, cy + Math.sin(a) * 190); g.lineTo(cx + Math.cos(a) * (190 + l), cy + Math.sin(a) * (190 + l)); g.stroke(); }
    hud(g, T, `X ${(23.25 + u * 0.01).toFixed(4)}  Y ${(77.41 + u * 0.01).toFixed(4)}`, cx + 200, cy - 12, 0.9, P.lime);
    hud(g, T, `ROT ${(u * 25).toFixed(1)}°`, cx - 300, cy - 12, 0.9, P.lime);
    hud(g, T, "SEQ 07 / 14", 28, 20, 0.7);
  }

  /* S8 · ORANGE BANNER + HUD */
  function s8(g, W, H, u, T) {
    const P = T.C.pal; g.fillStyle = P.orange; g.fillRect(0, 0, W, H);
    g.save(); g.fillStyle = P.ink;
    [[0, 230], [W - 230, 230]].forEach(([x0, w]) => { g.save(); g.beginPath(); g.rect(x0, 0, w, H); g.clip(); for (let k = -10; k < 24; k++) { poly(g, [[x0 + k * 26, 0], [x0 + k * 26 + 12, 0], [x0 + k * 26 - 60, H], [x0 + k * 26 - 72, H]]); g.fill(); } g.restore(); });
    g.restore();
    const p = E(U.clamp(u / 0.6)), txt = T.C.words.name, size = 214;
    g.save(); g.translate(W / 2 + (1 - p) * 600, 262); g.transform(1, 0, -0.21, 1, 0, 0);
    const wsh = U.textBitmap(txt, SLAB, size, P.bone, T.res), wk = U.textBitmap(txt, SLAB, size, P.ink, T.res), sc = Math.min(1, 1500 / wk.w);
    g.scale(sc, 1);
    g.drawImage(wsh.c, -wk.w / 2 + 7 - size * 0.1, -size + 6, wsh.w, wsh.h); g.drawImage(wk.c, -wk.w / 2 - size * 0.1, -size, wk.w, wk.h); g.restore();
    const nx = E(U.clamp((u - 0.3) / 0.7));
    word(g, T, "N", SLAB, P.ink, -30 - (1 - nx) * 500, H + 70, 330); word(g, T, "G", SLAB, P.ink, W + 30 + (1 - nx) * 500, H + 70, 330);
    // barcode strip
    g.fillStyle = P.ink; let bx = 300; for (let i = 0; bx < W - 300; i++) { const w = 1 + Math.floor(U.rnd(i * 2.3) * 4); if (i % 2 === 0) g.fillRect(bx, H - 58, w, 22); bx += w + 1 + Math.floor(U.rnd(i * 5.1) * 2); }
    const micro = `// ${T.C.words.hud.join(" // ")}`, shown = micro.slice(0, Math.floor(u * 40));
    g.font = `13px ${MONO}`; g.fillStyle = P.ink; g.textBaseline = "top"; g.fillText(shown + (Math.floor(u * 4) % 2 ? "_" : ""), 300, 24);
    hud(g, T, "SEQ 08 / 14", 28, 20, 0.9, P.bone); hud(g, T, `ID-${String(Math.floor(u * 997)).padStart(4, "0")}`, W - 110, H - 28, 0.9, P.bone);
    T.glitch = u < 0.4 ? 0.5 : 0;
  }

  Object.assign(window, { __S2: s2, __S3: s3, __S4: s4, __S5: s5, __S6: s6, __S7: s7, __S8: s8 });
  [s2, s3, s4, s5, s6, s7, s8].forEach((fn, i) => { window.SCENES[i + 1] = fn; });
})();
