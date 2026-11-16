"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import type { ProjectId } from "@/lib/projectModalStore";
import { PROJECT_ORDER } from "@/data/projects";
import { COLS, ROWS, TH, TILES, TW, buildAtlas, projectOfTile } from "./plates";

/**
 * Orb Gallery — a port of the reference sphere (190 non-overlapping rounded
 * plates on a lattice, hover lift + focus dimming, drag with inertia), with
 * the plates swapped for Navya's projects. Clicking a plate opens that project.
 * Runs directly on the three.js already in the bundle (no iframe, no CDN).
 */

export type OrbHandle = {
  /** spin the orb so a plate of this project faces the viewer and lift it */
  focus: (id: ProjectId) => void;
  /** let go of a focus() */
  release: () => void;
  /** spin to a random project and open it */
  random: () => void;
};

type Props = {
  onHover?: (id: ProjectId | null) => void;
  onOpen: (id: ProjectId, origin: { x: number; y: number }) => void;
  handle?: Ref<OrbHandle>;
};

const SPHERE = { R: 1, nEquator: 20, latLimit: 84, gap: 0.1 };
const ASPECTS = [1.62, 1.56, 1.5, 1.5, 1.5, 1.44, 1.38, 1.32];
const SEG = 7;
const PER = 4 * (SEG + 1);
const HOVER_POP = 1.12;
const AUTO = (Math.PI * 2) / 20;

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rr = (r: () => number, a: number, b: number) => a + r() * (b - a);
const pick = <T,>(r: () => number, a: T[]) => a[Math.min(a.length - 1, (r() * a.length) | 0)];
const wrapPi = (a: number) => { const t = Math.PI * 2; return ((((a + Math.PI) % t) + t) % t) - Math.PI; };

type Card = {
  lat: number; lon: number; rad: number; w: number; h: number; roll: number; tile: number;
  basis: { n: number[]; R: number[]; U: number[] }; outline: number[][]; vBase: number;
};

function buildCards(): Card[] {
  const r = mulberry32(424242);
  const out: Card[] = [];
  const lim = (SPHERE.latLimit * Math.PI) / 180;
  const cellEq = (2 * Math.PI) / SPHERE.nEquator;
  const nRings = Math.max(1, Math.round((lim * 2) / (cellEq / 1.5)));
  const pitch = (lim * 2) / nRings;
  for (let j = 0; j <= nRings; j++) {
    const lat = -lim + j * pitch;
    const cl = Math.max(0.05, Math.cos(lat));
    const n = Math.max(1, Math.round(SPHERE.nEquator * cl));
    const cellW = (2 * Math.PI * cl) / n, cellH = pitch;
    const maxW = cellW * (1 - SPHERE.gap), maxH = cellH * (1 - SPHERE.gap);
    const off = r() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const asp = pick(r, ASPECTS);
      const roll = rr(r, -0.045, 0.045);
      const ca = Math.cos(roll), sa = Math.abs(Math.sin(roll));
      let w = Math.min(maxW / (ca + sa / asp), maxH / (ca / asp + sa));
      w *= rr(r, 0.86, 0.96);
      const h = w / asp;
      const slackLon = Math.max(0, (cellW - (w * ca + h * sa)) / 2);
      out.push({
        lat, lon: off + (i / n) * Math.PI * 2 + (slackLon / cl) * rr(r, -0.85, 0.85),
        rad: SPHERE.R * (1 + rr(r, 0, 0.02)), w, h, roll, tile: 0,
        basis: { n: [], R: [], U: [] }, outline: [], vBase: 0,
      });
    }
  }
  const idx = out.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const k = (r() * (i + 1)) | 0; [idx[i], idx[k]] = [idx[k], idx[i]]; }
  idx.forEach((o, i) => { out[o].tile = i % TILES; });
  const dir = out.map((c) => { const cl = Math.cos(c.lat); return [cl * Math.sin(c.lon), Math.sin(c.lat), cl * Math.cos(c.lon)]; });
  const MIND = Math.cos(0.62);
  const clash = (i: number) => {
    for (let j = 0; j < out.length; j++) {
      if (j === i || out[j].tile !== out[i].tile) continue;
      if (dir[i][0] * dir[j][0] + dir[i][1] * dir[j][1] + dir[i][2] * dir[j][2] > MIND) return true;
    }
    return false;
  };
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < out.length; i++) {
      if (!clash(i)) continue;
      for (let t = 0; t < 24; t++) {
        const k = (r() * out.length) | 0; if (k === i) continue;
        const a = out[i].tile, b = out[k].tile;
        out[i].tile = b; out[k].tile = a;
        if (!clash(i) && !clash(k)) break;
        out[i].tile = a; out[k].tile = b;
      }
    }
  }
  return out;
}

