/* util.js — pure helpers. No Math.random anywhere: every "random" is a stateless hash of its inputs. */
(function () {
  const U = {};
  U.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.fract = (x) => x - Math.floor(x);
  U.rnd = (n) => U.fract(Math.sin(n * 12.9898) * 43758.5453);
  U.easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  U.easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  U.easeOutBack = (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  U.step = (u, a, b) => U.clamp((u - a) / (b - a));

  /* Text → bitmap cache, keyed by string/font/size/colour. The bitmap is rasterised at
     `res` x logical size so it stays razor sharp when the band is scaled up for 4K. */
  const cache = new Map();
  U.textBitmap = (str, font, size, color, res, opts = {}) => {
    const key = [str, font, size, color, res, opts.stroke || "", opts.letter || 0, opts.weight || ""].join("|");
    const fnt = `${opts.weight ? opts.weight + " " : ""}${size}px ${font}`;
    let hit = cache.get(key);
    if (hit) return hit;
    const m = document.createElement("canvas").getContext("2d");
    m.font = fnt;
    if (opts.letter) m.letterSpacing = opts.letter + "px";
    const w = Math.ceil(m.measureText(str).width + size * 0.2);
    const h = Math.ceil(size * 1.35);
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * res); c.height = Math.ceil(h * res);
    const g = c.getContext("2d");
    g.scale(res, res);
    g.font = fnt;
    if (opts.letter) g.letterSpacing = opts.letter + "px";
    g.textBaseline = "alphabetic";
    if (opts.stroke) { g.lineJoin = "round"; g.lineWidth = opts.strokeW || 2; g.strokeStyle = opts.stroke; g.strokeText(str, size * 0.1, size); }
    if (color) { g.fillStyle = color; g.fillText(str, size * 0.1, size); }
    hit = { c, w, h };
    cache.set(key, hit);
    return hit;
  };
  U.drawText = (g, str, x, y, font, size, color, res, opts) => {
    const b = U.textBitmap(str, font, size, color, res, opts);
    g.drawImage(b.c, x - size * 0.1, y - size, b.w, b.h);
    return b.w - size * 0.2;
  };

  /* Draw a bitmap or callback in n horizontal slices, each shifted by offFn(i). */
  U.sliceDraw = (g, w, h, n, draw, offFn) => {
    for (let i = 0; i < n; i++) {
      g.save();
      g.beginPath(); g.rect(-5000, (h / n) * i, 10000, h / n + 0.5); g.clip();
      g.translate(offFn(i), 0);
      draw(i);
      g.restore();
    }
  };

  /* Text laid around a circle (cx,cy,r), starting at angle a0. */
  U.circText = (g, str, cx, cy, r, a0, font, size, color) => {
    g.save(); g.font = `${size}px ${font}`; g.fillStyle = color; g.textBaseline = "middle";
    const tot = g.measureText(str).width;
    let a = a0;
    for (const ch of str) {
      const cw = g.measureText(ch).width;
      g.save();
      g.translate(cx, cy); g.rotate(a + (cw / 2) / r); g.translate(r, 0); g.rotate(Math.PI / 2);
      g.fillText(ch, -cw / 2, 0);
      g.restore();
      a += cw / r;
    }
    g.restore();
    return tot;
  };

  window.U = U;
})();
