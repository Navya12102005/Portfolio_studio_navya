/* scenes.js — each scene is pure: (g, W, H, u, T) => void. g is the band context in a fixed 1920x436 logical space,
   u is seconds since the scene started. No state between frames, no Math.random. */
(function () {
  const U = window.U;
  const MONO = 'ui-monospace, "JetBrains Mono", monospace';
  const ANTON = '"Anton", Impact, sans-serif';
  const SLAB = '"Archivo Black", "Arial Black", sans-serif';
  const DEV = '"Noto Devanagari", sans-serif';
  const SKEW = -0.21;

  function hud(g, T, text, x, y, alpha = 0.7, color) {
    g.save(); g.font = `11px ${MONO}`; g.fillStyle = color || T.C.pal.ink; g.globalAlpha = alpha; g.textBaseline = "top";
    g.fillText(text, x, y); g.restore();
  }

  /* S1 · ORANGE SLAB INTRO */
  function s1(g, W, H, u, T) {
    const { C, res } = T, P = C.pal;
    g.fillStyle = P.orange; g.fillRect(0, 0, W, H);

    // ghost rows of GUPTA at 12% black, drifting
    g.save(); g.globalAlpha = 0.12;
    for (let r = 0; r < 3; r++) {
      const dir = r % 2 ? 1 : -1, y = 130 + r * 150, adv = 140 * u * dir;
      for (let k = -1; k < 5; k++) U.drawText(g, C.words.surname, ((k * 560 + adv) % 2240) - 280, y, ANTON, 170, P.ink, res);
    }
    g.restore();

    // three slab words, each 0.25s apart, easeOutExpo from the right, sliced + glitch-settling
    const words = [
      { s: C.words.devanagari, font: DEV, weight: 900, size: 290, sx: 1 },
      { s: C.words.first, font: SLAB, size: 262, sx: 0.8 },
      { s: C.words.devanagari, font: DEV, weight: 900, size: 290, sx: 1 },
    ];
    const gap = 70;
    words.forEach((w) => { w.w = U.textBitmap(w.s, w.font, w.size, P.ink, res, { weight: w.weight }).w * w.sx; });
    let total = words.reduce((a, w) => a + w.w, 0) + gap * 2;
    const fit = Math.min(1, 1780 / total);
    total *= fit;
    let x = (W - total) / 2;
    const baseY = 318;
    words.forEach((w, i) => {
      const t0 = 0.15 + i * 0.25;
      const p = U.easeOutExpo(U.clamp((u - t0) / 0.7));
      const slide = (1 - p) * (W + 500);
      const settle = u < 1.4 ? Math.exp(-Math.max(0, u - t0) / 0.38) * (1 - U.step(u, 1.0, 1.4)) : 0;
      g.save();
      g.translate(x + slide, baseY); g.scale(fit, fit);
      g.transform(1, 0, SKEW, 1, 0, 0);
      g.translate(0, -baseY * 0); // shear is about the baseline
      const bmp = U.textBitmap(w.s, w.font, w.size, P.ink, res, { weight: w.weight });
      const sliceH = 400 / 6;
      for (let k = 0; k < 6; k++) {
        const off = Math.sin(k * 1.9 + u * 38) * settle * 90;
        g.save();
        g.beginPath(); g.rect(-400 + off * 0, -w.size + k * sliceH - 40, 3000, sliceH + 0.6); g.clip();
        g.translate(off, 0);
        g.scale(w.sx, 1);
        g.drawImage(bmp.c, -w.size * 0.1, -w.size, bmp.w, bmp.h);
        g.restore();
      }
      g.restore();
      x += (w.w + gap) * fit;
    });

    // dotted-circle badge, lower-left, rotating
    g.save(); g.translate(112, H - 92); g.rotate(u * 0.9);
    g.strokeStyle = P.ink; g.lineWidth = 3; g.setLineDash([1, 7]); g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, 50, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]); g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 36, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 24; k++) { g.save(); g.rotate((k / 24) * Math.PI * 2); g.fillRect(40, -0.8, k % 6 === 0 ? 9 : 4, 1.6); g.restore(); }
    g.restore();
    g.save(); g.fillStyle = P.ink; g.font = `900 20px ${SLAB}`; g.textAlign = "center"; g.fillText("NG", 112, H - 85); g.restore();

    hud(g, T, "SEQ 01 / 14  //  NAVYA GUPTA", 28, 22);
    hud(g, T, "B.TECH BIOENGINEERING · VIT BHOPAL", W - 330, 22);
    hud(g, T, `T+${u.toFixed(2).padStart(5, "0")}`, W - 90, H - 28);

    // white flash into the cut
    const fl = U.step(u, 2.9, 3.2);
    if (fl > 0) { g.fillStyle = `rgba(242,242,238,${fl})`; g.fillRect(0, 0, W, H); }
    T.glitch = u < 1.4 ? Math.max(0, 1 - u / 1.4) * 0.5 : 0;
  }

  /* S9 · LIME LENS TEXT */
  function s9(g, W, H, u, T) {
    const { C, res } = T, P = C.pal;
    g.fillStyle = P.ink; g.fillRect(0, 0, W, H);
    const text = C.words.name, size = 236;
    const bmp = U.textBitmap(text, ANTON, size, P.lime, res, { letter: 2 });
    const tw = bmp.w, x0 = (W - tw) / 2, cy = H / 2;

    // dim echo rows above and below at 20%
    g.save(); g.globalAlpha = 0.2;
    [-1, 1].forEach((d) => g.drawImage(bmp.c, x0 - size * 0.1, cy + d * 168 - size * 0.62, bmp.w, bmp.h * 0.7));
    g.restore();

    // lens: the text redrawn in 1px vertical slices, centre bulged to 1.5x, edges squashed to 0.55x
    const lens = T.layer("lens"), lg = lens.g;
    const breathe = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 0.5);
    const hi = 1.2 + 0.3 * breathe;
    for (let x = Math.floor(x0); x < x0 + tw - size * 0.2; x++) {
      const d = (x - W / 2) / (W / 2);
      const s = 0.55 + (hi - 0.55) * Math.pow(Math.max(0, 1 - d * d), 1.15);
      const sx = (x - x0 + size * 0.1) * res;
      if (sx < 0 || sx >= bmp.c.width) continue;
      const dh = bmp.h * 0.74 * s;
      lg.drawImage(bmp.c, sx, 0, res, bmp.c.height, x, cy - dh * 0.5 - 6, 1.02, dh);
    }

    // thick lime wavy outline wrapping the lens
    lg.save(); lg.lineWidth = 9; lg.strokeStyle = P.lime; lg.lineJoin = "round"; lg.lineCap = "round";
    lg.beginPath();
    const ix = 250, iy = 40, iw = W - 500, ih = H - 68, rr = 90, N = 260;
    for (let k = 0; k <= N; k++) {
      const q = k / N, per = 2 * (iw + ih);
      let px, py, nx = 0, ny = 0, a = q * per;
      if (a < iw) { px = ix + a; py = iy; ny = -1; }
      else if ((a -= iw) < ih) { px = ix + iw; py = iy + a; nx = 1; }
      else if ((a -= ih) < iw) { px = ix + iw - a; py = iy + ih; ny = 1; }
      else { a -= iw; px = ix; py = iy + ih - a; nx = -1; }
      const w = Math.sin(q * Math.PI * 2 * 14 + u * 3.4) * 7;
      const cx2 = Math.min(Math.max(px, ix + rr * 0), ix + iw), cy2 = py;
      const X = cx2 + nx * w, Y = cy2 + ny * w;
      k ? lg.lineTo(X, Y) : lg.moveTo(X, Y);
    }
    lg.closePath(); lg.stroke(); lg.restore();

    // neon glow: blurred lime duplicate under the sharp layer
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.85; g.filter = "blur(24px)"; g.drawImage(lens.c, 0, 0, W, H);
    g.filter = "none"; g.globalAlpha = 1; g.restore();
    g.drawImage(lens.c, 0, 0, W, H);

    hud(g, T, `LENS 01  ·  BULGE +${(hi - 0.5).toFixed(2)}`, 28, 20, 0.8, P.lime);
    hud(g, T, "SEQ 09 / 14", W - 110, 20, 0.8, P.lime);
    hud(g, T, `F${String(Math.floor(u * 30)).padStart(3, "0")}`, 28, H - 28, 0.6, P.lime);
    T.glitch = u < 0.1 ? 0.6 : 0;
  }

  /* Placeholders until S1 + S9 are approved — each shows its brief so the timeline is already runnable. */
  const stub = (n, title) => (g, W, H, u, T) => {
    g.fillStyle = T.C.pal.ink; g.fillRect(0, 0, W, H);
    g.fillStyle = T.C.pal.bone; g.globalAlpha = 0.5; g.font = `13px ${MONO}`; g.textBaseline = "top";
    g.fillText(`S${n} · ${title} — built after S1 + S9 are approved`, 28, 20);
    g.globalAlpha = 1; g.fillStyle = T.C.pal.orange; g.fillRect(28, H - 40, (W - 56) * U.clamp(u / T.dur), 3);
  };

  window.SCENES = [
    s1, stub(2, "TYPE TUNNEL"), stub(3, "OUTLINE TITLE + GLOBES"), stub(4, "RAINBOW SMEAR → SHARDS"),
    stub(5, "VINYL DISC"), stub(6, "MONOGRAM SLICES"), stub(7, "RADIAL STARBURST"), stub(8, "ORANGE BANNER + HUD"),
    s9, stub(10, "MONOGRAM TILE → GRID"), stub(11, "HOLOGRAM SPIRAL → ITALIC"), stub(12, "WARPED WORDS"),
    stub(13, "CUBE HUD"), stub(14, "FINAL UI CARD"),
  ];
})();