function cardOutline(w: number, h: number, rad: number, seg: number) {
  const a = w / 2, b = h / 2, q = Math.min(rad, a * 0.9, b * 0.9), pts: number[][] = [];
  const corners = [[a - q, b - q, 0], [-a + q, b - q, Math.PI / 2], [-a + q, -b + q, Math.PI], [a - q, -b + q, -Math.PI / 2]];
  for (const [cx, cy, a0] of corners) for (let s = 0; s <= seg; s++) { const t = a0 + (s / seg) * (Math.PI / 2); pts.push([cx + Math.cos(t) * q, cy + Math.sin(t) * q]); }
  return pts;
}

function cardBasis(c: Card) {
  const cl = Math.cos(c.lat), sl = Math.sin(c.lat), cs = Math.cos(c.lon), sn = Math.sin(c.lon);
  const n = [cl * sn, sl, cl * cs];
  const u = [-sl * sn, cl, -sl * cs];
  const g = [u[1] * n[2] - u[2] * n[1], u[2] * n[0] - u[0] * n[2], u[0] * n[1] - u[1] * n[0]];
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  return {
    n,
    R: [g[0] * cr + u[0] * sr, g[1] * cr + u[1] * sr, g[2] * cr + u[2] * sr],
    U: [u[0] * cr - g[0] * sr, u[1] * cr - g[1] * sr, u[2] * cr - g[2] * sr],
  };
}

function writeCard(pos: Float32Array, c: Card, scale: number, radMul: number) {
  const b = c.basis, rad = c.rad * radMul;
  const ox = b.n[0] * rad, oy = b.n[1] * rad, oz = b.n[2] * rad;
  let p = c.vBase * 3;
  pos[p++] = ox; pos[p++] = oy; pos[p++] = oz;
  for (let i = 0; i < c.outline.length; i++) {
    const x = c.outline[i][0] * scale, y = c.outline[i][1] * scale;
    pos[p++] = ox + b.R[0] * x + b.U[0] * y;
    pos[p++] = oy + b.R[1] * x + b.U[1] * y;
    pos[p++] = oz + b.R[2] * x + b.U[2] * y;
  }
}

function familyOf(cls: string, fallback: string) {
  const el = document.createElement("span");
  el.className = cls; el.textContent = "Aa"; el.style.cssText = "position:absolute;visibility:hidden";
  document.body.appendChild(el);
  const f = getComputedStyle(el).fontFamily || fallback;
  el.remove();
  return f;
}

