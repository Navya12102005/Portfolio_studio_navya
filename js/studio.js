/* Realistic 3D studio: glass, chrome, gold, iridescent objects with soft shadows.
   makeStudio(canvas, {items:[{obj, bg:[top,bottom], rim, c}], offsetX, preserve}) -> {set(i, instant), render()} */
(function () {
  const M = {
    glass: (c, ad = 1.4) => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, roughness: 0.03, thickness: 1.4, ior: 1.5,
      attenuationColor: new THREE.Color(c), attenuationDistance: ad, specularIntensity: 1, envMapIntensity: 1.3, clearcoat: 1, clearcoatRoughness: 0.04 }),
    chrome: () => new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.05 }),
    gold: () => new THREE.MeshStandardMaterial({ color: '#ffc95e', metalness: 1, roughness: 0.17 }),
    iri: (c = '#ffffff') => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.02, transmission: 1, thickness: 0.25, ior: 1.25,
      iridescence: 1, iridescenceIOR: 1.45, iridescenceThicknessRange: [180, 820], clearcoat: 1, envMapIntensity: 1.4 }),
    emit: (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2.6 }),
    ceramic: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
  };
  const mesh = (g, m) => { const o = new THREE.Mesh(g, m); o.castShadow = true; return o; };

  const B = {
    dna(c = '#3df5c6') {
      const g = new THREE.Group(), sg = new THREE.SphereGeometry(0.15, 32, 16), gm = M.glass(c, 0.6), cm = M.chrome();
      for (let i = 0; i < 26; i++) {
        const t = i * 0.48, y = (i - 12.5) * 0.12, a = new THREE.Vector3(Math.cos(t) * 0.75, y, Math.sin(t) * 0.75), b = a.clone().multiply(new THREE.Vector3(-1, 1, -1));
        const s1 = mesh(sg, gm); s1.position.copy(a); const s2 = mesh(sg, cm); s2.position.copy(b); g.add(s1, s2);
        if (i % 2 === 0) { const len = a.distanceTo(b), cyl = mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), cm); cyl.position.copy(a).add(b).multiplyScalar(0.5);
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.add(cyl); }
      }
      g.rotation.z = 0.35; g.userData.update = (t) => { g.rotation.y = t * 0.5; }; return g;
    },
    blob() {
      const geo = new THREE.SphereGeometry(1.25, 160, 120), base = geo.attributes.position.array.slice(), m = mesh(geo, M.chrome()), g = new THREE.Group(); g.add(m);
      g.userData.update = (t) => {
        const p = geo.attributes.position.array;
        for (let i = 0; i < p.length; i += 3) { const x = base[i], y = base[i + 1], z = base[i + 2];
          const k = 1 + 0.11 * Math.sin(2.6 * x + t * 1.1) * Math.sin(2.9 * y + t * 1.3) * Math.sin(2.4 * z + t * 0.8) + 0.04 * Math.sin(6 * y + t * 2);
          p[i] = x * k; p[i + 1] = y * k; p[i + 2] = z * k; }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); g.rotation.y = t * 0.2;
      }; return g;
    },
    bubbles() {
      const g = new THREE.Group(), d = [[0, 0.1, 0, 1.05], [-1.2, -0.6, 0.4, 0.55], [1.15, 0.75, -0.3, 0.45], [0.9, -0.95, 0.6, 0.3]];
      d.forEach(([x, y, z, r], i) => { const s = mesh(new THREE.SphereGeometry(r, 64, 48), M.iri()); s.position.set(x, y, z); s.userData.y0 = y; s.userData.ph = i; g.add(s); });
      g.userData.update = (t) => g.children.forEach((s) => { s.position.y = s.userData.y0 + Math.sin(t * 0.9 + s.userData.ph * 1.7) * 0.12; }); return g;
    },
    orb(c = '#3df5c6') {
      const g = new THREE.Group(); g.add(mesh(new THREE.SphereGeometry(1.25, 64, 48), M.glass('#e8fbff', 6)));
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 3), M.emit(c)); g.add(core);
      const light = new THREE.PointLight(c, 3, 6); g.add(light);
      const ring = mesh(new THREE.TorusGeometry(1.7, 0.035, 16, 160), M.chrome()); ring.rotation.x = 1.2; g.add(ring);
      const ring2 = mesh(new THREE.TorusGeometry(1.9, 0.02, 16, 160), M.gold()); ring2.rotation.set(1.6, 0.4, 0); g.add(ring2);
      g.userData.update = (t) => { ring.rotation.z = t * 0.4; ring2.rotation.z = -t * 0.3; core.rotation.y = t; core.scale.setScalar(1 + 0.06 * Math.sin(t * 3)); }; return g;
    },
    bars(c = '#ff6ec7') {
      const g = new THREE.Group(), H = [0.7, 1.2, 1.9, 2.9];
      H.forEach((h, i) => { const m = mesh(new THREE.CylinderGeometry(0.32, 0.32, 1, 48), i % 2 ? M.chrome() : M.glass(c, 0.7)); m.position.x = (i - 1.5) * 0.85; m.userData.h = h; g.add(m); });
      const arrow = mesh(new THREE.ConeGeometry(0.28, 0.5, 48), M.gold()); g.add(arrow);
      g.userData.t0 = null; g.userData.update = (t) => { if (g.userData.t0 === null) g.userData.t0 = t; const e = Math.min(1, (t - g.userData.t0) / 1.6), k = 1 - Math.pow(1 - e, 3);
        g.children.forEach((m) => { if (m.userData.h) { const h = Math.max(0.01, m.userData.h * k); m.scale.y = h; m.position.y = -1.5 + h / 2; } });
        arrow.position.set(1.5 * 0.85, -1.5 + 2.9 * k + 0.35, 0); g.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.25; }; return g;
    },
    hourglass() {
      const g = new THREE.Group(), pts = [];
      for (let i = 0; i <= 40; i++) { const y = -1.3 + i * 0.065, r = 0.12 + 0.85 * Math.pow(Math.abs(y) / 1.3, 0.8); pts.push(new THREE.Vector2(r, y)); }
      g.add(mesh(new THREE.LatheGeometry(pts, 96), M.glass('#fff1d6', 5)));
      const sand = M.ceramic('#e9b45a'); const top = mesh(new THREE.ConeGeometry(0.62, 0.7, 64), sand); top.rotation.x = Math.PI; top.position.y = 0.55;
      const bot = mesh(new THREE.ConeGeometry(0.8, 0.55, 64), sand); bot.position.y = -1.0; g.add(top, bot);
      [-1.42, 1.42].forEach((y) => { const cap = mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.16, 64), M.gold()); cap.position.y = y; g.add(cap); });
      g.rotation.z = 0.15; g.userData.update = (t) => { g.rotation.y = t * 0.3; }; return g;
    },
    gem() {
      const g = new THREE.Group(), core = mesh(new THREE.IcosahedronGeometry(1.15, 0), Object.assign(M.chrome(), { flatShading: true })); g.add(core);
      for (let i = 0; i < 6; i++) { const s = mesh(new THREE.OctahedronGeometry(0.16, 0), Object.assign(M.gold(), { flatShading: true })); s.userData.a = (i / 6) * Math.PI * 2; g.add(s); }
      g.userData.update = (t) => { core.rotation.set(t * 0.3, t * 0.45, 0); g.children.forEach((s) => { if (s.userData.a !== undefined) { const a = s.userData.a + t * 0.7;
        s.position.set(Math.cos(a) * 1.9, Math.sin(a * 2) * 0.35, Math.sin(a) * 1.9); s.rotation.y = t * 2; } }); }; return g;
    },
    knot(c = '#ffb347') { const g = new THREE.Group(); g.add(mesh(new THREE.TorusKnotGeometry(0.85, 0.3, 260, 40), M.glass(c, 0.9))); g.userData.update = (t) => { g.rotation.set(t * 0.2, t * 0.35, 0); }; return g; },
    coin() {
      const g = new THREE.Group(), c = mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.22, 96), M.gold()); c.rotation.x = Math.PI / 2; g.add(c);
      const rim = mesh(new THREE.TorusGeometry(1.25, 0.07, 24, 120), M.gold()); g.add(rim);
      if (window.Font && window.HELV_BOLD) { const tg = new TextGeometry('N', { font: new Font(window.HELV_BOLD), size: 1.1, height: 0.16, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4 });
        tg.center(); const n1 = mesh(tg, M.gold()); n1.position.z = 0.16; const n2 = mesh(tg, M.gold()); n2.position.z = -0.16; n2.rotation.y = Math.PI; g.add(n1, n2); }
      g.userData.update = (t) => { g.rotation.y = t * 0.8; g.position.y = Math.sin(t * 1.2) * 0.08; }; return g;
    },
    kulhads() {
      const g = new THREE.Group(), pts = [];
      [[0,-0.62],[0.42,-0.62],[0.46,-0.55],[0.72,0.5],[0.76,0.6],[0.7,0.62],[0.65,0.52],[0.41,-0.5],[0,-0.5]].forEach(([x,y])=>pts.push(new THREE.Vector2(x,y)));
      const clay = new THREE.MeshStandardMaterial({ color: '#b5562b', roughness: 0.82 }), geo = new THREE.LatheGeometry(pts, 64);
      const cups = [-0.85, 0.85].map((x, i) => { const c = new THREE.Group(); c.add(mesh(geo, clay));
        const top = mesh(new THREE.CircleGeometry(0.66, 48), M.ceramic('#c8945e')); top.rotation.x = -Math.PI / 2; top.position.y = 0.47; c.add(top);
        for (let k = 0; k < 26; k++) { const r = Math.sqrt(Math.random()) * 0.55, a = Math.random() * 6.28, b = mesh(new THREE.SphereGeometry(0.025 + Math.random() * 0.04, 10, 8), M.ceramic('#e6c391')); b.position.set(Math.cos(a) * r, 0.48, Math.sin(a) * r); b.scale.y = 0.5; c.add(b); }
        c.position.x = x; c.userData.s = i ? -1 : 1; g.add(c); return c; });
      g.userData.update = (t) => { const k = Math.max(0, Math.sin(t * 1.6)) ** 6; cups.forEach((c) => { c.rotation.z = -c.userData.s * (0.25 + 0.2 * k); c.position.x = c.userData.s * -(0.95 - 0.12 * k); c.position.y = Math.sin(t * 1.2 + c.userData.s) * 0.05; }); g.rotation.y = Math.sin(t * 0.4) * 0.3; g.rotation.x = 0.35; };
      return g;
    },
    boombox() {
      const g = new THREE.Group(), cream = M.ceramic('#e8dcc0'), dark = new THREE.MeshStandardMaterial({ color: '#232323', roughness: 0.92 });
      const body = mesh(new THREE.BoxGeometry(3.2, 1.6, 0.75), cream); g.add(body);
      const strip = mesh(new THREE.BoxGeometry(3.22, 0.28, 0.77), M.ceramic('#1c1c1c')); strip.position.y = 0.62; g.add(strip);
      const cones = [-1.05, 1.05].map((x) => { const sp = new THREE.Group(); const grill = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 48), dark); grill.rotation.x = Math.PI / 2; sp.add(grill);
        const rim = mesh(new THREE.TorusGeometry(0.57, 0.05, 16, 64), M.chrome()); sp.add(rim); const cap = mesh(new THREE.SphereGeometry(0.16, 24, 16), M.chrome()); cap.scale.z = 0.4; cap.position.z = 0.05; sp.add(cap);
        sp.position.set(x, -0.12, 0.39); g.add(sp); return sp; });
      const win = mesh(new THREE.BoxGeometry(0.9, 0.5, 0.05), new THREE.MeshPhysicalMaterial({ color: '#111', roughness: 0.05, metalness: 0.2, clearcoat: 1 })); win.position.set(0, -0.15, 0.38); g.add(win);
      for (let i = 0; i < 6; i++) { const b = mesh(new THREE.BoxGeometry(0.16, 0.08, 0.14), M.ceramic(i % 2 ? '#c43d12' : '#3a3a3a')); b.position.set(-0.45 + i * 0.18, 0.84, 0.05); g.add(b); }
      const handle = mesh(new THREE.TorusGeometry(1.1, 0.06, 16, 64, Math.PI), M.chrome()); handle.position.y = 0.8; g.add(handle);
      const ant = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), M.chrome()); ant.position.set(1.3, 1.5, -0.2); ant.rotation.z = -0.5; g.add(ant);
      g.userData.beat = 1; g.rotation.z = -0.18;
      g.userData.update = (t) => { const b = g.userData.beat, k = Math.abs(Math.sin(t * 4 * b)); g.position.y = k * 0.1; cones.forEach((c) => c.scale.setScalar(1 + k * 0.06 * b)); g.rotation.y = Math.sin(t * 0.6) * 0.35; };
      return g;
    },
    auto() {
      const g = new THREE.Group(), red = M.ceramic('#d7261e'), yel = M.ceramic('#ffb000'), grn = M.ceramic('#1f8a5a'), black = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.7 });
      const sh = new THREE.Shape(); sh.moveTo(-1.5, 0.25); sh.lineTo(1.25, 0.25); sh.lineTo(1.6, 0.55); sh.lineTo(1.55, 1.05); sh.lineTo(1.15, 1.6); sh.lineTo(-1.5, 1.6); sh.lineTo(-1.5, 0.25);
      const body = mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 }), red); body.position.z = -0.65; g.add(body);
      const roof = mesh(new THREE.BoxGeometry(2.9, 0.14, 1.5), yel); roof.position.set(-0.2, 1.72, 0); g.add(roof);
      [-1, 1].forEach((s) => { const door = mesh(new THREE.BoxGeometry(1.3, 0.95, 0.02), grn); door.position.set(-0.45, 0.95, s * 0.72); g.add(door);
        const stripe = mesh(new THREE.BoxGeometry(2.8, 0.1, 0.02), yel); stripe.position.set(-0.1, 0.42, s * 0.73); g.add(stripe);
        for (let i = 0; i < 12; i++) { const d = mesh(new THREE.SphereGeometry(0.025, 8, 6), M.ceramic('#ffffff')); d.position.set(-1.35 + i * 0.24, 0.55, s * 0.74); g.add(d); } });
      const glass = mesh(new THREE.PlaneGeometry(0.75, 1.2), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transmission: 0.9, roughness: 0.05, thickness: 0.05 })); glass.position.set(1.37, 1.32, 0); glass.rotation.set(0, Math.PI / 2, 0.6); g.add(glass);
      const lamp = mesh(new THREE.SphereGeometry(0.12, 16, 12), M.emit('#ffe08a')); lamp.position.set(1.62, 0.8, 0); g.add(lamp);
      const wheels = [[1.15, 0], [-1.0, 0.7], [-1.0, -0.7]].map(([x, z]) => { const w = new THREE.Group(); const tyre = mesh(new THREE.TorusGeometry(0.26, 0.1, 16, 32), black); w.add(tyre);
        const hub = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24), yel); hub.rotation.x = Math.PI / 2; w.add(hub); w.position.set(x, 0.3, z); g.add(w); return w; });
      g.userData.x = 0; let lx = 0;
      g.userData.update = (t) => { const x = g.userData.x; wheels.forEach((w) => { w.rotation.z -= (x - lx) / 0.36; }); lx = x; g.position.x = x; g.position.y = Math.abs(Math.sin(t * 9)) * 0.03; g.rotation.y = -0.35; };
      g.scale.setScalar(0.85); return g;
    },
    typewriter() {
      const g = new THREE.Group(), maroon = new THREE.MeshPhysicalMaterial({ color: '#3a040b', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.5 });
      const base = mesh(new THREE.BoxGeometry(3.2, 0.7, 2.2), maroon); base.position.y = -0.6; g.add(base);
      const hood = mesh(new THREE.BoxGeometry(3.0, 0.55, 0.9), maroon); hood.position.set(0, -0.05, -0.55); hood.rotation.x = -0.15; g.add(hood);
      const roller = mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.2, 32), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.6 })); roller.rotation.z = Math.PI / 2; roller.position.set(0, 0.32, -0.75); g.add(roller);
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 640; const cx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
      const paper = mesh(new THREE.PlaneGeometry(1.9, 2.4), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); paper.position.set(0, 1.45, -0.82); paper.rotation.x = -0.12; g.add(paper);
      const rows = [12, 11, 10, 9]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const k = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 20), M.ceramic('#f1ece2')); k.position.set((i - (n - 1) / 2) * 0.24 + r * 0.06, -0.2 - r * 0.03, 0.15 + r * 0.24); k.rotation.x = 0.25; g.add(k); } });
      const space = mesh(new THREE.BoxGeometry(1.5, 0.07, 0.16), M.ceramic('#f1ece2')); space.position.set(0.1, -0.34, 1.12); g.add(space);
      const lever = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), M.chrome()); lever.position.set(-1.8, 0.45, -0.7); lever.rotation.z = 1.1; g.add(lever);
      g.userData.text = 'YOU LOOK\nLIKE MY\nNEXT\nCLIENT'; g.userData.n = 0; let last = -1;
      g.userData.update = (t) => { const n = Math.floor(g.userData.n); if (n !== last) { last = n; cx.fillStyle = '#f5f2ea'; cx.fillRect(0, 0, 512, 640); cx.fillStyle = '#6e0f1a'; cx.font = 'bold 64px Silkscreen, monospace'; cx.textAlign = 'center';
          g.userData.text.slice(0, n).split('\n').forEach((l, i) => cx.fillText(l, 256, 170 + i * 92)); tex.needsUpdate = true; } g.rotation.y = Math.sin(t * 0.4) * 0.25; g.rotation.x = 0.28; };
      g.position.y = -0.2; g.scale.setScalar(0.92); return g;
    },
    chai() {
      const g = new THREE.Group();
      const glass = mesh(new THREE.CylinderGeometry(0.95, 0.72, 2.3, 14, 1, true), Object.assign(M.glass('#fff6e6', 5), { flatShading: true, side: THREE.DoubleSide })); g.add(glass);
      const bottom = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.18, 14), Object.assign(M.glass('#fff6e6', 3), { flatShading: true })); bottom.position.y = -1.1; g.add(bottom);
      const tea = mesh(new THREE.CylinderGeometry(0.86, 0.68, 1.7, 28), M.ceramic('#a8602a')); tea.position.y = -0.25; tea.material.roughness = 0.18; g.add(tea);
      const foam = mesh(new THREE.CylinderGeometry(0.87, 0.87, 0.05, 28), M.ceramic('#d9a066')); foam.position.y = 0.62; g.add(foam);
      const cvs = document.createElement('canvas'); cvs.width = cvs.height = 64; const cx = cvs.getContext('2d'); const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(cvs), puffs = [];
      for (let i = 0; i < 22; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.5 })); sp.userData.o = i / 22; puffs.push(sp); g.add(sp); }
      g.rotation.z = 0.08; g.userData.update = (t) => { g.rotation.y = t * 0.35;
        puffs.forEach((p, i) => { const k = (p.userData.o + t * 0.18) % 1; p.position.set(Math.sin(k * 9 + i) * 0.35 * k, 0.75 + k * 2.4, Math.cos(k * 7 + i) * 0.2 * k); p.scale.setScalar(0.35 + k * 1.1); p.material.opacity = 0.45 * Math.sin(k * Math.PI); }); };
      return g;
    },
    code() {
      const g = new THREE.Group();
      if (window.Font && window.HELV_BOLD) { const f = new Font(window.HELV_BOLD);
        const mk = (ch, m, x) => { const tg = new TextGeometry(ch, { font: f, size: 1.15, height: 0.4, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.06, bevelSegments: 8 }); tg.center(); const o = mesh(tg, m); o.position.x = x; g.add(o); return o; };
        mk('<', M.chrome(), -1.15); mk('/', M.glass('#ff7a3d', 0.5), 0); mk('>', M.chrome(), 1.15); }
      const cubes = []; for (let i = 0; i < 9; i++) { const c = mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), i % 3 ? M.glass('#ffb48a', 0.6) : M.gold()); c.userData.a = (i / 9) * Math.PI * 2; c.userData.r = 1.9 + (i % 3) * 0.25; cubes.push(c); g.add(c); }
      g.userData.update = (t) => { g.rotation.y = Math.sin(t * 0.5) * 0.45; g.rotation.x = Math.sin(t * 0.3) * 0.12;
        cubes.forEach((c) => { const a = c.userData.a + t * 0.5; c.position.set(Math.cos(a) * c.userData.r, Math.sin(a * 1.5) * 0.9, Math.sin(a) * c.userData.r * 0.6); c.rotation.set(t, t * 1.3, 0); }); }; return g;
    },
    flower(c = '#d4ff3a', n = 8, layers = 2) {
      const g = new THREE.Group(), pg = new THREE.SphereGeometry(1, 40, 20); pg.scale(0.3, 0.95, 0.07); pg.translate(0, 0.95, 0);
      const pm = M.glass(c, 0.5); pm.iridescence = 0.45; const petals = [];
      for (let l = 0; l < layers; l++) for (let i = 0; i < n; i++) { const piv = new THREE.Group(); piv.rotation.y = (i / n) * Math.PI * 2 + l * (Math.PI / n);
        const p = mesh(pg, pm); p.scale.setScalar(1 - l * 0.22); p.userData.open = 1.25 - l * 0.38; piv.add(p); g.add(piv); petals.push(p); }
      const centre = mesh(new THREE.SphereGeometry(0.3, 48, 32), M.gold()); centre.scale.y = 0.6; g.add(centre);
      for (let i = 0; i < 40; i++) { const r = Math.sqrt(i) * 0.045, a = i * 2.399, s = mesh(new THREE.SphereGeometry(0.03, 8, 6), M.chrome()); s.position.set(Math.cos(a) * r, 0.17, Math.sin(a) * r); g.add(s); }
      const stem = mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 16), M.glass('#d98a4a', 0.6)); stem.position.y = -1.32; g.add(stem);
      const lg = new THREE.SphereGeometry(1, 32, 16); lg.scale(0.22, 0.6, 0.05); lg.translate(0, 0.6, 0); const leaf = mesh(lg, M.glass('#d98a4a', 0.6)); leaf.position.set(0.03, -1.9, 0); leaf.rotation.set(0, 0, -0.9); g.add(leaf);
      g.position.y = 0.55; g.scale.setScalar(0.95); g.userData.t0 = null;
      g.userData.update = (t) => { if (g.userData.t0 === null) g.userData.t0 = t; const e = Math.min(1, (t - g.userData.t0) / 1.8), k = 1 - Math.pow(1 - e, 3) + Math.sin(Math.min(e, 1) * Math.PI) * 0.06;
        petals.forEach((p) => { p.rotation.x = 0.12 + (p.userData.open - 0.12) * k; }); g.rotation.y = t * 0.25; g.rotation.x = 0.35; }; return g;
    },
  };

  function makeStudio(canvas, opts = {}) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !!opts.transparent, preserveDrawingBuffer: !!opts.preserve });
    r.setPixelRatio(Math.min(devicePixelRatio, opts.pr || 1.75)); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100); cam.position.set(0, 0.6, 8.2); cam.lookAt(0, 0, 0);
    const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const U = { c1: { value: new THREE.Color('#111') }, c2: { value: new THREE.Color('#000') }, glow: { value: new THREE.Color('#333') } };
    const bd = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: U, depthWrite: false,
      vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform vec3 c1,c2,glow;varying vec3 vP;void main(){float y=vP.y*.5+.5;vec3 c=mix(c2,c1,smoothstep(.3,.9,y))*.62;float g=pow(max(0.,dot(vP,normalize(vec3(.25,.05,-1.)))),6.);c+=glow*g*.9;gl_FragColor=vec4(c,1.);}' }));
    if (!opts.transparent) sc.add(bd); else r.setClearColor(0x000000, 0);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.35 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.8; ground.receiveShadow = true; sc.add(ground);
    const key = new THREE.SpotLight(0xffffff, 2.2, 30, 0.6, 0.8); key.position.set(3, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0005; sc.add(key);
    const rim = new THREE.PointLight(0xffffff, 3, 20); rim.position.set(-4, 2, -3); sc.add(rim);
    const holder = new THREE.Group(); sc.add(holder);
    const items = opts.items || []; let cur = null, curI = -1, target = { c1: new THREE.Color(), c2: new THREE.Color(), glow: new THREE.Color(), rim: new THREE.Color() };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }; canvas.addEventListener('pointermove', (e) => { const b = canvas.getBoundingClientRect(); mouse.tx = (e.clientX - b.left) / b.width - 0.5; mouse.ty = (e.clientY - b.top) / b.height - 0.5; });
    let swap = null;
    function build(i) { const it = items[i]; const g = B[it.obj](...(it.args || [])); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); const w = new THREE.Group(); w.add(g); w.userData.inner = g; return w; }
    function set(i, instant) { if (i === curI) return; curI = i; const it = items[i]; target.c1.set(it.bg[0]); target.c2.set(it.bg[1]); target.glow.set(it.glow || it.bg[0]); target.rim.set(it.rim || '#ffffff');
      const next = build(i); if (instant || !cur) { if (cur) holder.remove(cur); cur = next; holder.add(cur); cur.scale.setScalar(instant ? 1 : 0.001); swap = instant ? null : { t: 0, out: null };
        if (instant) { U.c1.value.copy(target.c1); U.c2.value.copy(target.c2); U.glow.value.copy(target.glow); rim.color.copy(target.rim); } return; }
      if (swap && swap.out) holder.remove(swap.out); holder.children.slice().forEach((w) => { if (w !== cur) holder.remove(w); });
      swap = { t: 0, out: cur }; cur = next; cur.scale.setScalar(0.001); holder.add(cur); }
    function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      const ox = typeof opts.offsetX === 'function' ? opts.offsetX(w, h) : (opts.offsetX || 0); holder.position.x = ox; const s = Math.min(1, cam.aspect / 1.1); holder.scale.setScalar(Math.max(0.62, s)); }
    resize(); addEventListener('resize', resize);
    let visible = true; if (!opts.preserve) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
    const clock = new THREE.Clock();
    function render(dtOverride) { const t = opts.timeFn ? opts.timeFn() : clock.getElapsedTime(), now = performance.now(), dt = dtOverride ?? Math.min(0.12, (now - (render.last || now)) / 1000 || 0.016); render.last = now;
      U.c1.value.lerp(target.c1, 0.06); U.c2.value.lerp(target.c2, 0.06); U.glow.value.lerp(target.glow, 0.06); rim.color.lerp(target.rim, 0.06);
      if (swap) { swap.t += dt; if (swap.out) { const k = Math.min(1, swap.t / 0.45); swap.out.scale.setScalar(Math.max(0.001, 1 - k * k)); swap.out.rotation.y += 0.15; if (k >= 1) { holder.remove(swap.out); swap.out = null; swap.t = 0; } }
        else { const k = Math.min(1, swap.t / 0.9), e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); cur.scale.setScalar(Math.max(0.001, k >= 1 ? 1 : e)); if (k >= 1) swap = null; } }
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      holder.children.forEach((w) => { const g = w.userData.inner; g.userData.update && g.userData.update(t); w.rotation.y = mouse.x * 0.8; w.rotation.x = mouse.y * 0.4; });
      r.render(sc, cam); }
    (function loop() { requestAnimationFrame(loop); if (visible && !opts.manual) render(); })();
    return { set, render, resize, renderer: r, canvas, inner: () => cur && cur.userData.inner };
  }
  window.makeStudio = makeStudio; window.STUDIO_BUILDERS = B;
})();
