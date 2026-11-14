/* The 3 eras of Navya: tech room, bio lab, marketing collage + exploding transitions. */
(function () {
  const $ = (s) => document.querySelector(s), $$ = (s) => document.querySelectorAll(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  const say = (m) => window.toast && window.toast(m);
  if (!window.THREE) return;

  function renderer(cv, opt = {}) {
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: !!opt.alpha }); r.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = opt.exp || 1.1;
    if (opt.shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; } return r;
  }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData = { c, x, draw }; return t; }
  const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0, envMapIntensity: 0.18 }, o));
  const box = (w, h, d, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.castShadow = o.receiveShadow = true; return o; };

  function rbox(w, h, d, r, m) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - r), bevelEnabled: true, bevelThickness: r / 2, bevelSize: r / 2, bevelSegments: 4, curveSegments: 6 }); g.center(); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; }
  const woodTex = () => canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#6b4526'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 30},${20 + Math.random() * 15},8,${0.15 + Math.random() * 0.3})`; x.lineWidth = 1 + Math.random() * 3; x.beginPath(); const y0 = Math.random() * h; for (let px = 0; px <= w; px += 16) x.lineTo(px, y0 + Math.sin(px * 0.02 + i) * 6 + Math.sin(px * 0.005) * 14); x.stroke(); } });
  const brushTex = () => canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#9aa7b5'; x.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; x.fillRect(0, Math.random() * h, w, 1); x.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; x.fillRect(Math.random() * w, Math.random() * h, 40 + Math.random() * 120, 1); } });
  const fabricTex = (c) => canvasTex(256, 256, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.08})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
  function motes(sc, n, box, col) { const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * box[0]; p[i * 3 + 1] = Math.random() * box[1]; p[i * 3 + 2] = (Math.random() - 0.5) * box[2] + box[3]; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.012, color: col, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); sc.add(m);
    return (t) => { for (let i = 0; i < n; i++) { p[i * 3 + 1] += 0.0008 * Math.sin(t + i); p[i * 3] += 0.0006 * Math.cos(t * 0.7 + i); if (p[i * 3 + 1] > box[1]) p[i * 3 + 1] = 0; } g.attributes.position.needsUpdate = true; }; }
  function camPath(keys, p) { let i = 0; while (i < keys.length - 2 && p > keys[i + 1].p) i++; const a = keys[i], b = keys[i + 1], t = ss(a.p, b.p, p);
    return { pos: new THREE.Vector3().lerpVectors(a.pos, b.pos, t), look: new THREE.Vector3().lerpVectors(a.look, b.look, t) }; }
  const K = (p, pos, look) => ({ p, pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look) });
  function captions(sec, p) { sec.querySelectorAll('[data-at]').forEach((el) => { const [a, b] = el.dataset.at.split(',').map(Number); el.classList.toggle('on', p >= a && p < b); }); }
  function visLoop(sec, fn) { let lt = performance.now(); (function f(t) { requestAnimationFrame(f); const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) { lt = t; return; } fn(t / 1000, Math.min(0.1, (t - lt) / 1000)); lt = t; })(lt); }

  /* ======================= ERA 01 · TECH ROOM ======================= */
  function techRoom() {
    const sec = $('#techroom'), cv = $('#roomGL'); if (!sec || !cv) return;
    const r = renderer(cv, { shadows: true, exp: 0.85 }), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
    sc.fog = new THREE.Fog('#1a1030', 6, 14); sc.background = new THREE.Color('#140c24'); const anim = [];
    const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    sc.add(new THREE.AmbientLight('#3a2060', 0.18)); sc.add(new THREE.HemisphereLight('#7a5cff', '#ff7a3d', 0.08));
    // room shell
    const carpet = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#261a40'; x.fillRect(0, 0, w, h); const cs = ['#ff4fb8', '#3df5ff', '#ffd23f', '#9b5cff', '#ff7a3d'];
      for (let i = 0; i < 160; i++) { x.strokeStyle = cs[i % 5]; x.globalAlpha = 0.55; x.lineWidth = 3; x.beginPath(); const px = Math.random() * w, py = Math.random() * h, s = 8 + Math.random() * 14;
        if (i % 3 === 0) { x.moveTo(px, py - s); x.lineTo(px + s, py + s); x.lineTo(px - s, py + s); x.closePath(); } else if (i % 3 === 1) { x.moveTo(px - s, py); x.quadraticCurveTo(px, py - s, px + s, py); } else { x.arc(px, py, s / 3, 0, 7); } x.stroke(); } });
    carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(3, 3);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std('#ffffff', { map: carpet, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
    const wallM = std('#1e1530', { roughness: 0.9 });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.4), wallM); back.position.set(0, 1.7, -3); back.receiveShadow = true; sc.add(back);
    const left = back.clone(); left.rotation.y = Math.PI / 2; left.position.set(-3.5, 1.7, 0); sc.add(left);
    const right = back.clone(); right.rotation.y = -Math.PI / 2; right.position.set(3.5, 1.7, 0); sc.add(right);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std('#1a1228')); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.4; sc.add(ceil);
    // window with dusk city
    const city = canvasTex(512, 384, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1a5e'); g.addColorStop(0.55, '#ff6a8a'); g.addColorStop(0.8, '#ffb35a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) { const bw = 18 + Math.random() * 34, bh = 80 + Math.random() * 200, bx = i * 22; x.fillStyle = '#1a1030'; x.fillRect(bx, h - bh, bw, bh); x.fillStyle = '#ffd68a';
        for (let k = 0; k < 14; k++) if (Math.random() < 0.4) x.fillRect(bx + 3 + (k % 3) * 6, h - bh + 8 + Math.floor(k / 3) * 14, 3, 5); } });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshBasicMaterial({ map: city, toneMapped: false })); win.rotation.y = Math.PI / 2; win.position.set(-3.48, 1.9, -0.9); sc.add(win);
    const dusk = new THREE.PointLight('#ff7aa0', 1.2, 5); dusk.position.set(-3, 1.9, -0.9); sc.add(dusk);
    [[0, 0.68, 0, 1.9, 0.05], [0, -0.68, 0, 1.9, 0.05], [0, 0, 0.92, 0.05, 1.4], [0, 0, -0.92, 0.05, 1.4]].forEach(([dx, dy, dz, w, h]) => { const f = box(0.06, h, w, std('#d8cfbd')); f.position.set(-3.46, 1.9 + dy, -0.9 + dz); sc.add(f); });
    // desk
    const wood = std('#ffffff', { map: woodTex(), roughness: 0.5 }); const top = box(2.6, 0.07, 1.15, wood); top.position.set(0, 0.78, -2.35); sc.add(top);
    [[-1.2, -2.85], [1.2, -2.85], [-1.2, -1.85], [1.2, -1.85]].forEach(([x, z]) => { const l = box(0.06, 0.78, 0.06, std('#2a2a2a', { metalness: 0.6, roughness: 0.4 })); l.position.set(x, 0.39, z); sc.add(l); });
    // CRT monitor
    const beige = std('#d9d0bd', { roughness: 0.55 }); const mon = rbox(1.0, 0.82, 0.78, 0.07, beige); mon.position.set(0, 1.27, -2.45); sc.add(mon);
    const backT = rbox(0.72, 0.6, 0.5, 0.08, beige); backT.position.set(0, 1.27, -2.95); sc.add(backT);
    const stand = box(0.5, 0.06, 0.4, beige); stand.position.set(0, 0.85, -2.45); sc.add(stand);
    const code = `# navya_life.py
class Navya(Engineer, Marketer):
    def __init__(self):
        self.city   = "Bhopal"
        self.degree = "B.Tech Bioengineering, VIT"
        self.fuel   = ["chai", "lo-fi", "deadlines"]
        self.mummy_wanted = "doctor"   # close enough

    def morning(self):
        while not self.awake:
            self.chai += 1             # cutting, extra adrak

    def build(self, idea):
        model = train(idea, data="medical_scans")
        prompt = engineer("make AI behave")
        return ship(model, deadline="48h")

navya = Navya()
navya.build("something people need")
>>> ✓ deployed.  mummy notified.  chai refilled.`;
    const scr = canvasTex(1024, 768, () => {}); let lastN = -1;
    const kw = /\b(class|def|while|not|return|self)\b/g;
    function drawCode(n, blink) { const x = scr.userData.x; x.fillStyle = '#0b0f14'; x.fillRect(0, 0, 1024, 768); x.fillStyle = '#1a2230'; x.fillRect(0, 0, 1024, 36);
      x.fillStyle = '#ff5f57'; x.beginPath(); x.arc(22, 18, 7, 0, 7); x.fill(); x.fillStyle = '#febc2e'; x.beginPath(); x.arc(44, 18, 7, 0, 7); x.fill(); x.fillStyle = '#28c840'; x.beginPath(); x.arc(66, 18, 7, 0, 7); x.fill();
      x.fillStyle = '#8b98a8'; x.font = '18px "JetBrains Mono", monospace'; x.fillText('navya_life.py — ~/dreams', 96, 24);
      const txt = code.slice(0, n), lines = txt.split('\n'); x.font = '21px "JetBrains Mono", monospace';
      lines.forEach((ln, i) => { const y = 72 + i * 32; x.fillStyle = '#4a5568'; x.fillText(String(i + 1).padStart(2, ' '), 16, y); let col = '#e6edf3';
        if (ln.trim().startsWith('#') || ln.includes('# ')) col = '#e6edf3'; if (ln.startsWith('>>>')) col = '#3df58a';
        let xx = 62; const parts = ln.split(/(#.*$|"[^"]*"?|\b(?:class|def|while|not|return|self)\b)/); parts.forEach((pt) => { if (!pt) return;
          let c = col; if (pt.startsWith('#')) c = '#7d8590'; else if (pt.startsWith('"')) c = '#ffb35a'; else if (/^(class|def|while|not|return)$/.test(pt)) c = '#ff7ac0'; else if (pt === 'self') c = '#79c0ff';
          x.fillStyle = c; x.fillText(pt, xx, y); xx += x.measureText(pt).width; });
        if (i === lines.length - 1 && blink) { x.fillStyle = '#3df5ff'; x.fillRect(xx + 2, y - 18, 11, 22); } });
      x.fillStyle = 'rgba(255,255,255,.035)'; for (let y = 0; y < 768; y += 4) x.fillRect(0, y, 1024, 1); scr.needsUpdate = true; }
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); screen.position.set(0, 1.3, -2.055); sc.add(screen);
    const glow = new THREE.PointLight('#9fd8ff', 1.4, 3); glow.position.set(0, 1.3, -1.7); sc.add(glow);
    // sticky notes
    const note = (txt, col, pos, rz) => { const t = canvasTex(256, 256, (x) => { x.fillStyle = col; x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, 0, 256, 28); x.fillStyle = '#1b1b1b'; x.font = '44px Caveat, cursive'; x.textAlign = 'center';
        txt.split('\n').forEach((l, i) => x.fillText(l, 128, 90 + i * 50)); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), std('#ffffff', { map: t, roughness: 0.9 })); m.position.set(...pos); m.rotation.z = rz; sc.add(m); return t; };
    const notes = [note('chai first,\ncode later', '#ffe66d', [-0.56, 1.45, -2.05], 0.12), note('ship it,\nbeta', '#9fe3ff', [0.57, 1.47, -2.05], -0.08), note('mummy said\ndoctor.\nclose enough', '#ff9ac4', [0.55, 1.08, -2.05], 0.06)];
    // keyboard with pixel RGB keys
    const kb = box(0.95, 0.04, 0.32, std('#cfc6b3')); kb.position.set(0, 0.835, -1.95); sc.add(kb); const keyCols = ['#ff4fb8', '#3df5ff', '#ffd23f', '#9b5cff', '#ff7a3d', '#3df58a'], keys = [];
    for (let rI = 0; rI < 4; rI++) for (let i = 0; i < 14; i++) { const c = keyCols[(i + rI * 3) % 6]; const k = box(0.05, 0.028, 0.05, std('#2b2b38', { emissive: c, emissiveIntensity: 0.55 })); k.position.set(-0.41 + i * 0.063, 0.866, -2.07 + rI * 0.065); keys.push(k); sc.add(k); }
    const kbGlow = new THREE.PointLight('#ff4fb8', 0.8, 1.2); kbGlow.position.set(0, 0.9, -1.9); sc.add(kbGlow);
    // neon signs
    const font = window.Font && window.HELV_BOLD ? new Font(window.HELV_BOLD) : null;
    const neon = (txt, col, size, pos, ry = 0) => { if (!font) return; const g = new TextGeometry(txt, { font, size, height: 0.02, curveSegments: 6 }); g.center();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.4, toneMapped: false })); m.position.set(...pos); m.rotation.y = ry; sc.add(m);
      const l = new THREE.PointLight(col, 2.4, 4.5); l.position.set(pos[0] + (ry ? 0.4 : 0), pos[1] - 0.2, pos[2] + (ry ? 0 : 0.5)); sc.add(l); return m; };
    const n1 = neon('navya.exe', '#ff4fb8', 0.26, [0, 2.55, -2.97]); const n2 = neon('CODE ON', '#3df5ff', 0.17, [-3.46, 2.85, -0.9], Math.PI / 2);
    // posters
    const poster = (title, sub, c1, c2, pos, ry) => { const t = canvasTex(360, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, w, h);
        x.fillStyle = '#fff'; x.font = '64px Anton, sans-serif'; x.textAlign = 'center'; title.split('\n').forEach((l, i) => x.fillText(l, w / 2, 110 + i * 70)); x.font = '22px "JetBrains Mono", monospace'; x.fillText(sub, w / 2, h - 40);
        x.globalAlpha = 0.25; x.beginPath(); x.arc(w / 2, h * 0.62, 90, 0, 7); x.fill(); x.globalAlpha = 1; });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.88), std('#fff', { map: t, roughness: 0.7 })); m.position.set(...pos); m.rotation.y = ry; sc.add(m); };
    poster('PROMPT\nFIGHTER II', 'navya vs hallucinations', '#ff7a3d', '#7a1a5a', [-1.9, 1.85, -2.98], 0);
    poster('BACK TO\nTHE LAB', 'coming this semester', '#2a6bff', '#140c24', [1.95, 1.75, -2.98], 0);
    poster('I WANT TO\nDEPLOY', 'friday 5pm. trust me.', '#1f8a5a', '#0a1a10', [3.48, 1.8, -1.6], -Math.PI / 2);
    // arcade cabinet
    const arc = new THREE.Group(); const cab = box(0.75, 1.8, 0.7, std('#3a1a5e', { roughness: 0.4 })); cab.position.y = 0.9; arc.add(cab);
    const arcScr = canvasTex(256, 200, (x, w, h) => { x.fillStyle = '#0a0a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd23f'; x.font = '22px Silkscreen, monospace'; x.textAlign = 'center'; x.fillText('NAVYA', w / 2, 60); x.fillStyle = '#fff'; x.fillText('vs', w / 2, 100); x.fillStyle = '#ff4fb8'; x.fillText('DEADLINES', w / 2, 140); x.fillStyle = '#3df58a'; x.font = '14px Silkscreen'; x.fillText('INSERT CHAI', w / 2, 180); });
    const as = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.43), new THREE.MeshBasicMaterial({ map: arcScr, toneMapped: false })); as.position.set(0, 1.3, 0.356); arc.add(as);
    const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.16), new THREE.MeshStandardMaterial({ color: '#ff4fb8', emissive: '#ff4fb8', emissiveIntensity: 2, toneMapped: false })); mq.position.set(0, 1.68, 0.356); arc.add(mq);
    arc.position.set(2.75, 0, -2.45); arc.rotation.y = -0.5; sc.add(arc); const al = new THREE.PointLight('#9b5cff', 1.5, 3); al.position.set(2.5, 1.4, -1.9); sc.add(al);
    // lava lamp
    const lava = new THREE.Group(); const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 24), std('#c0c0c0', { metalness: 1, roughness: 0.2 })); lb.position.y = 0.05; lava.add(lb);
    const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.34, 32), new THREE.MeshPhysicalMaterial({ color: '#fff', transmission: 1, roughness: 0.05, thickness: 0.2, attenuationColor: new THREE.Color('#9b5cff'), attenuationDistance: 0.25 })); lg.position.y = 0.27; lava.add(lg);
    const blobs = []; for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.022 + i * 0.006, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff7a3d', emissive: '#ff7a3d', emissiveIntensity: 1.6, toneMapped: false })); b.userData.o = i; blobs.push(b); lava.add(b); }
    lava.position.set(1.0, 0.815, -2.5); sc.add(lava); const ll = new THREE.PointLight('#ff7a3d', 0.9, 1.5); ll.position.set(1.0, 1.1, -2.4); sc.add(ll);
    // chai on desk
    let chai = null; if (window.STUDIO_BUILDERS) { chai = window.STUDIO_BUILDERS.chai(); chai.scale.setScalar(0.07); chai.position.set(-0.85, 0.9, -2.2); sc.add(chai); }
    // digital clock 3:00 AM
    const clk = canvasTex(256, 96, (x) => { x.fillStyle = '#111'; x.fillRect(0, 0, 256, 96); x.fillStyle = '#ff3b3b'; x.font = '64px Silkscreen, monospace'; x.textAlign = 'center'; x.fillText('03:00', 128, 72); });
    const clock = box(0.26, 0.1, 0.08, std('#111')); clock.position.set(0.7, 0.86, -2.2); sc.add(clock); const cf = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.09), new THREE.MeshBasicMaterial({ map: clk, toneMapped: false })); cf.position.set(0.7, 0.86, -2.159); sc.add(cf);
    // shelf + books/cartridges
    const shelf = box(0.3, 0.04, 1.6, wood); shelf.position.set(3.3, 1.35, -0.6); sc.add(shelf); const bc = ['#ff4fb8', '#3df5ff', '#ffd23f', '#ff7a3d', '#9b5cff', '#3df58a', '#e8e8e8'];
    for (let i = 0; i < 14; i++) { const h = 0.18 + Math.random() * 0.14; const b = box(0.2, h, 0.08, std(bc[i % 7], { roughness: 0.7 })); b.position.set(3.3, 1.37 + h / 2, -1.3 + i * 0.1); sc.add(b); }
    // bean bag + controller, pizza, chair
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 32), std('#ffffff', { map: fabricTex('#6a3cff'), roughness: 0.95 })); bag.scale.set(1, 0.6, 1); bag.position.set(-1.8, 0.32, 0.1); bag.castShadow = true; sc.add(bag);
    const ctrl = box(0.18, 0.04, 0.1, std('#ffd23f')); ctrl.position.set(-1.75, 0.66, 0.1); ctrl.rotation.y = 0.5; sc.add(ctrl);
    const pz = box(0.5, 0.05, 0.5, std('#c98a4a', { roughness: 0.9 })); pz.position.set(1.3, 0.03, 0.5); pz.rotation.y = 0.3; sc.add(pz);
    const lid = box(0.5, 0.02, 0.5, std('#d99a5a', { roughness: 0.9 })); lid.position.set(1.42, 0.25, 0.22); lid.rotation.set(-1.0, 0.3, 0); sc.add(lid);
    const chair = new THREE.Group(); const seat = box(0.5, 0.08, 0.5, std('#18181f')); seat.position.set(0, 0.52, 0); chair.add(seat); const bk = box(0.5, 0.6, 0.06, std('#18181f')); bk.position.set(0, 0.85, 0.24); chair.add(bk);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12), std('#888', { metalness: 1, roughness: 0.3 })); pole.position.y = 0.25; chair.add(pole); chair.position.set(0.05, 0, -1.35); sc.add(chair);
    // desk lamp
    const lamp = new THREE.SpotLight('#ffcf8a', 2.2, 4, 0.7, 0.6); lamp.position.set(-1.0, 1.9, -2.0); lamp.target.position.set(-0.4, 0.8, -2.3); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); sc.add(lamp, lamp.target);

    /* --- reference details: GAME ON, monitor wall, retro TV, typing hands, clutter --- */
    const scrib = (x, w, h, t, col) => { x.fillStyle = '#05040a'; x.fillRect(0, 0, w, h); x.strokeStyle = col; x.shadowColor = col; x.shadowBlur = 12; x.lineWidth = 3;
      for (let k = 0; k < 5; k++) { x.beginPath(); for (let a = 0; a < 6.3; a += 0.1) { const rr = 30 + k * 14 + Math.sin(a * 5 + t * 2 + k) * 8; const px = w / 2 + Math.cos(a) * rr, py = h / 2 + Math.sin(a) * rr * 0.8; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } x.shadowBlur = 0; };
    const monCols = ['#ff4fb8', '#3df58a', '#3df5ff', '#ff7a3d', '#9b5cff', '#ffd23f'], mons = [];
    for (let i = 0; i < 6; i++) { const col = monCols[i], tx = canvasTex(256, 192, (x, w, h) => scrib(x, w, h, i, col)); const fr = rbox(0.62, 0.46, 0.06, 0.02, std('#15121c'));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.4), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); const gp = new THREE.Group(); gp.add(fr); m.position.z = 0.035; gp.add(m);
      gp.position.set(3.45, 1.55 + (i % 2) * 0.55, 0.3 + Math.floor(i / 2) * 0.68); gp.rotation.y = -Math.PI / 2 + (Math.random() - 0.5) * 0.1; sc.add(gp); mons.push([tx, col, i]);
      const ml = new THREE.PointLight(col, 0.5, 1.5); ml.position.set(3.1, gp.position.y, gp.position.z); sc.add(ml); }
    anim.push((t) => { if (Math.floor(t * 8) % 2) return; mons.forEach(([tx, col, i]) => { scrib(tx.userData.x, 256, 192, t + i, col); tx.needsUpdate = true; }); });
    neon('GAME ON', '#ff4fb8', 0.2, [-3.46, 2.05, 1.05], Math.PI / 2);
    const tvTex = canvasTex(320, 240, () => {}); const drawTV = (t) => { const x = tvTex.userData.x; x.fillStyle = '#5c94fc'; x.fillRect(0, 0, 320, 240); x.fillStyle = '#fff';
      for (let c = 0; c < 3; c++) { const cx = ((c * 130 - t * 20) % 420 + 420) % 420 - 60; x.fillRect(cx, 40 + c * 12, 50, 14); x.fillRect(cx + 10, 30 + c * 12, 30, 12); }
      x.fillStyle = '#c84c0c'; for (let b = 0; b < 12; b++) x.fillRect(((b * 32 - t * 40) % 384 + 384) % 384 - 32, 196, 30, 22); x.fillStyle = '#00a800'; const px = ((200 - t * 40) % 384 + 384) % 384 - 32; x.fillRect(px, 156, 36, 40); x.fillRect(px - 4, 150, 44, 10);
      const jy = Math.abs(Math.sin(t * 3)) * 36; x.fillStyle = '#ff4fb8'; x.fillRect(90, 172 - jy, 16, 20); x.fillStyle = '#ffcf9e'; x.fillRect(92, 160 - jy, 12, 12); x.fillStyle = '#1b1b1b'; x.fillRect(88, 158 - jy, 16, 5);
      x.fillStyle = '#fff'; x.font = '14px Silkscreen, monospace'; x.fillText('NAVYA  WORLD 1-1   CHAI x99', 10, 20); for (let y = 0; y < 240; y += 3) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, y, 320, 1); } tvTex.needsUpdate = true; };
    const tv = rbox(0.85, 0.65, 0.55, 0.06, std('#2a2420', { roughness: 0.4 })); tv.position.set(-2.55, 0.85, -2.4); tv.rotation.y = 0.5; sc.add(tv);
    const tvs = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false })); tvs.position.set(0, 0, 0.281); tv.add(tvs);
    const tvc = rbox(1.0, 0.5, 0.6, 0.03, std('#3a2a1e', { map: woodTex(), roughness: 0.5 })); tvc.position.set(-2.55, 0.25, -2.4); tvc.rotation.y = 0.5; sc.add(tvc);
    const tvl = new THREE.PointLight('#5c94fc', 0.9, 2.5); tvl.position.set(-2.2, 0.9, -1.9); sc.add(tvl); anim.push((t) => drawTV(t));
    if (window.STUDIO_BUILDERS) { const hands = [-1, 1].map((s) => { const h = window.STUDIO_BUILDERS.hand('#2448ff', '#ffc95e', 2); h.scale.setScalar(0.32); h.position.set(s * 0.2, 0.93, -1.86); h.rotation.set(-0.05, Math.PI + s * 0.25, 0); h.traverse((o) => { if (o.isMesh) o.castShadow = true; }); sc.add(h); return h; });
      anim.push((t) => hands.forEach((h, hi) => h.userData.fingers.forEach((f, i) => { f.rotation.x = 0.35 + Math.max(0, Math.sin(t * 14 + i * 1.9 + hi * 2.3)) * 0.35; }))); }
    const cup = new THREE.Group(); const ct = canvasTex(128, 128, (x) => { const cs = ['#ff4fb8', '#3df58a', '#ffd23f', '#3df5ff']; for (let i = 0; i < 8; i++) { x.fillStyle = cs[i % 4]; x.fillRect(0, i * 16, 128, 16); } });
    cup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.26, 32), std('#fff', { map: ct, roughness: 0.4 }))); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 12, 0, 6.3, 0, 1.4), new THREE.MeshPhysicalMaterial({ color: '#ff7ab0', transmission: 0.6, roughness: 0.1 })); dome.position.y = 0.13; cup.add(dome);
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), std('#ff3b5c')); straw.position.set(0.02, 0.25, 0); straw.rotation.z = 0.15; cup.add(straw); cup.position.set(-1.15, 0.13, 0.75); sc.add(cup);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16, 0, 6.3, Math.PI / 2, Math.PI / 2), std('#d7261e', { side: THREE.DoubleSide })); bowl.position.set(-1.0, 0.22, 0.45); sc.add(bowl);
    for (let i = 0; i < 70; i++) { const pc = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), std(i % 5 ? '#fff6e0' : '#ffd23f', { flatShading: true })); const a = Math.random() * 6.3, rr = Math.random() * 0.18; pc.position.set(-1.0 + Math.cos(a) * rr, 0.22 + Math.random() * 0.06, 0.45 + Math.sin(a) * rr); sc.add(pc); }
    const ballT = canvasTex(256, 128, (x) => { x.fillStyle = '#e8641e'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#2a1206'; x.lineWidth = 3; [0, 64, 128, 192].forEach((px) => { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 128); x.stroke(); }); x.beginPath(); x.moveTo(0, 64); x.lineTo(256, 64); x.stroke(); });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), std('#fff', { map: ballT, roughness: 0.7 })); ball.position.set(0.6, 0.15, 1.3); ball.castShadow = true; sc.add(ball);
    const skate = rbox(0.22, 0.85, 0.03, 0.01, std('#ff7a3d', { map: canvasTex(64, 256, (x) => { x.fillStyle = '#ff7a3d'; x.fillRect(0, 0, 64, 256); x.fillStyle = '#ffd23f'; x.font = '28px Anton'; x.save(); x.translate(40, 230); x.rotate(-Math.PI / 2); x.fillText('VIBE CODE', 0, 0); x.restore(); }) }));
    skate.position.set(2.0, 0.45, -2.85); skate.rotation.x = -0.18; sc.add(skate);
    anim.push(motes(sc, 260, [6, 3, 5, -0.5], '#ffd9ff'));
    const keys3 = [K(0, [0, 1.75, 3.0], [0, 1.25, -2]), K(0.3, [-1.5, 1.55, 0.7], [0.1, 1.2, -2.4]), K(0.58, [1.0, 1.45, -0.85], [0, 1.25, -2.3]), K(0.86, [0, 1.3, -1.42], [0, 1.3, -2.1]), K(1, [0, 1.3, -1.48], [0, 1.3, -2.1])];
    const mouse = { x: 0, y: 0 }; sec.addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
    document.fonts && document.fonts.ready.then(() => { notes.forEach((t) => { t.userData.draw(t.userData.x, 256, 256); t.needsUpdate = true; }); lastN = -1; });
    let saidZoom = false;
    visLoop(sec, (t) => { const p = prog(sec); captions(sec, p); const c = camPath(keys3, p); cam.position.copy(c.pos).add(new THREE.Vector3(mouse.x * 0.15, -mouse.y * 0.1, 0)); cam.lookAt(c.look);
      const n = Math.floor(clamp((p - 0.15) / 0.7) * code.length), blink = Math.floor(t * 2) % 2 === 0; if (n !== lastN || p > 0.84) { drawCode(n, blink); lastN = n; }
      keys.forEach((k, i) => { k.position.y = 0.866 - (Math.sin(t * 18 + i * 1.7) > 0.93 ? 0.008 : 0); k.material.emissiveIntensity = 0.45 + 0.35 * Math.sin(t * 2 + i * 0.3); });
      blobs.forEach((b) => { const o = b.userData.o; b.position.set(Math.sin(t + o) * 0.012, 0.15 + ((t * 0.08 + o * 0.25) % 1) * 0.25, Math.cos(t * 0.7 + o) * 0.012); });
      if (n1) n1.material.emissiveIntensity = 2.2 + Math.sin(t * 30) * (Math.sin(t * 0.7) > 0.95 ? 1.5 : 0.1); chai && chai.userData.update && chai.userData.update(t);
      if (p > 0.82 && !saidZoom) { saidZoom = true; say('zoom in. it\'s personal ✦'); }
      anim.forEach((f) => f(t)); r.render(sc, cam); });
  }

  /* ======================= ERA 02 · BIO LAB ======================= */
  function bioLab() {
    const sec = $('#labroom'), cv = $('#labGL'); if (!sec || !cv) return;
    const r = renderer(cv, { shadows: true, exp: 0.85 }), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
    sc.background = new THREE.Color('#071226'); sc.fog = new THREE.Fog('#071226', 5, 12); const anim = [];
    const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    sc.add(new THREE.AmbientLight('#1a3a7a', 0.15)); const key = new THREE.DirectionalLight('#9fd0ff', 0.9); key.position.set(-2, 5, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 3, bottom: -2 }); sc.add(key);
    const steel = std('#ffffff', { map: brushTex(), metalness: 0.75, roughness: 0.3, envMapIntensity: 0.5 });
    const bench = box(7, 0.1, 1.5, steel); bench.position.set(0, 0.9, 0); sc.add(bench); const cab = box(7, 0.85, 1.4, std('#0f2a4a', { roughness: 0.6 })); cab.position.set(0, 0.425, 0.02); sc.add(cab);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), std('#0b1d38', { roughness: 0.95 })); wall.position.set(0, 2.2, -1.2); sc.add(wall);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), std('#060f1f', { roughness: 0.4, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
    // shelf with bottles
    const shelf = box(7, 0.05, 0.4, steel); shelf.position.set(0, 2.05, -1.0); sc.add(shelf);
    const glassM = (c, d = 0.6) => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, roughness: 0.04, thickness: 0.3, ior: 1.5, attenuationColor: new THREE.Color(c), attenuationDistance: d, clearcoat: 1, envMapIntensity: 1.2 });
    const liqM = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.1, transmission: 0.55, thickness: 0.5, emissive: c, emissiveIntensity: 0.25, clearcoat: 1 });
    const lcols = ['#ff7a3d', '#2a7bff', '#9b5cff', '#ff3b5c', '#3df5c6', '#ffb000'];
    for (let i = 0; i < 16; i++) { const h = 0.22 + Math.random() * 0.2, rr = 0.06 + Math.random() * 0.04, x = -3.2 + i * 0.42; const b = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, h, 24), glassM('#e8f4ff', 3)); b.position.set(x, 2.08 + h / 2, -1.0); sc.add(b);
      const lq = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.9, rr * 0.9, h * 0.6, 24), liqM(lcols[i % 6])); lq.position.set(x, 2.08 + h * 0.3, -1.0); sc.add(lq); }
    // erlenmeyer flask
    const prof = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
    const flaskG = new THREE.LatheGeometry(prof([[0.0, 0], [0.42, 0], [0.45, 0.04], [0.12, 0.62], [0.11, 0.85], [0.13, 0.88]]), 64);
    const flask = new THREE.Mesh(flaskG, glassM('#eaf6ff', 4)); flask.position.set(-0.7, 0.95, 0.15); sc.add(flask);
    const flaskL = new THREE.Mesh(new THREE.LatheGeometry(prof([[0, 0.02], [0.4, 0.02], [0.42, 0.05], [0.25, 0.34], [0, 0.34]]), 48), liqM('#ff7a3d')); flaskL.position.copy(flask.position); sc.add(flaskL);
    // round-bottom flask on stand
    const rb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 32), glassM('#eaf6ff', 4)); rb.position.set(0.45, 1.42, 0.05); sc.add(rb);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 24, 1, true), glassM('#eaf6ff', 4)); neck.position.set(0.45, 1.9, 0.05); sc.add(neck);
    const rbL = new THREE.Mesh(new THREE.SphereGeometry(0.29, 48, 32, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), liqM('#2a7bff')); rbL.position.copy(rb.position); sc.add(rbL);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 12), steel); rod.position.set(0.85, 1.6, -0.2); sc.add(rod); const sb = box(0.5, 0.04, 0.35, steel); sb.position.set(0.75, 0.97, -0.1); sc.add(sb);
    const clamp1 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 12, 32), steel); clamp1.position.set(0.45, 1.95, 0.05); clamp1.rotation.x = Math.PI / 2; sc.add(clamp1);
    const arm = box(0.4, 0.03, 0.03, steel); arm.position.set(0.65, 1.95, -0.07); sc.add(arm);
    // test tube rack
    const rack = box(0.9, 0.05, 0.25, std('#e8e8e8')); rack.position.set(1.6, 1.2, 0.1); sc.add(rack); const rack2 = rack.clone(); rack2.position.y = 1.0; sc.add(rack2);
    const tubes = []; for (let i = 0; i < 5; i++) { const x = 1.25 + i * 0.18; const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 24), glassM('#eaf6ff', 4)); tb.position.set(x, 1.2, 0.1); sc.add(tb);
      const lq = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22 + i * 0.04, 24), liqM(lcols[(i + 2) % 6])); lq.position.set(x, 1.06 + (0.22 + i * 0.04) / 2, 0.1); sc.add(lq); tubes.push(lq); }
    // graduated cylinder
    const gc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.0, 32, 1, true), glassM('#eaf6ff', 5)); gc.position.set(2.55, 1.45, 0.0); sc.add(gc);
    const gcL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 32), liqM('#2a7bff')); gcL.position.set(2.55, 1.3, 0.0); sc.add(gcL);
    // microscope
    const mic = new THREE.Group(), dark = std('#1b2230', { roughness: 0.35, metalness: 0.4 }), chrome = std('#ffffff', { metalness: 1, roughness: 0.08 });
    const mb = box(0.5, 0.06, 0.4, dark); mb.position.y = 0.03; mic.add(mb); const ar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 32, Math.PI * 0.8), dark); ar.position.set(-0.1, 0.35, 0); ar.rotation.z = -0.3; mic.add(ar);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 24), chrome); tube.position.set(0.1, 0.55, 0); tube.rotation.z = 0.35; mic.add(tube); const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.15, 16), dark); eye.position.set(0.02, 0.8, 0); eye.rotation.z = 0.35; mic.add(eye);
    const stage = box(0.28, 0.03, 0.28, dark); stage.position.set(0.18, 0.28, 0); mic.add(stage); const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.1, 16), chrome); lens.position.set(0.19, 0.34, 0); mic.add(lens);
    mic.position.set(-1.9, 0.95, 0.05); mic.scale.setScalar(1.3); mic.traverse((o) => { if (o.isMesh) o.castShadow = true; }); sc.add(mic);
    // bubbles in flasks
    const bubM = new THREE.MeshPhysicalMaterial({ color: '#fff', transmission: 1, roughness: 0, thickness: 0.05 }), bubs = [];
    for (let i = 0; i < 40; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.012 + Math.random() * 0.012, 8, 6), bubM); b.userData = { o: Math.random(), w: i < 20 ? 0 : 1, a: Math.random() * 6.28, rr: Math.random() }; bubs.push(b); sc.add(b); }
    // holographic MRI scan panel
    const scan = canvasTex(640, 480, () => {}); function drawScan(t) { const x = scan.userData.x, w = 640, h = 480; x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(10,40,80,.35)'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(120,200,255,.15)'; for (let i = 0; i < w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let i = 0; i < h; i += 32) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
      x.save(); x.translate(250, 240); x.strokeStyle = '#9fe0ff'; x.lineWidth = 3; x.shadowColor = '#3db8ff'; x.shadowBlur = 14; x.beginPath(); x.ellipse(0, 0, 150, 185, 0, 0, 7); x.stroke(); x.lineWidth = 2; x.beginPath(); x.moveTo(0, -180); x.lineTo(0, 180); x.stroke();
      for (let k = 0; k < 9; k++) { x.beginPath(); const rr = 40 + k * 13; for (let a = 0; a <= 6.3; a += 0.05) { const wob = Math.sin(a * 11 + k * 1.7) * 6 + Math.sin(a * 23 + k) * 3, px = Math.cos(a) * (rr + wob) * 0.82, py = Math.sin(a) * (rr + wob); a ? x.lineTo(px, py) : x.moveTo(px, py); } x.globalAlpha = 0.25 + k * 0.06; x.stroke(); }
      x.globalAlpha = 1; const sy = ((t * 0.4) % 1) * 380 - 190; x.strokeStyle = '#ff7a3d'; x.shadowColor = '#ff7a3d'; x.lineWidth = 2; x.beginPath(); x.moveTo(-170, sy); x.lineTo(170, sy); x.stroke(); x.restore();
      x.shadowBlur = 0; x.fillStyle = '#9fe0ff'; x.font = '16px "JetBrains Mono", monospace'; x.fillText('MRI · AXIAL · NAVYA-NET v2', 430, 40); x.fillText('AI CONFIDENCE', 430, 90); x.font = '38px Silkscreen, monospace'; x.fillStyle = '#ff7a3d'; x.fillText((96 + Math.sin(t) * 1.4).toFixed(1) + '%', 430, 132);
      x.font = '14px "JetBrains Mono", monospace'; x.fillStyle = '#9fe0ff'; ['finding: curiosity ↑', 'sleep: not found', 'chai levels: optimal'].forEach((l, i) => x.fillText(l, 430, 190 + i * 26)); scan.needsUpdate = true; }
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ map: scan, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); panel.position.set(0.3, 2.85, -0.3); sc.add(panel);
    let dna = null; if (window.STUDIO_BUILDERS) { dna = window.STUDIO_BUILDERS.dna('#2a7bff'); dna.scale.setScalar(0.42); dna.position.set(-1.25, 2.75, -0.5); sc.add(dna); }
    const ol = new THREE.PointLight('#ff7a3d', 2, 2.5); ol.position.set(-0.7, 1.4, 0.6); sc.add(ol); const bl = new THREE.PointLight('#3db8ff', 2.4, 4); bl.position.set(0.3, 2.6, 0.4); sc.add(bl);

    /* --- reference details: robot hand writing in a book, x-ray hand --- */
    const pageL = canvasTex(512, 640, (x) => { x.fillStyle = '#f3ead6'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#2a2a2a'; x.font = '22px "JetBrains Mono", monospace'; for (let i = 0; i < 9; i++) { let l = ''; for (let k = 0; k < 28; k++) l += Math.random() < 0.5 ? '0' : '1'; x.fillText(l, 40, 80 + i * 34); }
      x.fillStyle = '#c4271c'; x.font = '24px Caveat, cursive'; ['want and', 'at least', 'release every', 'in this cell', 'work for', 'the patient'].forEach((l, i) => x.fillText(l, 60, 420 + i * 30)); });
    const pageR = canvasTex(512, 640, () => {}); const textR = 'in and out, every single day, every hour, minute and moment we must inhale, whether we like it or not. even as we plan to aspire, our hopes depend on breath.';
    const drawR = (n) => { const x = pageR.userData.x; x.fillStyle = '#f5edda'; x.fillRect(0, 0, 512, 640); x.fillStyle = '#c4271c'; x.font = '30px Caveat, cursive'; const words = textR.slice(0, n).split(' '); let line = '', y = 70;
      words.forEach((w) => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > 420) { x.fillText(line, 40, y); y += 40; line = w; } else line = t; }); x.fillText(line, 40, y); pageR.needsUpdate = true; return [40 + x.measureText(line).width, y]; };
    const book = new THREE.Group(); const cover = rbox(1.25, 0.04, 0.85, 0.01, std('#7a2a1e', { roughness: 0.6 })); book.add(cover);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), std('#fff', { map: pageL, roughness: 0.9 })); pl.rotation.set(-Math.PI / 2, 0, 0.0); pl.position.set(-0.31, 0.035, 0); pl.rotation.y = 0.04; book.add(pl);
    const pr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), std('#fff', { map: pageR, roughness: 0.9 })); pr.rotation.set(-Math.PI / 2, 0, 0); pr.position.set(0.31, 0.035, 0); pr.rotation.y = -0.04; book.add(pr);
    book.position.set(-0.05, 0.98, 0.45); book.rotation.y = 0.05; sc.add(book);
    const chromeM = std('#ffffff', { metalness: 1, roughness: 0.12, envMapIntensity: 1 }), robo = new THREE.Group(), joints = [];
    const ra = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.8, 16), chromeM); ra.rotation.z = Math.PI / 2; ra.position.x = -0.45; robo.add(ra);
    const rp = rbox(0.18, 0.06, 0.16, 0.02, chromeM); robo.add(rp);
    for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(0.09, 0, -0.06 + i * 0.04); const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 10), chromeM); s1.rotation.z = Math.PI / 2; s1.position.x = 0.045; f.add(s1);
      const j = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), std('#333', { metalness: 0.8, roughness: 0.3 })); j.position.x = 0.09; f.add(j); f.rotation.z = -0.6; robo.add(f); joints.push(f); }
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.22, 12), std('#2a3a8a', { metalness: 0.4, roughness: 0.3 })); pen.position.set(0.12, -0.06, 0.02); pen.rotation.z = -0.5; robo.add(pen);
    robo.position.set(0.35, 1.12, 0.45); sc.add(robo); robo.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    let wrote = -1; anim.push((t) => { const n = Math.floor(((t * 6) % (textR.length + 30))); if (n !== wrote && n <= textR.length) { const [cx, cy] = drawR(n); wrote = n; robo.position.x = 0.04 + (cx / 512) * 0.6 + 0.06; robo.position.z = 0.45 - 0.4 + (cy / 640) * 0.8; }
      robo.position.y = 1.1 + Math.abs(Math.sin(t * 12)) * 0.012; joints.forEach((j, i) => { j.rotation.z = -0.7 + Math.sin(t * 6 + i) * 0.08; }); });
    const xr = canvasTex(400, 520, () => {}); const drawX = (t) => { const x = xr.userData.x; x.clearRect(0, 0, 400, 520); x.fillStyle = 'rgba(10,40,90,.35)'; x.fillRect(0, 0, 400, 520); x.strokeStyle = '#cfefff'; x.shadowColor = '#5ec8ff'; x.shadowBlur = 12; x.lineCap = 'round';
      const bone = (x1, y1, x2, y2, w) => { x.lineWidth = w; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
      bone(160, 500, 175, 380, 22); bone(240, 500, 228, 380, 20); [[120, 300], [165, 280], [210, 280], [255, 295]].forEach(([fx, fy], i) => { bone(170 + i * 18, 375, fx, fy, 12); bone(fx, fy, fx - 4 + i * 2, fy - 70, 10); bone(fx - 4 + i * 2, fy - 70, fx - 6 + i * 3, fy - 120, 8); });
      bone(150, 380, 95, 330, 12); bone(95, 330, 70, 280, 10); x.shadowBlur = 0; x.fillStyle = '#9fe0ff'; x.font = '14px "JetBrains Mono"'; x.fillText('X-RAY · L HAND · NAVYA-NET', 14, 22); x.fillStyle = '#ff7a3d'; x.fillText('fracture: none. vibes: healed', 14, 508);
      const sy = ((t * 0.5) % 1) * 520; x.fillStyle = 'rgba(255,122,61,.5)'; x.fillRect(0, sy, 400, 2); xr.needsUpdate = true; };
    const xp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.17), new THREE.MeshBasicMaterial({ map: xr, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); xp.position.set(2.3, 2.75, -0.4); xp.rotation.y = -0.3; sc.add(xp);
    let xf = 0; anim.push((t) => { xf++; if (xf % 3 === 0) drawX(t); });
    anim.push(motes(sc, 220, [7, 3.5, 3, 0], '#9fd8ff'));
    const keys3 = [K(0, [-3.2, 1.7, 2.3], [-1.9, 1.2, 0]), K(0.25, [-1.2, 1.55, 1.8], [-0.7, 1.2, 0.1]), K(0.45, [0.6, 1.6, 1.8], [0.6, 1.3, 0]), K(0.62, [1.9, 1.55, 1.7], [1.8, 1.2, 0]), K(0.8, [0.4, 2.5, 2.4], [0.3, 2.6, -0.3]), K(1, [0.3, 2.8, 0.7], [0.3, 2.85, -0.3])];
    const mouse = { x: 0, y: 0 }; sec.addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
    let fl = 0; visLoop(sec, (t, dt) => { const p = prog(sec); captions(sec, p); const c = camPath(keys3, p); cam.position.copy(c.pos).add(new THREE.Vector3(mouse.x * 0.2, -mouse.y * 0.12, 0)); cam.lookAt(c.look);
      bubs.forEach((b) => { const u = b.userData, k = (u.o + t * 0.25) % 1; if (u.w === 0) b.position.set(-0.7 + Math.cos(u.a) * u.rr * 0.25 * (1 - k), 0.98 + k * 0.32, 0.15 + Math.sin(u.a) * u.rr * 0.25 * (1 - k)); else b.position.set(0.45 + Math.cos(u.a) * u.rr * 0.2, 1.2 + k * 0.25, 0.05 + Math.sin(u.a) * u.rr * 0.2); });
      fl += dt; if (fl > 0.05) { drawScan(t); fl = 0; } panel.material.opacity = 0.85 + Math.sin(t * 40) * 0.05; dna && dna.userData.update && dna.userData.update(t);
      tubes.forEach((l, i) => { l.material.emissiveIntensity = 0.2 + 0.15 * Math.sin(t * 2 + i); });
      anim.forEach((f) => f(t)); r.render(sc, cam); });
  }

  /* ======================= EXPLODING ERA TRANSITIONS ======================= */
  function transitions() {
    const secs = [...$$('section.tx')], cv = $('#txGL'); if (!secs.length || !cv || !window.Font) return;
    const r = renderer(cv, { exp: 1.2 }), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); cam.position.set(0, 0, 12);
    const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; const font = new Font(window.HELV_BOLD);
    function shatter(text, col) { let g = new TextGeometry(text, { font, size: 1.5, height: 0.5, curveSegments: 5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05, bevelSegments: 2 }); g.center(); g = g.toNonIndexed(); g.computeBoundingBox();
      const pos = g.attributes.position, n = pos.count, cen = new Float32Array(n * 3), dir = new Float32Array(n * 3), rnd = new Float32Array(n);
      for (let i = 0; i < n; i += 3) { const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
        const d = new THREE.Vector3(cx * 0.3 + (Math.random() - 0.5) * 2, cy * 0.3 + (Math.random() - 0.5) * 2, 1 + Math.random() * 2).normalize(), rr = Math.random();
        for (let k = 0; k < 3; k++) { cen.set([cx, cy, cz], (i + k) * 3); dir.set([d.x, d.y, d.z], (i + k) * 3); rnd[i + k] = rr; } }
      g.setAttribute('aCen', new THREE.BufferAttribute(cen, 3)); g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
      const m = new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.2, flatShading: true }); m.userData.u = { uE: { value: 0 } };
      m.onBeforeCompile = (s) => { s.uniforms.uE = m.userData.u.uE; s.vertexShader = 'attribute vec3 aCen;attribute vec3 aDir;attribute float aRnd;uniform float uE;\nmat3 rotA(vec3 a,float t){a=normalize(a);float s=sin(t),c=cos(t),o=1.-c;return mat3(o*a.x*a.x+c,o*a.x*a.y+a.z*s,o*a.z*a.x-a.y*s,o*a.x*a.y-a.z*s,o*a.y*a.y+c,o*a.y*a.z+a.x*s,o*a.z*a.x+a.y*s,o*a.y*a.z-a.x*s,o*a.z*a.z+c);}\n' + s.vertexShader;
        s.vertexShader = s.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nmat3 R=rotA(aDir.yxz+vec3(.1),uE*aRnd*9.);objectNormal=R*objectNormal;')
          .replace('#include <begin_vertex>', 'vec3 transformed=aCen+R*(position-aCen)*(1.-uE*.35)+aDir*uE*(5.+aRnd*11.)+vec3(0.,-uE*uE*3.,0.);'); };
      const mesh = new THREE.Mesh(g, m); const w = g.boundingBox.max.x - g.boundingBox.min.x; mesh.userData.w = w; return mesh; }
    const pts = new THREE.BufferGeometry(), N = 1600, pp = new Float32Array(N * 3), pv = []; for (let i = 0; i < N; i++) { const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(0.3 + Math.random()); pv.push(v); }
    pts.setAttribute('position', new THREE.BufferAttribute(pp, 3)); const pm2 = new THREE.PointsMaterial({ size: 0.09, color: '#ffd23f', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); const sparks = new THREE.Points(pts, pm2); sc.add(sparks);
    sc.add(new THREE.AmbientLight('#ffffff', 0.4)); const l1 = new THREE.PointLight('#ffffff', 3, 40); l1.position.set(4, 4, 8); sc.add(l1); const l2 = new THREE.PointLight('#ff7a3d', 3, 40); l2.position.set(-5, -2, 6); sc.add(l2);
    const built = new Map(); let active = null;
    secs.forEach((s) => built.set(s, { from: shatter(s.dataset.from, s.dataset.fc || '#ffffff'), to: shatter(s.dataset.to, s.dataset.tc || '#ffffff'), c1: new THREE.Color(s.dataset.c1), c2: new THREE.Color(s.dataset.c2), boomed: false }));
    const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
    const flash = $('#txFlash'), bg = new THREE.Color();
    (function f(t) { requestAnimationFrame(f); let cur = null; secs.forEach((s) => { const rr = s.getBoundingClientRect(); if (rr.top < innerHeight * 0.5 && rr.bottom > innerHeight * 0.5) cur = s; });
      cv.classList.toggle('on', !!cur); if (!cur) { flash.style.opacity = 0; return; }
      const d = built.get(cur); if (active !== cur) { if (active) { sc.remove(built.get(active).from, built.get(active).to); } sc.add(d.from, d.to); active = cur; }
      const p = prog(cur), tt = t / 1000; const vw = 2 * Math.tan(cam.fov * Math.PI / 360) * cam.position.z * cam.aspect;
      [d.from, d.to].forEach((m) => m.scale.setScalar(Math.min(1.4, (vw * 0.82) / m.userData.w)));
      d.from.material.userData.u.uE.value = ss(0.18, 0.55, p); d.to.material.userData.u.uE.value = 1 - ss(0.5, 0.86, p); d.to.visible = p > 0.45; d.from.visible = p < 0.62;
      d.from.rotation.y = Math.sin(tt * 0.8) * 0.12; d.to.rotation.y = Math.sin(tt * 0.8 + 1) * 0.12;
      const b = ss(0.36, 0.75, p), boom = Math.exp(-Math.pow((p - 0.5) / 0.05, 2)); for (let i = 0; i < N; i++) { const v = pv[i]; pp[i * 3] = v.x * b * 14; pp[i * 3 + 1] = v.y * b * 9 - b * b * 2; pp[i * 3 + 2] = v.z * b * 6; }
      pts.attributes.position.needsUpdate = true; pm2.opacity = Math.sin(clamp(b) * Math.PI); pm2.color.set(p < 0.5 ? (cur.dataset.fc || '#fff') : (cur.dataset.tc || '#fff'));
      bg.copy(d.c1).lerp(d.c2, ss(0.47, 0.53, p)); r.setClearColor(bg, 1); cam.position.x = Math.sin(tt * 60) * boom * 0.35; cam.position.y = Math.cos(tt * 53) * boom * 0.3; cam.rotation.z = Math.sin(tt * 40) * boom * 0.03;
      flash.style.opacity = boom * 0.9; captions(cur, p); if (p > 0.48 && !d.boomed) { d.boomed = true; say(cur.dataset.boom || 'BOOM 💥 era change ho gaya'); } if (p < 0.3) d.boomed = false;
      r.render(sc, cam); })(0);
  }

  /* ======================= ERA 03 · MARKETING GIRL ======================= */
  function marketing() {
    if (!window.makeStudio) return;
    const mk = (id, obj, opts = {}) => { const cv = $(id); if (!cv) return null; const s = makeStudio(cv, Object.assign({ transparent: true, items: [{ obj, bg: ['#000', '#000'], rim: '#ffffff' }] }, opts)); s.set(0, true); return s; };
    const signS = mk('#signGL', 'placard'), chaiS = mk('#chaiGL', 'kulhads'), boomS = mk('#boomGL', 'boombox'), autoS = mk('#autoGL', 'auto'), typeS = mk('#typeGL', 'typewriter');
    const takes = ['hot take: your brand doesn\'t need more posts. it needs a better story.', 'hook in 1.5 seconds or the thumb wins. every time.', 'carousels > reels for saves. reels > carousels for reach. use both, beta.',
      'nobody reads captions. everyone reads the first line. make it spicy.', 'your audience isn\'t "everyone". even maggi has a target customer.', 'consistency beats virality. virality is a bonus, like extra chutney.'];
    let ti = 0; const tk = $('#takeTxt'); $('#spillBtn') && $('#spillBtn').addEventListener('click', () => { tk.textContent = takes[ti++ % takes.length]; tk.classList.remove('pop'); void tk.offsetWidth; tk.classList.add('pop'); });
    const boomPanel = $('#boomPanel'); boomPanel && boomPanel.addEventListener('click', () => { const g = boomS && boomS.inner(); if (!g) return; g.userData.beat = g.userData.beat > 1 ? 1 : 2.2;
      say(g.userData.beat > 1 ? '🎵 now playing: "brand ki kahani" – navya ft. the algorithm' : 'volume kam kar do, neighbours complaining 🙉'); });
    const autoPanel = $('#autoPanel'); autoPanel && autoPanel.addEventListener('click', () => say('POM POM 📯 bhaiya, contact section chaloge?'));
    const typePanel = $('#typePanel');
    const sign = $('#signBoard'), lines = ['YOUR CONTENT NEEDS TO TELL A STORY', 'POST LESS. SAY MORE.', 'BRANDS ARE JUST PEOPLE WITH LOGOS', 'IF IT DOESN\'T STOP THE SCROLL, IT DOESN\'T EXIST', 'HIRE THE GIRL WITH THE SIGN'];
    let si = 0; const sp = $('#signPanel'); sp && signS && sp.addEventListener('click', () => { const g = signS.inner(); if (!g) return; g.userData.flip = 1; si = (si + 1) % lines.length; setTimeout(() => g.userData.draw(lines[si]), 280); });
    sign && sign.addEventListener('click', () => { sign.classList.add('flip'); setTimeout(() => { si = (si + 1) % lines.length; $('#signTxt').textContent = lines[si]; sign.classList.remove('flip'); }, 250); });
    (function f() { requestAnimationFrame(f);
      if (autoPanel && autoS) { const g = autoS.inner(); if (g) { const rr = autoPanel.getBoundingClientRect(), p = clamp((innerHeight - rr.top) / (innerHeight + rr.height)); g.userData.x = lerp(-6.5, 6.5, p); } }
      if (typePanel && typeS) { const g = typeS.inner(); if (g) { const rr = typePanel.getBoundingClientRect(), p = clamp((innerHeight * 0.95 - rr.top) / (rr.height * 0.9)); g.userData.n = p * g.userData.text.length; } } })();
  }

  /* ======================= ERA PICKER ======================= */
  function picker() { $$('.era-card').forEach((c) => { c.addEventListener('pointermove', (e) => { const b = c.getBoundingClientRect(); c.style.transform = `perspective(800px) rotateY(${((e.clientX - b.left) / b.width - 0.5) * 14}deg) rotateX(${-((e.clientY - b.top) / b.height - 0.5) * 10}deg) translateY(-6px)`; });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; }); }); }

  const start = () => { [techRoom, bioLab, transitions, marketing, picker].forEach((fn) => { try { fn(); } catch (e) { console.error('era init failed:', fn.name, e); } }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