export default function OrbGallery({ onHover, onOpen, handle }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const cb = useRef({ onHover, onOpen });
  const api = useRef<OrbHandle>({ focus: () => {}, release: () => {}, random: () => {} });

  useEffect(() => { cb.current = { onHover, onOpen }; });
  useImperativeHandle(handle, () => ({
    focus: (id) => api.current.focus(id),
    release: () => api.current.release(),
    random: () => api.current.random(),
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    let raf = 0;
    let teardown: (() => void) | null = null;

    (async () => {
      const display = familyOf("font-anton", "Anton, Impact, sans-serif");
      const mono = familyOf("sn-hud-text", "monospace");
      try {
        await Promise.all([document.fonts.load(`40px ${display}`), document.fonts.load(`600 16px ${mono}`)]);
        await document.fonts.ready;
      } catch { /* draw with fallbacks */ }
      if (disposed) return;

      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
      catch { return; } // no WebGL: the project chips below still work
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(19, 1, 0.1, 60);
      const atlasTex = new THREE.CanvasTexture(buildAtlas({ display, mono }));
      atlasTex.flipY = false;
      atlasTex.colorSpace = THREE.SRGBColorSpace;
      atlasTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      atlasTex.minFilter = THREE.LinearMipmapLinearFilter;
      atlasTex.magFilter = THREE.LinearFilter;
      atlasTex.generateMipmaps = true;

      const cards = buildCards();
      const hoverT = new Float32Array(cards.length);
      const vCount = cards.length * (PER + 1);
      const basePos = new Float32Array(vCount * 3);
      const uv = new Float32Array(vCount * 2);
      const col = new Float32Array(vCount * 3).fill(1);
      const idx = new Uint32Array(cards.length * PER * 3);
      const TILEU = 1 / COLS, TILEV = 1 / ROWS, INSET = 0.5 / TW;
      let up = 0, ip = 0, vbase = 0;
      for (const c of cards) {
        c.basis = cardBasis(c);
        c.outline = cardOutline(c.w, c.h, c.w * 0.065, SEG);
        c.vBase = vbase;
        writeCard(basePos, c, 1, 1);
        const cl = c.tile % COLS, row = (c.tile / COLS) | 0;
        const asp = c.w / c.h, tileAsp = TW / TH;
        const us = asp > tileAsp ? 1 : asp / tileAsp, vs = asp > tileAsp ? tileAsp / asp : 1;
        uv[up++] = (cl + 0.5) * TILEU; uv[up++] = (row + 0.5) * TILEV;
        for (const [ox, oy] of c.outline) {
          const lu = 0.5 + (ox / c.w) * us, lv = 0.5 + (oy / c.h) * vs;
          uv[up++] = (cl + Math.min(1 - INSET, Math.max(INSET, lu))) * TILEU;
          uv[up++] = (row + (1 - Math.min(1 - INSET, Math.max(INSET, lv)))) * TILEV;
        }
        for (let i = 0; i < PER; i++) { idx[ip++] = vbase; idx[ip++] = vbase + 1 + i; idx[ip++] = vbase + 1 + ((i + 1) % PER); }
        vbase += PER + 1;
      }
      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(basePos, 3);
      const colAttr = new THREE.BufferAttribute(col, 3);
      geo.setAttribute("position", posAttr);
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geo.setAttribute("color", colAttr);
      geo.setIndex(new THREE.BufferAttribute(idx, 1));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.35);
      const mat = new THREE.MeshBasicMaterial({ map: atlasTex, side: THREE.FrontSide, vertexColors: true, toneMapped: false });
      const mesh = new THREE.Mesh(geo, mat);
      const orb = new THREE.Group();
      orb.add(mesh); scene.add(orb);

      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const canHover = window.matchMedia?.("(hover:hover) and (pointer:fine)").matches ?? true;
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const hoverBall = new THREE.Sphere(new THREE.Vector3(), 1.06);
      const hitPt = new THREE.Vector3();
      const live = new Set<number>();
      let yaw = 0, pitch = 0, yawVel = 0, pitchVel = 0, dragging = false, moved = 0;
      let last: { x: number; y: number } | null = null;
      let hoverPos: { x: number; y: number } | null = null;
      let hoverIdx = -1, dimT = 0, slowT = 0, forced = -1, lastProject: ProjectId | null = null;
      let tween: { from: number; to: number; t: number; dur: number; done?: () => void } | null = null;

      let fitW = 0, fitH = 0;
      const fit = (force?: boolean) => {
        const W = wrap.clientWidth, H = wrap.clientHeight;
        if (W < 2 || H < 2) return;
        if (!force && W === fitW && H === fitH) return;
        fitW = W; fitH = H;
        const D = 4.0, alpha = Math.asin(1 / D);
        const diameter = Math.min(0.84 * W, 0.98 * H);
        const halfFov = Math.atan((Math.tan(alpha) * H) / diameter);
        camera.fov = Math.max(4, Math.min(100, (halfFov * 2 * 180) / Math.PI));
        camera.aspect = W / H;
        camera.position.set(0, 0, D);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H, false);
      };
      fit(true);

      const setNdc = (cx: number, cy: number) => {
        const b = canvas.getBoundingClientRect();
        return { x: ((cx - b.left) / b.width) * 2 - 1, y: -((cy - b.top) / b.height) * 2 + 1 };
      };
      const pickAt = (p: { x: number; y: number }) => {
        ndc.set(p.x, p.y);
        raycaster.setFromCamera(ndc, camera);
        hoverBall.center.copy(orb.position);
        if (!raycaster.ray.intersectsSphere(hoverBall)) return -1;
        const hit = raycaster.intersectObject(mesh, false)[0];
        return hit && hit.faceIndex != null ? Math.floor(hit.faceIndex / PER) : -2; // -2: on the orb, in a gap
      };

      const emitHover = () => {
        const id = hoverIdx >= 0 ? projectOfTile(cards[hoverIdx].tile) : null;
        if (id !== lastProject) { lastProject = id; cb.current.onHover?.(id); }
        canvas.style.cursor = dragging ? "grabbing" : hoverIdx >= 0 ? "pointer" : "grab";
      };

      const updateHover = (dt: number) => {
        let want = -1;
        if (forced >= 0) want = forced;
        else if (hoverPos && !dragging && canHover) {
          const p = pickAt(hoverPos);
          if (p >= 0) want = p;
          else if (p === -2) {
            if (hoverIdx >= 0) want = hoverIdx;
            else if (raycaster.ray.intersectSphere(hoverBall, hitPt)) {
              orb.worldToLocal(hitPt).normalize();
              let best = -1, bd = -2;
              for (let i = 0; i < cards.length; i++) { const n = cards[i].basis.n, d = n[0] * hitPt.x + n[1] * hitPt.y + n[2] * hitPt.z; if (d > bd) { bd = d; best = i; } }
              want = best;
            }
          }
        }
        if (want !== hoverIdx) { if (hoverIdx >= 0) live.add(hoverIdx); if (want >= 0) live.add(want); hoverIdx = want; emitHover(); }
        const ease = 1 - Math.pow(0.0009, dt);
        dimT += ((hoverIdx >= 0 ? 1 : 0) - dimT) * ease;
        slowT += ((hoverIdx >= 0 ? 1 : 0) - slowT) * ease;
        const dimTo = 1 - 0.42 * dimT;
        mat.color.setScalar(dimTo);
        let g = false, cc = false;
        for (const i of Array.from(live)) {
          const target = i === hoverIdx ? 1 : 0;
          const t = hoverT[i] + (target - hoverT[i]) * ease;
          hoverT[i] = Math.abs(t - target) < 0.0015 ? target : t;
          const c = cards[i], k = 1 + hoverT[i] * (HOVER_POP - 1);
          writeCard(basePos, c, k, k); g = true;
          const lift = 1 + hoverT[i] * (1 / dimTo - 1);
          const v0 = c.vBase * 3, v1 = v0 + (PER + 1) * 3;
          for (let v = v0; v < v1; v++) col[v] = lift;
          cc = true;
          if (hoverT[i] === 0 && i !== hoverIdx) live.delete(i);
        }
        if (g) posAttr.needsUpdate = true;
        if (cc) colAttr.needsUpdate = true;
      };

      let prev = performance.now();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        let dt = (now - prev) / 1000; prev = now;
        if (dt > 0.1) dt = 0.1;
        fit();
        if (tween) {
          tween.t += dt;
          const k = Math.min(1, tween.t / tween.dur), e = 1 - Math.pow(1 - k, 3);
          yaw = tween.from + (tween.to - tween.from) * e;
          pitch *= Math.pow(0.05, dt); yawVel = 0; pitchVel = 0;
          if (k >= 1) { const d = tween.done; tween = null; d?.(); }
        } else if (!dragging) {
          yaw += (AUTO * (reduce ? 0 : 1) * (1 - 0.78 * slowT) + yawVel) * dt;
          yawVel *= Math.pow(0.0016, dt);
          pitch += pitchVel * dt; pitchVel *= Math.pow(0.0016, dt);
          pitch *= Math.pow(0.22, dt);
        }
        orb.rotation.set(pitch, yaw, 0);
        updateHover(dt);
        renderer.render(scene, camera);
      };

      let running = false, visible = true;
      const sync = () => {
        const want = visible && !document.hidden;
        if (want && !running) { running = true; prev = performance.now(); raf = requestAnimationFrame(tick); }
        else if (!want && running) { running = false; cancelAnimationFrame(raf); }
      };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0 });
      io.observe(wrap);
      document.addEventListener("visibilitychange", sync);
      const ro = new ResizeObserver(() => fit()); ro.observe(wrap);

      /* ---- pointer: drag to spin, tap / click a plate to open it ---- */
      const openIdx = (i: number, origin: { x: number; y: number }) => {
        if (i < 0) return;
        cb.current.onOpen(projectOfTile(cards[i].tile), origin);
      };
      const rad = () => Math.min(canvas.clientWidth, canvas.clientHeight) || 1;
      const onDown = (e: PointerEvent) => {
        dragging = true; moved = 0; tween = null; forced = -1;
        hintRef.current?.classList.add("gone");
        canvas.setPointerCapture(e.pointerId);
        last = { x: e.clientX, y: e.clientY };
        emitHover();
      };
      const onMove = (e: PointerEvent) => {
        if (canHover && e.pointerType !== "touch") hoverPos = setNdc(e.clientX, e.clientY);
        if (!dragging || !last) return;
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        moved += Math.abs(dx) + Math.abs(dy);
        last = { x: e.clientX, y: e.clientY };
        const k = 2.6 / rad();
        yaw += dx * k; yawVel = dx * k * 60 * 0.35;
        pitch = Math.max(-0.26, Math.min(0.26, pitch + dy * k * 0.55)); pitchVel = dy * k * 60 * 0.2;
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false; last = null;
        try { canvas.releasePointerCapture(e.pointerId); } catch { /* already released */ }
        if (moved < 8) {
          const hit = pickAt(setNdc(e.clientX, e.clientY));
          openIdx(hit >= 0 ? hit : e.pointerType !== "touch" ? hoverIdx : -1, { x: e.clientX, y: e.clientY });
        }
        emitHover();
      };
      const onLeave = (e: PointerEvent) => { hoverPos = null; onUp(e); };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("pointerleave", onLeave);
      const onLost = (e: Event) => e.preventDefault();
      const onRestored = () => { atlasTex.needsUpdate = true; };
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", onRestored);

      /* ---- imperative API (project chips, "surprise me") ---- */
      const spinTo = (i: number, done?: () => void) => {
        const c = cards[i];
        const d = wrapPi(-c.lon - yaw);
        forced = i;
        tween = { from: yaw, to: yaw + d, t: 0, dur: reduce ? 0.01 : Math.min(1.5, 0.6 + Math.abs(d) * 0.35), done };
      };
      const bestFor = (id: ProjectId, avoid = -1) => {
        let best = -1, bc = Infinity;
        cards.forEach((c, i) => {
          if (projectOfTile(c.tile) !== id || i === avoid) return;
          const cost = Math.abs(wrapPi(-c.lon - yaw)) + Math.abs(c.lat) * 0.8;
          if (cost < bc) { bc = cost; best = i; }
        });
        return best;
      };
      api.current = {
        focus: (id) => { const i = bestFor(id); if (i >= 0) spinTo(i); },
        release: () => { forced = -1; },
        random: () => {
          const pool = PROJECT_ORDER.filter((p) => p !== lastOpened);
          const id = pool[(Math.random() * pool.length) | 0];
          lastOpened = id;
          const i = bestFor(id);
          if (i < 0) return;
          const b = wrap.getBoundingClientRect();
          spinTo(i, () => { window.setTimeout(() => { forced = -1; cb.current.onOpen(id, { x: b.left + b.width / 2, y: b.top + b.height / 2 }); }, 350); });
        },
      };
      let lastOpened: ProjectId | null = null;

      sync();
      teardown = () => {
        running = false; cancelAnimationFrame(raf);
        io.disconnect(); ro.disconnect();
        document.removeEventListener("visibilitychange", sync);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        geo.dispose(); mat.dispose(); atlasTex.dispose(); renderer.dispose();
        api.current = { focus: () => {}, release: () => {}, random: () => {} };
      };
      if (disposed) teardown();
    })();

    return () => { disposed = true; cancelAnimationFrame(raf); teardown?.(); };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-[clamp(380px,78vh,820px)]">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full block cursor-grab" style={{ touchAction: "pan-y" }} />
      <div ref={hintRef} aria-hidden className="orb-hint sn-hud-text pointer-events-none absolute right-0 top-2 text-[11px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white/60 transition-all duration-500">
        Drag to spin · click a plate to open it
      </div>
    </div>
  );
}
