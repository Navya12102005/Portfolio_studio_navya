/* fx.js — the global post stack, applied to the band every frame:
   chromatic aberration → bloom → grain → scanlines → vignette (shake is applied by the compositor). */
(function () {
  const { rnd, clamp } = window.U;
  const FX = {};
  const pool = {};
  const get = (name, w, h) => {
    let c = pool[name];
    if (!c || c.width !== w || c.height !== h) { c = document.createElement("canvas"); c.width = w; c.height = h; pool[name] = c; }
    return c;
  };

  let grainTile = null;
  const grain = () => {
    if (grainTile) return grainTile;
    grainTile = document.createElement("canvas"); grainTile.width = grainTile.height = 256;
    const g = grainTile.getContext("2d"), d = g.createImageData(256, 256);
    for (let i = 0; i < 65536; i++) { const v = rnd(i + 1) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0);
    return grainTile;
  };

  /* src: band canvas with the scene. Returns the processed canvas (dst). */
  FX.post = (src, t, opts) => {
    const w = src.width, h = src.height, rs = opts.rs;
    const dst = get("fxDst", w, h), dg = dst.getContext("2d");
    const frame = Math.floor(t * 30);
    dg.setTransform(1, 0, 0, 1, 0, 0);
    dg.globalCompositeOperation = "source-over";
    dg.fillStyle = "#000"; dg.fillRect(0, 0, w, h);

    // 1 · chromatic aberration (R/G/B split), spiking on glitch hits
    const off = (0.5 + 1.5 * (0.5 + 0.5 * Math.sin(t * 3))) * rs + opts.glitch * 14 * rs;
    const tmp = get("fxTmp", w, h), tg = tmp.getContext("2d");
    [["#f00", -off], ["#0f0", 0], ["#00f", off]].forEach(([col, dx]) => {
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.globalCompositeOperation = "source-over"; tg.drawImage(src, 0, 0);
      tg.globalCompositeOperation = "multiply"; tg.fillStyle = col; tg.fillRect(0, 0, w, h);
      dg.globalCompositeOperation = "lighter"; dg.drawImage(tmp, dx, 0);
    });

    // 2 · bloom on the bright lime/orange (duplicate, blur, add)
    if ("filter" in dg) {
      dg.globalCompositeOperation = "lighter"; dg.globalAlpha = 0.25;
      dg.filter = `blur(${12 * rs}px) brightness(1.4)`; dg.drawImage(src, 0, 0);
      dg.filter = "none"; dg.globalAlpha = 1;
    }

    // 3 · film grain, 7%, seeded random offset per frame
    dg.globalCompositeOperation = "source-over"; dg.globalAlpha = 0.07;
    const gt = grain(), ox = Math.floor(rnd(frame * 1.7) * 256), oy = Math.floor(rnd(frame * 2.9) * 256), sz = 256 * rs;
    for (let x = -ox * rs; x < w; x += sz) for (let y = -oy * rs; y < h; y += sz) dg.drawImage(gt, x, y, sz, sz);
    dg.globalAlpha = 1;

    // 4 · scanlines, 2px period, 6%
    dg.fillStyle = "rgba(0,0,0,0.06)";
    for (let y = 0; y < h; y += 2 * rs) dg.fillRect(0, y, w, rs);

    // 5 · vignette, 35% at the corners
    const gr = dg.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.6);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.35)");
    dg.fillStyle = gr; dg.fillRect(0, 0, w, h);
    return dst;
  };

  /* Decaying camera shake: ±10 logical px, exp decay over ~0.25 s after a scene starts. */
  FX.shake = (u, seed) => {
    const a = 10 * Math.exp(-u / 0.083) * (u < 0.5 ? 1 : 0);
    return [(rnd(seed * 3.1 + Math.floor(u * 60)) - 0.5) * 2 * a, (rnd(seed * 5.7 + Math.floor(u * 60)) - 0.5) * 2 * a];
  };

  /* Hard-cut opener: 10-strip shutter reveal (0.2 s, 15 ms stagger) + 0.08 s white flash. */
  FX.shutter = (g, W, H, u) => {
    if (u < 0.2) {
      const n = 10, sh = H / n;
      for (let i = 0; i < n; i++) {
        const p = clamp((u - i * 0.015) / 0.12);
        const e = p * p * (3 - 2 * p);
        g.fillStyle = "#000";
        g.fillRect(i % 2 ? 0 : e * W, i * sh, (1 - e) * W, sh + 0.5);
      }
    }
    if (u < 0.08) { g.fillStyle = `rgba(242,242,238,${1 - u / 0.08})`; g.fillRect(0, 0, W, H); }
  };

  window.FX = FX;
})();
