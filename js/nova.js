/* N.O.V.A. — Navya's Operational Virtual Assistant. All scenes for the HUD portfolio. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, ease = (t) => t * t * (3 - 2 * t);
  const prog = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const introActive = () => !!document.getElementById('intro');
  const R = Math.random, TAU = Math.PI * 2;
  if (window.THREE && THREE.ColorManagement) { THREE.ColorManagement.legacyMode = false; THREE.ColorManagement.enabled = true; }

  /* ===================== UI basics ===================== */
  const toastEl = $('#toast'); let tT; const toast = (m) => { toastEl.innerHTML = '<b>N.O.V.A. ›</b> ' + m; toastEl.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => toastEl.classList.remove('show'), 3200); };
  window.toast = toast;
  const cur = $('#cur'), cxy = $('#curXY'); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });
  (function cl() { cx += (mx - cx) * 0.25; cy += (my - cy) * 0.25; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; cxy.textContent = `X:${Math.round(mx)} Y:${Math.round(my)}`; requestAnimationFrame(cl); })();
  $$('a,button,input,.mod,.suit').forEach((el) => { el.addEventListener('pointerenter', () => cur.classList.add('hot')); el.addEventListener('pointerleave', () => cur.classList.remove('hot')); });
  setInterval(() => { $('#clk').textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }, 1000);
  const typeInto = (el, txt, sp = 28) => new Promise((res) => { let i = 0; el.textContent = ''; (function t() { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(t, sp); else res(); })(); });
  // reveal + counters + suit bars
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('in');
    $$('.cnt', e.target).forEach((c) => { const to = +c.dataset.to; let s = null; const st = (t) => { s ??= t; const p = Math.min(1, (t - s) / 1500); c.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); });
    io.unobserve(e.target); }), { threshold: 0.2 });
  $$('.rv').forEach((el) => io.observe(el));
  // scan sweep on section change
  let lastSec = null; const sweep = $('#sweep');
  addEventListener('scroll', () => { const s = $$('section').find((el) => { const r = el.getBoundingClientRect(); return r.top <= innerHeight * 0.5 && r.bottom > innerHeight * 0.5; });
    if (s && s !== lastSec) { lastSec = s; sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go'); } }, { passive: true });
  // sparklines + hot takes
  $$('.spark').forEach((sv, k) => { let d = 'M0,40'; let y = 36; for (let x = 0; x <= 200; x += 10) { y = clamp(y - (R() * 9 - 2.5 - k * 0.3), 4, 42); d += ` L${x},${y.toFixed(1)}`; }
    sv.innerHTML = `<path d="${d}" fill="none" stroke="#ff4a1c" stroke-width="2" style="stroke-dasharray:600;stroke-dashoffset:600;animation:dash 2.4s ${k * 0.2}s forwards"/>`; });
  const st = document.createElement('style'); st.textContent = '@keyframes dash{to{stroke-dashoffset:0}}'; document.head.appendChild(st);
  const takes = ["your brand doesn't need more posts. it needs a better story.", 'hook in 1.5 seconds or the thumb wins. every time.', 'carousels win saves. reels win reach. use both.', 'nobody reads captions. everyone reads the first line.', 'consistency beats virality. virality is a bonus, like extra chutney.', 'your audience is not "everyone". even maggi has a target customer.'];
  let tk = 0; setInterval(() => { const el = $('#hotTake'); if (!el || !vis(el)) return; el.style.opacity = 0; setTimeout(() => { el.textContent = takes[++tk % takes.length]; el.style.opacity = 1; }, 300); }, 4200);
  $('#hotTake') && ($('#hotTake').style.transition = 'opacity .3s');
  // tab title + idle humour
  const T0 = document.title; addEventListener('visibilitychange', () => { document.title = document.hidden ? 'N.O.V.A. › come back, navya is waiting 👀' : T0; });

  /* ===================== shared three helpers ===================== */
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
  function rbox(w, h, d, r, m) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - r), bevelEnabled: true, bevelThickness: r / 2, bevelSize: r / 2, bevelSegments: 5, curveSegments: 6 }); g.center(); const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; }
  const FBM = 'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+1.),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n2(p);p=p*2.03+1.7;a*=.5;}return v;}';

  /* ===================== INTRO: hammer → city → WAKE UP ===================== */
  function intro(done) {
    const el = $('#intro');
    let seen = false; try { seen = sessionStorage.getItem('nova_seen') === '1'; } catch (e) {}
    if (seen || !window.THREE) { el.remove(); done(); return; }
    const cv = $('#introGL'), led = $('#led'), lx = led.getContext('2d'), boot = $('#boot');
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio, 1.5)); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, 1, 0.05, 900); sc.fog = new THREE.FogExp2('#05070d', 0.03);
    if (window.RoomEnvironment) { const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
    // sky: dark forge-ambient → storm → nebula
    const U = { uT: { value: 0 }, uFlash: { value: 0 }, uMix: { value: 0 } };
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(600, 48, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
      vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float uT,uFlash,uMix;varying vec3 vP;' + FBM + 'void main(){vec2 p=vec2(atan(vP.z,vP.x)*1.6,vP.y*3.);float f=fbm(p*1.5+vec2(uT*.05,0.));float g=fbm(p*3.+f*2.-uT*.03);' +
        'vec3 storm=mix(vec3(.01,.012,.018),vec3(.1,.11,.15),smoothstep(.3,.8,f*g*1.6));' +
        'float fil=pow(smoothstep(.45,.9,g),2.);vec3 neb=mix(vec3(.01,.015,.04),vec3(.08,.18,.42),smoothstep(.2,.8,f));neb+=vec3(.9,.25,.06)*fil*smoothstep(-.1,.5,vP.y);neb+=vec3(.6,.75,1.)*pow(max(0.,1.-abs(vP.y)*6.),6.)*.8;' +
        'float st=pow(h1(floor(p*260.)),90.)*smoothstep(0.,.3,vP.y);vec3 c=mix(storm,neb,uMix)+st*uMix+uFlash*vec3(.55,.65,1.)*(.4+f);gl_FragColor=vec4(c,1.);}' })));
    // scorched ground + city (city fades in only once we rise)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: '#030404', roughness: 0.96 })); ground.rotation.x = -Math.PI / 2; sc.add(ground);
    const ash = canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = '#060504'; x.fillRect(0, 0, w, h); for (let i = 0; i < 30000; i++) { const v = R() * 0.1; x.fillStyle = `rgba(${40 + v * 255 | 0},${30 + v * 180 | 0},${20 + v * 60 | 0},${0.05 + R() * 0.12})`; x.fillRect(R() * w, R() * h, 1.4, 1.4); } });
    ash.wrapS = ash.wrapT = THREE.RepeatWrapping; ash.repeat.set(16, 16); ground.material.map = ash; ground.material.needsUpdate = true;
    const crack = canvasTex(1024, 1024, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#ff6a1c'; x.shadowColor = '#ff4a1c'; x.shadowBlur = 18; x.lineCap = 'round';
      const branch = (px, py, a, len, wdt, d) => { if (d > 4 || len < 8) return; let X = px, Y = py; x.lineWidth = wdt; x.beginPath(); x.moveTo(X, Y); for (let i = 0; i < 8; i++) { a += (R() - 0.5) * 0.7; X += Math.cos(a) * len / 8; Y += Math.sin(a) * len / 8; x.lineTo(X, Y); } x.stroke();
        branch(X, Y, a + (R() - 0.5) * 1.2, len * 0.65, wdt * 0.7, d + 1); if (R() < 0.6) branch(X, Y, a + (R() - 0.5) * 1.6, len * 0.5, wdt * 0.6, d + 1); };
      for (let i = 0; i < 14; i++) branch(512, 512, (i / 14) * TAU + R() * 0.3, 260 + R() * 120, 9, 0); x.fillStyle = '#ffb347'; x.beginPath(); x.arc(512, 512, 40, 0, TAU); x.fill(); });
    const crackM = new THREE.MeshBasicMaterial({ map: crack, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const crackP = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), crackM); crackP.rotation.x = -Math.PI / 2; crackP.position.y = 0.015; sc.add(crackP);
    const win = canvasTex(64, 128, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 64, 128); for (let yy = 4; yy < 128; yy += 8) for (let xx = 4; xx < 64; xx += 8) if (R() < 0.35) { x.fillStyle = R() < 0.85 ? '#ffcf8a' : '#8fd8ff'; x.fillRect(xx, yy, 4, 4); } });
    win.wrapS = win.wrapT = THREE.RepeatWrapping;
    const bM = new THREE.MeshStandardMaterial({ color: '#0c1018', roughness: 0.7, metalness: 0.3, emissive: '#ffffff', emissiveMap: win, emissiveIntensity: 1.1 });
    const N = 2600, city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bM, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let i = 0; i < N; i++) { const a = R() * TAU, d = 14 + Math.pow(R(), 0.7) * 230, hgt = (2 + Math.pow(R(), 3) * 40) * (d < 70 ? 1.6 : 1) * (1 - d / 330), w = 2 + R() * 4;
      m4.compose(new THREE.Vector3(Math.cos(a) * d, hgt / 2, Math.sin(a) * d - 20), q, new THREE.Vector3(w, hgt, w * (0.7 + R() * 0.6))); city.setMatrixAt(i, m4); }
    city.visible = false; sc.add(city); // hidden until the rise reveals it — keeps the close-up/crack/beam beats pure darkness, no skyline bleeding through
    // the hammer — original design, no Thor, resting on ash, reforging
    const runes = canvasTex(1024, 1024, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#565d69'); g.addColorStop(0.5, '#3a3f49'); g.addColorStop(1, '#23262d'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${R() * 0.06})`; x.fillRect(R() * w, R() * h, 2, 1); }
      x.strokeStyle = '#15171c'; x.lineWidth = 16; x.strokeRect(36, 36, w - 72, h - 72); x.lineWidth = 3; x.strokeStyle = '#6b7480';
      for (let i = 0; i < 70; i++) { x.beginPath(); const px = R() * w, py = R() * h, l = 10 + R() * 40, a = R() * TAU; x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } });
    // crack/glow map: baked rune sigil + fine branching cracks radiating outward (this is what "ignites" during reforging)
    const crackBranch = (x, px, py, a, len, wdt, d, maxd) => { if (d > maxd || len < 6) return; let X = px, Y = py; x.lineWidth = wdt; x.beginPath(); x.moveTo(X, Y); const steps = 7;
      for (let i = 0; i < steps; i++) { a += (R() - 0.5) * 0.65; X += Math.cos(a) * len / steps; Y += Math.sin(a) * len / steps; x.lineTo(X, Y); } x.stroke();
      crackBranch(x, X, Y, a + (R() - 0.5) * 1.1, len * 0.62, wdt * 0.68, d + 1, maxd); if (R() < 0.55) crackBranch(x, X, Y, a + (R() - 0.5) * 1.5, len * 0.45, wdt * 0.55, d + 1, maxd); };
    const glyph = canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 11; x.lineCap = 'round';
      x.beginPath(); x.arc(512, 512, 300, 0, TAU); x.stroke(); x.beginPath(); x.arc(512, 512, 220, 0, TAU); x.stroke();
      for (let i = 0; i < 3; i++) { x.save(); x.translate(512, 512); x.rotate(i * TAU / 3); x.beginPath(); x.moveTo(0, -220); x.bezierCurveTo(180, -120, 180, 120, 0, 220); x.stroke(); x.restore(); }
      const rr = ['ᚾ', 'ᚨ', 'ᚢ', 'ᛃ', 'ᚨ']; x.font = '88px serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; rr.forEach((c, i) => { const a = -Math.PI / 2 + (i - 2) * 0.42; x.fillText(c, 512 + Math.cos(a) * 410, 536 + Math.sin(a) * 410); });
      [[120, 120], [904, 120], [120, 904], [904, 904]].forEach(([px, py]) => { x.beginPath(); x.moveTo(px - 40, py); x.lineTo(px, py - 40); x.lineTo(px + 40, py); x.lineTo(px, py + 40); x.closePath(); x.stroke(); });
      x.lineWidth = 4; for (let i = 0; i < 10; i++) crackBranch(x, 512, 512, (i / 10) * TAU + R() * 0.3, 190 + R() * 160, 7, 0, 3); });
    const steel = new THREE.MeshStandardMaterial({ map: runes, metalness: 0.92, roughness: 0.3, emissive: '#ff6a1c', emissiveMap: glyph, emissiveIntensity: 0 });
    const hammer = new THREE.Group(), head = rbox(2.1, 1.25, 1.25, 0.16, steel); head.position.y = 0.62; hammer.add(head);
    [-1, 1].forEach((s) => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 48), steel); cap.rotation.z = Math.PI / 2; cap.position.set(s * 1.08, 0.62, 0); hammer.add(cap); });
    const leather = canvasTex(64, 256, (x, w, h) => { x.fillStyle = '#3a2416'; x.fillRect(0, 0, w, h); for (let yy = -64; yy < h + 64; yy += 14) { x.strokeStyle = '#1c110a'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy + 20); x.stroke(); x.strokeStyle = '#5a3a24'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, yy + 4); x.lineTo(w, yy + 24); x.stroke(); } });
    leather.wrapT = THREE.RepeatWrapping; leather.repeat.set(1, 3);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 2.4, 32), new THREE.MeshStandardMaterial({ map: leather, roughness: 0.75 })); handle.position.y = 1.82; hammer.add(handle);
    const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.25, 32), steel); pommel.position.y = 3.07; hammer.add(pommel);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 12, 32), new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.8 })); strap.position.set(0, 3.32, 0); strap.rotation.x = 0.3; hammer.add(strap);
    hammer.rotation.z = 0.06; sc.add(hammer); // upright: glyph face on the head looks straight at the camera (local +Z = world +Z, no distorting rotation); haft rises up and out of frame
    sc.add(new THREE.AmbientLight('#1a1420', 0.25)); const moon = new THREE.DirectionalLight('#5a4838', 0.35); moon.position.set(-5, 10, 6); sc.add(moon);
    const forge = new THREE.PointLight('#ff6a1c', 0.6, 8); forge.position.set(0, 0.9, 1.1); sc.add(forge);
    const bolt = new THREE.PointLight('#9fd8ff', 0, 60); bolt.position.set(0, 8, 2); sc.add(bolt);
    // beam of light (two-part: broad soft column + bright core), anchored at the hammer head
    const beamTex = canvasTex(32, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.08, 'rgba(210,235,255,.9)'); g.addColorStop(0.55, 'rgba(140,200,255,.5)'); g.addColorStop(1, 'rgba(140,200,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const mkBeam = (rad, op) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.4, 1, 24, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op })); m.position.set(0, 0.62, 0.5); return m; };
    const beamOuter = mkBeam(0.55, 0); const beamInner = mkBeam(0.18, 0); beamOuter.scale.y = 0.001; beamInner.scale.y = 0.001; sc.add(beamOuter, beamInner);
    const beamLight = new THREE.PointLight('#aee0ff', 0, 30); beamLight.position.set(0, 2, 0); sc.add(beamLight);
    // embers / sparks — ambient drift from t=0, bursts outward when the beam erupts
    const SN = 1100, sp = new Float32Array(SN * 3), sv = [], home0 = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) { sv.push(new THREE.Vector3()); const a = R() * TAU, rr = R() * 1.3; home0.set([Math.cos(a) * rr, R() * 0.3 - 0.1, Math.sin(a) * rr * 0.6 + 0.3], i * 3); }
    sp.set(home0); const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const sm = new THREE.PointsMaterial({ size: 0.045, color: '#ffb347', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }); const sparks = new THREE.Points(sg, sm); sc.add(sparks);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 96), new THREE.MeshBasicMaterial({ color: '#aee0ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; sc.add(ring);
    const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); led.width = innerWidth; led.height = innerHeight; }; size(); addEventListener('resize', size);
    // LED "WAKE UP" dots
    const ledDots = (() => { const o = document.createElement('canvas'), W = 900, H = 200; o.width = W; o.height = H; const x = o.getContext('2d'); x.fillStyle = '#fff'; x.font = '900 150px Orbitron, sans-serif'; x.textBaseline = 'middle'; x.fillText('WAKE UP', 10, 105);
      const d = x.getImageData(0, 0, W, H).data, pts = []; for (let yy = 0; yy < H; yy += 9) for (let xx = 0; xx < W; xx += 9) if (d[(yy * W + xx) * 4 + 3] > 120) pts.push([xx, yy, R()]); return pts; })();
    const codeLines = Array.from({ length: 22 }, () => Array.from({ length: 6 + (R() * 8 | 0) }, () => ['navya', 'chai()', 'model.fit', 'grad_cam', 'ship', '0x7f', 'bio', 'hook=1.5s', 'deploy', 'atgc', 'vitb', 'nova.init'][R() * 12 | 0]).join(' '));
    const dbgAt = +(new URLSearchParams(location.search).get('introAt') || 0); // ?introAt=3.6 jumps straight to that second, for previewing a beat
    let t0 = performance.now() - dbgAt * 1000, erupted = dbgAt > 3.6, ended = false, bolts = [], boltT = 0, typed = false;
    // timeline (seconds)
    const T_CLOSE0 = 0, T_CLOSE1 = 2.1, T_PULL = 3.2, T_ERUPT = 3.55, T_RISE0 = 3.8, T_RISE1 = 6.6, T_WAKE = 7.0, T_BOOT = 8.0, T_END = 15.5;
    const end = () => { if (ended) return; ended = true; try { sessionStorage.setItem('nova_seen', '1'); } catch (e) {} el.classList.add('out'); done(); setTimeout(() => { r.dispose(); r.forceContextLoss && r.forceContextLoss(); el.remove(); }, 1300); };
    $('#skip').onclick = end; addEventListener('keydown', (e) => { if (e.key === 'Escape') end(); }, { once: true });
    const project = (v) => { const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * innerWidth, (-p.y * 0.5 + 0.5) * innerHeight]; };
    function makeBolt(x1, y1, x2, y2, depth = 0) { const pts = [[x1, y1], [x2, y2]]; for (let k = 0; k < 6; k++) { for (let i = pts.length - 1; i > 0; i--) { const a = pts[i - 1], b = pts[i], off = (Math.hypot(b[0] - a[0], b[1] - a[1])) * 0.25;
          pts.splice(i, 0, [(a[0] + b[0]) / 2 + (R() - 0.5) * off, (a[1] + b[1]) / 2 + (R() - 0.5) * off]); } } const out = [pts];
      if (depth < 1) for (let i = 0; i < 3; i++) { const s = pts[(R() * pts.length * 0.7) | 0]; out.push(...makeBolt(s[0], s[1], s[0] + (R() - 0.5) * 300, s[1] + 80 + R() * 200, depth + 1)); } return out; }
    (function frame(now) { if (ended && el.classList.contains('out') && !el.isConnected) return; requestAnimationFrame(frame); const t = (now - t0) / 1000; U.uT.value = t;
      lx.clearRect(0, 0, led.width, led.height);
      // --- camera: macro orbit on the carved head → pull back → rise over the city ---
      if (t < T_CLOSE1) { const k = ease(clamp(t / T_CLOSE1)); const ang = -0.5 + k * 0.9, dist = lerp(1.35, 0.95, k);
        cam.position.set(Math.sin(ang) * dist, 0.68 + Math.sin(t * 0.4) * 0.02, 0.5 + Math.cos(ang) * dist * 0.4); cam.lookAt(0, 0.62, 0); }
      else if (t < T_PULL) { const k = ease(clamp((t - T_CLOSE1) / (T_PULL - T_CLOSE1))); cam.position.set(lerp(Math.sin(0.4) * 0.95, 0, k), lerp(0.68, 1.35, k), lerp(0.5 + Math.cos(0.4) * 0.38, 3.6, k)); cam.lookAt(0, 0.5, 0); }
      else if (t < T_RISE0) { const sh = Math.sin(t * 40) * 0.05 * clamp((t - T_ERUPT) * 6); cam.position.set(sh, 1.35 + Math.abs(sh), 3.6 - sh); cam.lookAt(0, 0.5, 0); }
      else { city.visible = true; const rise = ease(clamp((t - T_RISE0) / (T_RISE1 - T_RISE0))); cam.position.set(Math.sin(t * 0.2) * 0.4 * (1 - rise), lerp(1.35, 62, rise), lerp(3.6, 44, rise)); cam.lookAt(0, lerp(0.5, 0, rise), lerp(0, -40, rise));
        U.uMix.value = rise; sc.fog.density = lerp(0.03, 0.0045, rise); }
      // --- the hammer: cracks ignite and spread across the carved metal ---
      const crackK = clamp((t - 1.0) / (T_ERUPT - 1.0)); steel.emissiveIntensity = t < T_ERUPT ? crackK * crackK * 2.2 : lerp(2.2, 0.35, clamp((t - T_ERUPT) / 1.4));
      crackM.opacity = t < T_ERUPT ? crackK * 0.7 : lerp(0.7, 0.12, clamp((t - T_ERUPT) / 2));
      forge.intensity = 0.4 + crackK * 1.2 + (t < T_ERUPT ? 0 : Math.max(0, 6 * Math.exp(-(t - T_ERUPT) * 2)));
      // --- embers: ambient drift, then eruption burst when the beam fires ---
      if (!erupted && t >= T_ERUPT) { erupted = true; for (let i = 0; i < SN; i++) { const a = R() * TAU, up = 0.5 + R() * 1.3, s = 1.5 + R() * 5; sv[i].set(Math.cos(a) * s, up * s, Math.sin(a) * s * 0.7); } sm.size = 0.08; sm.opacity = 1; ring.material.opacity = 0.9; }
      if (!erupted) { const dt = 1 / 60; for (let i = 0; i < SN; i++) { const j = i * 3; sp[j + 1] += dt * 0.08; if (sp[j + 1] > home0[j + 1] + 0.7) { sp[j] = home0[j]; sp[j + 1] = home0[j + 1]; sp[j + 2] = home0[j + 2]; } sp[j] += Math.sin(t * 2 + i) * 0.0015; } sg.attributes.position.needsUpdate = true; sm.opacity = 0.35 + crackK * 0.3; }
      else { const dt = 1 / 60; for (let i = 0; i < SN; i++) { const j = i * 3; sv[i].y -= 3.2 * dt; sv[i].multiplyScalar(0.99); sp[j] += sv[i].x * dt; sp[j + 1] += sv[i].y * dt; sp[j + 2] += sv[i].z * dt; } sg.attributes.position.needsUpdate = true;
        const it = t - T_ERUPT; sm.opacity = clamp(1.3 - it * 0.22); ring.scale.setScalar(1 + it * 10); ring.material.opacity = clamp(0.9 - it * 0.7); }
      // --- the vertical beam of light ---
      const beamK = ease(clamp((t - T_ERUPT) / 0.35)) * clamp(1.4 - Math.max(0, t - T_ERUPT - 1.6) * 0.8); const flicker = 0.85 + 0.15 * Math.sin(t * 50);
      beamOuter.scale.y = Math.max(0.001, beamK * 420 * flicker); beamOuter.material.opacity = beamK * 0.55; beamOuter.position.y = 0.62 + beamOuter.scale.y / 2;
      beamInner.scale.y = Math.max(0.001, beamK * 480 * flicker); beamInner.material.opacity = beamK * 0.85; beamInner.position.y = 0.62 + beamInner.scale.y / 2;
      beamLight.intensity = beamK * 14;
      // --- lightning (ties the eruption to the storm as camera rises) ---
      U.uFlash.value *= 0.85; bolt.intensity *= 0.8;
      if (t > T_ERUPT + 0.2 && t < T_RISE1 - 0.4) { boltT -= 1 / 60; if (boltT <= 0) { const [hx, hy] = project(new THREE.Vector3(0, 2.4, 0)); bolts = makeBolt(hx + (R() - 0.5) * 500, -20, hx, hy); boltT = 0.1 + R() * 0.2; U.uFlash.value = 1; bolt.intensity = 22; } }
      else bolts = [];
      if (bolts.length && boltT > 0.05) { lx.save(); lx.globalCompositeOperation = 'lighter'; bolts.forEach((b, i) => { lx.strokeStyle = i ? 'rgba(160,210,255,.6)' : '#e8f6ff'; lx.lineWidth = i ? 1.5 : 3; lx.shadowColor = '#7fc8ff'; lx.shadowBlur = 25; lx.beginPath(); b.forEach(([x, y], j) => j ? lx.lineTo(x, y) : lx.moveTo(x, y)); lx.stroke(); }); lx.restore(); }
      // WAKE UP dot matrix
      if (t > T_WAKE) { const a = clamp((t - T_WAKE) * 1.5) * (Math.random() < 0.04 ? 0.4 : 1), s = Math.min(innerWidth / 1100, 1.1); lx.save(); lx.translate(innerWidth * 0.1, innerHeight * 0.52); lx.transform(1, -0.08, -0.25, 0.9, 0, 0); lx.scale(s, s);
        lx.shadowColor = '#ff2a1a'; lx.shadowBlur = 14; ledDots.forEach(([x, y, rr]) => { const fl = 0.6 + 0.4 * Math.sin(t * 9 + rr * 30); lx.fillStyle = `rgba(255,${50 + rr * 40 | 0},30,${a * fl})`; lx.beginPath(); lx.arc(x, y, 3.2, 0, TAU); lx.fill(); });
        lx.shadowBlur = 6; lx.font = '18px "Share Tech Mono"'; lx.fillStyle = `rgba(255,70,40,${a * 0.9})`; ['navya.exe loaded. 3 domains detected.', 'bio // tech // marketing : online', 'chai reserves critical. proceed anyway.'].forEach((l, i) => lx.fillText(l, 10, 240 + i * 26));
        lx.fillStyle = `rgba(120,200,255,${a * 0.6})`; lx.shadowColor = '#3db8ff'; codeLines.forEach((l, i) => lx.fillText(l, 40 + (i % 3) * 230, 340 + Math.floor(i / 3) * 26 - ((t - T_WAKE) * 20 % 26))); lx.restore(); }
      if (t > T_BOOT && !typed) { typed = true; (async () => { const L = ['N.O.V.A. v4.2 · Navya\'s Operational Virtual Assistant', '> initialising neural cores .............. OK', '> calibrating chai reserves ............. 87%', '> loading modules: TECH · BIO · MARKETING .. OK', '<b>> welcome back, Navya. the lab is yours.</b>'];
        for (const l of L) { const d = document.createElement('div'); boot.appendChild(d); if (l.startsWith('<b>')) { d.innerHTML = l; await new Promise((r2) => setTimeout(r2, 300)); } else await typeInto(d, l, 14); } setTimeout(end, 1300); })(); }
      if (t > T_END) end();
      r.render(sc, cam); })(t0);
  }


  /* ===================== HERO: the student, Da Vinci blueprint ===================== */
  function hero() {
    const cv = $('#heroCv'), x = cv.getContext('2d'), sec = $('#hero'); let W, H, D, bg, clouds, far, near, me, notes = [], sketches = [], spireX, spireY;
    const notesTxt = ['hypothesis: chai improves code quality', 'ΔG = ΔH − TΔS', 'if (curiosity) { build(); }', 'CNN → Grad-CAM → why?', 'ATGC → AI', 'hook < 1.5s', 'model.fit(dreams)', 'p < 0.05 (please)', 'Σ attention = 1', 'ship it, beta', 'bioengineer · coder · storyteller', 'sleep: TODO', 'f(x) = learn(x) + chai', 'gene expression ↑', 'mummy said doctor. close enough.'];
    function build() { D = Math.min(devicePixelRatio, 1.5); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * D; cv.height = H * D; x.setTransform(D, 0, 0, D, 0, 0);
      const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w * D; c.height = h * D; const g = c.getContext('2d'); g.setTransform(D, 0, 0, D, 0, 0); return [c, g]; };
      // background: ink-blue paper with cross hatching
      let g; [bg, g] = mk(W, H); const gr = g.createRadialGradient(W * 0.6, H * 0.35, 0, W * 0.6, H * 0.4, W * 0.8); gr.addColorStop(0, '#2a4fb8'); gr.addColorStop(0.45, '#12266e'); gr.addColorStop(1, '#040a24'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < W * H / 90; i++) { const px = R() * W, py = R() * H, l = 6 + R() * 14; g.strokeStyle = `rgba(${R() < 0.5 ? '10,20,60' : '120,150,230'},${0.05 + R() * 0.12})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(px, py); g.lineTo(px + l, py - l * 0.8); g.stroke(); }
      // clouds: swirling strokes (wider than screen for drift)
      [clouds, g] = mk(W * 1.5, H * 0.7); for (let i = 0; i < 1400; i++) { const cx0 = R() * W * 1.5, cy0 = R() * H * 0.62, rr = 20 + R() * 120, a0 = R() * TAU; g.strokeStyle = `rgba(${150 + R() * 80 | 0},${170 + R() * 60 | 0},255,${0.04 + R() * 0.1})`; g.lineWidth = 0.7 + R() * 1.2; g.beginPath(); g.arc(cx0, cy0, rr, a0, a0 + 0.6 + R() * 1.6); g.stroke(); }
      // city layers
      const city = (yBase, col, edge, hMin, hMax, dens, spire) => { const [c, cg] = mk(W, H); cg.fillStyle = col; cg.strokeStyle = edge; cg.lineWidth = 1; let px = -20; while (px < W + 20) { const w = 14 + R() * 40, h = hMin + R() * (hMax - hMin);
          cg.beginPath(); cg.moveTo(px, H); cg.lineTo(px, yBase - h); const t = R(); if (t < 0.35) { cg.lineTo(px + w / 2, yBase - h - w * 1.4); cg.lineTo(px + w, yBase - h); } else if (t < 0.6) { cg.lineTo(px + w * 0.3, yBase - h); cg.lineTo(px + w * 0.5, yBase - h - 40); cg.lineTo(px + w * 0.7, yBase - h); cg.lineTo(px + w, yBase - h); } else cg.lineTo(px + w, yBase - h);
          cg.lineTo(px + w, H); cg.closePath(); cg.fill(); cg.stroke(); for (let k = 0; k < 6; k++) { cg.strokeStyle = edge; cg.beginPath(); const lx2 = px + R() * w; cg.moveTo(lx2, yBase - h * R()); cg.lineTo(lx2, H); cg.stroke(); } px += w * dens; }
        if (spire) { spireX = W * 0.68; spireY = yBase - hMax * 1.7; cg.fillStyle = col; cg.beginPath(); cg.moveTo(spireX - 30, H); cg.lineTo(spireX - 30, yBase - hMax * 1.1); cg.lineTo(spireX - 12, yBase - hMax * 1.25); cg.lineTo(spireX, spireY); cg.lineTo(spireX + 12, yBase - hMax * 1.25); cg.lineTo(spireX + 30, yBase - hMax * 1.1); cg.lineTo(spireX + 30, H); cg.fill(); cg.stroke(); } return c; };
      far = city(H * 0.68, '#14286a', 'rgba(140,170,255,.35)', 40, H * 0.22, 0.9, false); near = city(H * 0.8, '#0a1640', 'rgba(150,180,255,.3)', 30, H * 0.26, 0.95, true);
      // the student on a rock (from behind): bun, headphones, hoodie, backpack, laptop glow
      [me, g] = mk(W, H); const s = H / 900, bx = W * 0.62, by = H * 0.8;
      g.fillStyle = '#050a1e'; g.strokeStyle = 'rgba(160,190,255,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx - 260 * s, H); g.lineTo(bx - 220 * s, by + 20 * s); g.lineTo(bx - 120 * s, by - 6 * s); g.lineTo(bx - 20 * s, by - 14 * s); g.lineTo(bx + 120 * s, by - 4 * s); g.lineTo(bx + 230 * s, by + 30 * s); g.lineTo(bx + 300 * s, H); g.closePath(); g.fill(); g.stroke();
      for (let i = 0; i < 220; i++) { const px = bx + (R() - 0.5) * 500 * s, py = by + R() * 160 * s; g.strokeStyle = `rgba(140,170,255,${R() * 0.18})`; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 10 * s, py - 6 * s); g.stroke(); }
      const P = (px, py) => [bx + px * s, by + py * s];
      const body = new Path2D(); const pt = (a, b) => P(a, b);
      body.moveTo(...pt(-62, -8)); body.bezierCurveTo(...pt(-70, -60), ...pt(-82, -100), ...pt(-66, -118)); body.bezierCurveTo(...pt(-50, -136), ...pt(-26, -140), ...pt(-16, -146)); body.lineTo(...pt(-12, -158));
      body.bezierCurveTo(...pt(-34, -170), ...pt(-30, -214), ...pt(0, -216)); body.bezierCurveTo(...pt(30, -214), ...pt(34, -170), ...pt(12, -158)); body.lineTo(...pt(16, -146)); body.bezierCurveTo(...pt(26, -140), ...pt(50, -136), ...pt(66, -118)); body.bezierCurveTo(...pt(82, -100), ...pt(70, -60), ...pt(62, -8)); body.closePath();
      body.moveTo(...pt(14, -228)); body.arc(...pt(4, -232), 17 * s, 0, TAU); // bun
      g.save(); g.shadowColor = '#3df5ff'; g.shadowBlur = 40 * s; g.fillStyle = '#03061a'; g.fill(body); g.restore(); g.fillStyle = '#03061a'; g.fill(body);
      g.save(); g.clip(body); for (let i = 0; i < 400; i++) { const px = bx + (R() - 0.5) * 170 * s, py = by - R() * 240 * s; g.strokeStyle = `rgba(110,140,230,${R() * 0.22})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 9 * s, py - 7 * s); g.stroke(); } g.restore();
      g.strokeStyle = 'rgba(170,200,255,.6)'; g.lineWidth = 1.3; g.stroke(body);
      g.strokeStyle = '#0a1230'; g.lineWidth = 7 * s; g.beginPath(); g.arc(...P(0, -186), 34 * s, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.strokeStyle = 'rgba(170,200,255,.6)'; g.lineWidth = 1; g.stroke();
      [-1, 1].forEach((q2) => { g.fillStyle = '#0a1230'; g.beginPath(); g.ellipse(...P(q2 * 32, -184), 9 * s, 14 * s, 0, 0, TAU); g.fill(); g.stroke(); });
      g.strokeStyle = 'rgba(170,200,255,.45)'; g.beginPath(); g.moveTo(...P(-18, -150)); g.quadraticCurveTo(...P(0, -132), ...P(18, -150)); g.stroke(); // hood
      g.fillStyle = '#060c26'; g.beginPath(); g.roundRect(...P(96, -78), 58 * s, 72 * s, 12 * s); g.fill(); g.strokeStyle = 'rgba(170,200,255,.5)'; g.stroke(); g.beginPath(); g.roundRect(...P(104, -52), 42 * s, 26 * s, 6 * s); g.stroke(); // backpack
      g.beginPath(); g.moveTo(...P(-6, -232)); g.quadraticCurveTo(...P(-14, -218), ...P(-8, -210)); g.stroke(); // loose strand
      // notes + sketches
      notes = notesTxt.map((n, i) => ({ n, x: R() * W * 0.95, y: 30 + R() * H * 0.6, s: 13 + R() * 14, ph: R() * TAU, sp: 0.15 + R() * 0.25, rot: (R() - 0.5) * 0.25 }));
      sketches = Array.from({ length: 6 }, (_, i) => ({ x: W * (0.1 + R() * 0.85), y: H * (0.08 + R() * 0.55), r: 30 + R() * 50, k: i % 3, sp: (R() - 0.5) * 0.3 }));
    }
    build(); addEventListener('resize', build);
    let bolt = null, boltT = 2, flash = 0, pmx = 0, pmy = 0;
    sec.addEventListener('pointermove', (e) => { pmx = e.clientX / W - 0.5; pmy = e.clientY / H - 0.5; });
    function makeBolt(x1, y1, x2, y2, d = 0) { const pts = [[x1, y1], [x2, y2]]; for (let k = 0; k < 6; k++) for (let i = pts.length - 1; i > 0; i--) { const a = pts[i - 1], b = pts[i], o = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.22; pts.splice(i, 0, [(a[0] + b[0]) / 2 + (R() - 0.5) * o, (a[1] + b[1]) / 2 + (R() - 0.5) * o * 0.3]); }
      const out = [pts]; if (d < 1) for (let i = 0; i < 4; i++) { const s = pts[(R() * pts.length * 0.8) | 0]; out.push(...makeBolt(s[0], s[1], s[0] + (R() - 0.5) * 220, s[1] + 60 + R() * 140, d + 1)); } return out; }
    let lt = performance.now();
    (function f(now) { requestAnimationFrame(f); if (!vis(sec) || introActive()) return; const t = now / 1000, dt = Math.min(0.05, (now - lt) / 1000); lt = now;
      x.clearRect(0, 0, W, H); x.drawImage(bg, -pmx * 10, -pmy * 6, W, H);
      x.globalAlpha = 0.9; x.drawImage(clouds, -((t * 6) % (W * 0.5)) - pmx * 30, -pmy * 14, W * 1.5, H * 0.7); x.globalAlpha = 1;
      // sketches (rotating schematics)
      x.save(); x.strokeStyle = 'rgba(210,225,255,.35)'; x.lineWidth = 1; sketches.forEach((k) => { x.save(); x.translate(k.x - pmx * 20, k.y - pmy * 10); x.rotate(t * k.sp); x.beginPath(); x.arc(0, 0, k.r, 0, TAU); x.stroke();
        if (k.k === 0) { x.beginPath(); for (let i = 0; i < 3; i++) { const a = i * TAU / 3 - Math.PI / 2; i ? x.lineTo(Math.cos(a) * k.r, Math.sin(a) * k.r) : x.moveTo(Math.cos(a) * k.r, Math.sin(a) * k.r); } x.closePath(); x.stroke(); }
        else if (k.k === 1) { for (let i = 0; i < 12; i++) { const a = i * TAU / 12; x.beginPath(); x.moveTo(Math.cos(a) * k.r, Math.sin(a) * k.r); x.lineTo(Math.cos(a) * k.r * 1.15, Math.sin(a) * k.r * 1.15); x.stroke(); } x.beginPath(); x.arc(0, 0, k.r * 0.4, 0, TAU); x.stroke(); }
        else { for (let i = -6; i <= 6; i++) { const yy = i * k.r / 6, w = Math.sin(i * 0.8 + t) * k.r * 0.5; x.beginPath(); x.moveTo(-w, yy); x.lineTo(w, yy); x.stroke(); } } x.restore(); }); x.restore();
      // handwritten notes
      x.save(); notes.forEach((n) => { const a = 0.25 + 0.3 * Math.sin(t * n.sp + n.ph); x.save(); x.translate(n.x - pmx * 25, n.y - pmy * 12); x.rotate(n.rot); x.font = `${n.s}px "La Belle Aurore", cursive`; x.fillStyle = `rgba(225,232,255,${a})`; x.fillText(n.n, 0, 0); x.restore(); }); x.restore();
      x.drawImage(far, -pmx * 18, -pmy * 6, W, H);
      // lightning strikes the spire
      boltT -= dt; if (boltT <= 0) { bolt = makeBolt(spireX + (R() - 0.5) * 300, -10, spireX - pmx * 40, spireY); boltT = 2.5 + R() * 3; flash = 1; setTimeout(() => (bolt = null), 180); }
      if (bolt) { x.save(); x.globalCompositeOperation = 'lighter'; bolt.forEach((b, i) => { x.strokeStyle = i ? 'rgba(170,215,255,.55)' : '#f2f9ff'; x.lineWidth = i ? 1.2 : 2.6; x.shadowColor = '#8fd0ff'; x.shadowBlur = 24; x.beginPath(); b.forEach(([px, py], j) => (j ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke(); }); x.restore(); }
      if (flash > 0.01) { x.fillStyle = `rgba(150,190,255,${flash * 0.25})`; x.fillRect(0, 0, W, H); flash *= 0.88; }
      x.drawImage(near, -pmx * 34, -pmy * 10, W, H);
      // laptop glow pulse in front of her
      const gx = W * 0.62 - pmx * 50, gy = H * 0.8 - 40 * H / 900; const gl = x.createRadialGradient(gx, gy, 0, gx, gy, 140 * H / 900); gl.addColorStop(0, `rgba(61,245,255,${0.35 + 0.1 * Math.sin(t * 2)})`); gl.addColorStop(1, 'rgba(61,245,255,0)');
      x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = gl; x.fillRect(gx - 200, gy - 200, 400, 400); x.restore();
      x.drawImage(me, -pmx * 50, -pmy * 14, W, H);
      const v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,4,12,.85)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    })(lt);
  }

  /* ===================== CORE HUB ===================== */
  function core() {
    const sv = $('#rings'); if (!sv) return; let h = '';
    const arc = (r, a0, a1) => { const p = (a) => [Math.cos(a) * r, Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`; };
    h += '<defs><path id="tp" d="M0,-300 A300,300 0 1 1 -0.1,-300"/><radialGradient id="rg"><stop offset="0" stop-color="#3df5ff" stop-opacity=".35"/><stop offset="1" stop-color="#3df5ff" stop-opacity="0"/></radialGradient><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3df5ff" stop-opacity="0"/><stop offset="1" stop-color="#3df5ff" stop-opacity=".45"/></linearGradient></defs>';
    h += '<circle r="180" fill="url(#rg)"/>';
    h += '<g class="r0"><circle r="360" fill="none" stroke="#3df5ff22" stroke-width="1"/>'; for (let i = 0; i < 120; i++) { const a = i / 120 * TAU, l = i % 10 ? 8 : 18; h += `<line x1="${Math.cos(a) * 350}" y1="${Math.sin(a) * 350}" x2="${Math.cos(a) * (350 - l)}" y2="${Math.sin(a) * (350 - l)}" stroke="#3df5ff" stroke-opacity="${i % 10 ? 0.35 : 0.8}"/>`; } h += '</g>';
    h += `<g class="r1"><text fill="#3df5ff" font-family="Share Tech Mono" font-size="15" letter-spacing="6" opacity=".75"><textPath href="#tp">N.O.V.A. · NAVYA'S OPERATIONAL VIRTUAL ASSISTANT · BIO · TECH · STORY · </textPath></text></g>`;
    h += `<g class="r2"><path d="${arc(255, 0, 2.2)}" fill="none" stroke="#3df5ff" stroke-width="6" opacity=".8"/><path d="${arc(255, 2.6, 4.0)}" fill="none" stroke="#ff4a1c" stroke-width="6" opacity=".85"/><path d="${arc(255, 4.4, 6.0)}" fill="none" stroke="#3df5ff" stroke-width="2" opacity=".6"/></g>`;
    h += `<g class="r3"><circle r="215" fill="none" stroke="#3df5ff" stroke-opacity=".5" stroke-dasharray="2 10"/><path d="${arc(200, 0, 1.2)}" fill="none" stroke="#ffb347" stroke-width="2"/><path d="${arc(200, 3.2, 4.8)}" fill="none" stroke="#ffb347" stroke-width="2"/></g>`;
    h += '<g class="r4"><path d="M0,0 L170,0 A170,170 0 0 0 147,-85 Z" fill="url(#sw)"/></g><circle r="170" fill="none" stroke="#3df5ff55"/><circle r="120" fill="none" stroke="#3df5ff33" stroke-dasharray="40 8"/>';
    sv.innerHTML = h; const gs = ['.r0', '.r1', '.r2', '.r3', '.r4'].map((s) => sv.querySelector(s)), sp = [0.05, -0.08, 0.15, -0.22, 0.9];
    (function f(now) { requestAnimationFrame(f); if (!vis(sv)) return; const t = now / 1000; gs.forEach((g, i) => g.setAttribute('transform', `rotate(${(t * sp[i] * 57.3) % 360})`)); })(0);
    const say = $('#coreSay'), lines = ['good evening, navya.', 'all systems nominal. chai: low.', '3 modules detected.', 'recommendation: hire navya.', 'sleep schedule: corrupted.']; let li = 0;
    const loop = async () => { while (true) { if (vis(say)) await typeInto(say, lines[li++ % lines.length], 40); await new Promise((r) => setTimeout(r, 2200)); } }; loop();
    const wv = $('#wave'), wx = wv.getContext('2d'); wv.width = 440; wv.height = 80;
    (function f(now) { requestAnimationFrame(f); if (!vis(wv)) return; const t = now / 1000; wx.clearRect(0, 0, 440, 80); wx.strokeStyle = '#3df5ff'; wx.shadowColor = '#3df5ff'; wx.shadowBlur = 8; wx.lineWidth = 2; wx.beginPath();
      for (let i = 0; i <= 440; i += 4) { const a = Math.sin(i * 0.05 + t * 6) * Math.sin(i * 0.013 + t) * 26 * Math.sin((i / 440) * Math.PI); i ? wx.lineTo(i, 40 + a) : wx.moveTo(i, 40 + a); } wx.stroke(); })(0);
  }

  /* ===================== TECH: hologram workshop + terminal ===================== */
  function tech() {
    const sec = $('#tech'), cv = $('#holoGL'); if (!sec || !window.THREE) return;
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio, 1.6)); r.setClearColor('#04060c');
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); cam.position.set(0, 1.4, 7.5); cam.lookAt(0, 0.6, 0);
    const C = new THREE.Color('#3df5ff'), lineM = () => new THREE.LineBasicMaterial({ color: C, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const grid = new THREE.GridHelper(40, 80, '#3df5ff', '#0f3a52'); grid.material.transparent = true; grid.material.opacity = 0.25; grid.position.y = -1.4; sc.add(grid);
    const disc = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.15, 64), new THREE.MeshBasicMaterial({ color: '#3df5ff', transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); disc.rotation.x = -Math.PI / 2; disc.position.y = -1.38; sc.add(disc);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.05, 3.4, 48, 1, true), new THREE.ShaderMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying float vY;void main(){vY=uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying float vY;void main(){gl_FragColor=vec4(.24,.96,1.,(1.-vY)*.13);}' })); beam.position.y = 0.3; sc.add(beam);
    const wire = (geo) => { const g = new THREE.Group(); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), lineM())); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#bffaff', size: 0.04, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(pts); return g; };
    const objs = [];
    { const g = new THREE.Group(); g.add(wire(new THREE.IcosahedronGeometry(1.3, 1))); const inner = wire(new THREE.IcosahedronGeometry(0.6, 0)); g.add(inner); g.userData.spin = (t) => { inner.rotation.set(-t, t * 1.3, 0); }; objs.push(g); }
    { const g = new THREE.Group(), layers = [4, 7, 7, 3], nodes = []; layers.forEach((n, l) => { const col = []; for (let i = 0; i < n; i++) col.push(new THREE.Vector3((l - 1.5) * 1.0, (i - (n - 1) / 2) * 0.36, 0)); nodes.push(col); });
      const pos = []; nodes.forEach((col, l) => { if (l < nodes.length - 1) col.forEach((a) => nodes[l + 1].forEach((b) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z))); });
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const lm = lineM(); lm.opacity = 0.35; g.add(new THREE.LineSegments(lg, lm));
      nodes.flat().forEach((v) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#bffaff' })); s.position.copy(v); g.add(s); }); g.userData.spin = (t) => { g.children.forEach((c, i) => { if (c.isMesh) c.scale.setScalar(1 + 0.4 * Math.max(0, Math.sin(t * 4 - c.position.x * 2 + i))); }); }; objs.push(g); }
    { const g = new THREE.Group(); g.add(wire(new THREE.TorusKnotGeometry(0.9, 0.28, 90, 10, 2, 3))); const sc2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.02), new THREE.MeshBasicMaterial({ color: '#ff4a1c', transparent: true, blending: THREE.AdditiveBlending })); g.add(sc2); g.userData.spin = (t) => { sc2.position.y = Math.sin(t * 1.5) * 1.1; }; objs.push(g); }
    { const g = new THREE.Group(), pos = []; let prev = null; for (let i = 0; i <= 80; i++) { const t = i / 80 * TAU * 2.2, y = (i / 80 - 0.5) * 3, a = new THREE.Vector3(Math.cos(t) * 0.7, y, Math.sin(t) * 0.7), b = a.clone().multiply(new THREE.Vector3(-1, 1, -1));
        if (prev) pos.push(prev[0].x, prev[0].y, prev[0].z, a.x, a.y, a.z, prev[1].x, prev[1].y, prev[1].z, b.x, b.y, b.z); if (i % 4 === 0) pos.push(a.x, a.y, a.z, b.x, b.y, b.z); prev = [a, b]; }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.add(new THREE.LineSegments(lg, lineM())); g.rotation.z = 0.4; objs.push(g); }
    { const g = new THREE.Group(); g.add(wire(new THREE.BoxGeometry(2, 0.18, 2))); g.add(wire(new THREE.BoxGeometry(1, 0.3, 1))); const pos = []; for (let i = 0; i < 8; i++) { const o = -0.85 + i * 0.243; [[o, 1, o, 1.35], [o, -1, o, -1.35]].forEach(([x1, z1, x2, z2]) => pos.push(x1, 0, z1, x2, -0.25, z2)); [[1, o, 1.35, o], [-1, o, -1.35, o]].forEach(([x1, z1, x2, z2]) => pos.push(x1, 0, z1, x2, -0.25, z2)); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.add(new THREE.LineSegments(lg, lineM())); g.rotation.x = 0.5; objs.push(g); }
    const info = [['01', 'PROMPTOPS LIBRARY', 'Structured prompt systems for sales copy, research summaries and data extraction, scored with evals before and after.', ['claude', 'gpt', 'evals', 'json schemas']],
      ['02', 'INBOX-TO-SHEET AGENT', 'A Python agent that reads lead emails, tags intent and logs everything to a CRM sheet. No more copy-paste Mondays.', ['python', 'apis', 'pandas']],
      ['03', 'EXPLAINABLE SCAN CLASSIFIER', 'A CNN that flags abnormalities in medical scans, with Grad-CAM heatmaps so clinicians can see why it decided.', ['pytorch', 'cnn', 'grad-cam']],
      ['04', 'GENE EXPRESSION EXPLORER', 'Differential expression analysis with interactive volcano plots, built from public GEO datasets.', ['biopython', 'scanpy', 'plotly']],
      ['05', '48-HOUR WEB APPS', 'Landing pages, dashboards and micro-SaaS built AI-first: idea to live URL in a weekend.', ['next.js', 'cursor', 'vercel']]];
    const holder = new THREE.Group(); holder.position.y = 0.55; sc.add(holder); let cur = -1, glitch = 0; const infoEl = $('#holoInfo');
    const show = (i) => { if (i === cur) return; cur = i; holder.clear(); holder.add(objs[i]); glitch = 1; const [n, h, p, tags] = info[i];
      infoEl.innerHTML = `<div class="n">PROJECT ${n} / 05</div><h3></h3><p>${p}</p><div class="tags">${tags.map((t) => `<span>${t}</span>`).join('')}</div>`; typeInto(infoEl.querySelector('h3'), h, 30); };
    show(0);
    let drag = false, lx = 0, vy = 0.3, rx = 0; cv.style.pointerEvents = 'auto';
    cv.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; cv.setPointerCapture(e.pointerId); }); cv.addEventListener('pointerup', () => (drag = false));
    cv.addEventListener('pointermove', (e) => { if (!drag) return; vy = (e.clientX - lx) * 0.01; rx += (e.movementY || 0) * 0.005; lx = e.clientX; });
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); holder.position.x = w > 900 ? 0.4 : 0; }; size(); addEventListener('resize', size);
    (function f(now) { requestAnimationFrame(f); if (!vis(sec)) return; const t = now / 1000, p = prog(sec); show(Math.min(4, Math.floor(p * 5)));
      if (!drag) vy += (0.3 - vy) * 0.02; holder.rotation.y += vy * 0.02; holder.rotation.x = rx + Math.sin(t * 0.5) * 0.08; objs[cur].userData.spin && objs[cur].userData.spin(t);
      glitch *= 0.9; holder.scale.set(1 + glitch * 0.3, 1 - glitch * 0.5, 1); holder.position.x += (R() - 0.5) * glitch * 0.2;
      holder.traverse((o) => { if (o.material && o.material.opacity !== undefined && o.material.blending === THREE.AdditiveBlending) o.material.opacity = (0.7 + 0.25 * Math.sin(t * 30 + o.id)) * (R() < glitch ? 0.2 : 1); });
      disc.rotation.z = t; r.render(sc, cam); })(0);
    // terminal
    const out = $('#tOut'), inp = $('#tIn'), hist = []; let hi = 0;
    const print = (s, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = s; out.appendChild(d); out.scrollTop = out.scrollHeight; };
    const jokes = ['why did the bioengineer break up with the biologist? no chemistry in the code.', 'my code works and i have no idea why. my code fails and i have no idea why. balance.', 'i told my model a joke. it overfit and now only laughs at that one.', 'there are 10 kinds of people: those who get binary and those who drink chai.'];
    const cmds = { help: () => 'commands: whoami · skills · projects · domains · chai · joke · hire · clear',
      whoami: () => 'Navya Gupta. 3rd-year B.Tech Bioengineering @ VIT Bhopal.\nbioengineer · coder · storyteller. AI × medtech is the dream.',
      skills: () => 'python · pandas · pytorch · prompt engineering · bioinformatics\nexcel ops · digital marketing · storytelling · negotiation (ask the sabzi-wala)',
      projects: () => info.map((i) => `[${i[0]}] ${i[1].toLowerCase()}`).join('\n'), domains: () => 'tech  → #tech\nbio   → #bio\nmarketing → #mkt\n(type the name to jump)',
      tech: () => (location.hash = 'tech', 'jumping to module 01…'), bio: () => (setTimeout(() => $('#bio').scrollIntoView({ behavior: 'smooth' }), 200), 'jumping to module 02…'), marketing: () => (setTimeout(() => $('#mkt').scrollIntoView({ behavior: 'smooth' }), 200), 'jumping to module 03…'),
      chai: () => '☕ brewing cutting chai… extra adrak… done.\nproductivity +40%. typos −12%.', joke: () => jokes[(R() * jokes.length) | 0],
      hire: () => (setTimeout(() => $('#contact').scrollIntoView({ behavior: 'smooth' }), 400), 'initiating hire protocol… excellent choice.'),
      hello: () => 'hello, human. navya is probably debugging. how can i help? (try help)', hi: () => cmds.hello(), sudo: () => 'nice try. N.O.V.A. only makes chai.', clear: () => { out.innerHTML = ''; return null; } };
    print('N.O.V.A. terminal v4.2 · type "help" to begin'); print('tip: try "chai" or "hire"', 'u');
    inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp') { inp.value = hist[Math.max(0, --hi)] || ''; return; } if (e.key !== 'Enter') return; const v = inp.value.trim(); inp.value = ''; if (!v) return; hist.push(v); hi = hist.length;
      print('navya@nova:~$ ' + v, 'u'); const c = cmds[v.toLowerCase().split(' ')[0]]; const res = c ? c() : `command not found: ${v}. even N.O.V.A. needs chai sometimes. try "help".`; if (res) print(res, c ? '' : 'e'); });
    inp.addEventListener('focus', () => cur.classList && 0);
  }

  /* ===================== BIO: glowing human blueprint ===================== */
  function bio() {
    const sec = $('#bio'), cv = $('#bioCv'), x = cv.getContext('2d'); if (!sec) return;
    let W, H, D, S, CX, CY, paper, sketch, veinL, vx, segs = [], maxO = 1, drawn = 0;
    const KP = { brain: [0, -218], heart: [-10, -128], lungs: [26, -112], dna: [205, -40], hand: [148, 80] };
    const bodyMask = (g) => { const cap = (a, b, c, d, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };
      g.beginPath(); g.ellipse(0, -215, 26, 32, 0, 0, TAU); g.fill(); g.fillRect(-11, -188, 22, 22);
      g.beginPath(); g.moveTo(-58, -170); g.quadraticCurveTo(-68, -120, -48, -60); g.lineTo(-42, -10); g.quadraticCurveTo(-48, 12, -46, 22); g.lineTo(46, 22); g.quadraticCurveTo(48, 12, 42, -10); g.lineTo(48, -60); g.quadraticCurveTo(68, -120, 58, -170); g.quadraticCurveTo(0, -186, -58, -170); g.fill();
      [-1, 1].forEach((s) => { cap(s * 60, -160, s * 108, -42, 24); cap(s * 108, -42, s * 140, 58, 19); g.beginPath(); g.ellipse(s * 147, 80, 11, 18, s * -0.2, 0, TAU); g.fill(); cap(s * 26, 14, s * 34, 130, 38); cap(s * 34, 130, s * 40, 236, 26); g.beginPath(); g.ellipse(s * 46, 246, 17, 8, 0, 0, TAU); g.fill(); }); };
    function build() { D = Math.min(devicePixelRatio, 1.5); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * D; cv.height = H * D; x.setTransform(D, 0, 0, D, 0, 0);
      S = Math.min(H / 600, W / 700) * 0.95; CX = W > 900 ? W * 0.6 : W * 0.5; CY = H * 0.53;
      const mk = () => { const c = document.createElement('canvas'); c.width = W * D; c.height = H * D; const g = c.getContext('2d'); g.setTransform(D, 0, 0, D, 0, 0); return [c, g]; };
      let g; [paper, g] = mk(); const gr = g.createRadialGradient(CX, CY, 0, CX, CY, W * 0.75); gr.addColorStop(0, '#2a120a'); gr.addColorStop(0.5, '#120807'); gr.addColorStop(1, '#04060c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { const px = R() * W, py = R() * H, rr = 40 + R() * 180, gg = g.createRadialGradient(px, py, 0, px, py, rr); gg.addColorStop(0, `rgba(${R() < 0.5 ? '20,6,2' : '140,70,30'},${R() * 0.18})`); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
      g.strokeStyle = 'rgba(255,180,110,.06)'; for (let gx = 0; gx < W; gx += 40) { g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke(); } for (let gy = 0; gy < H; gy += 40) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); }
      g.fillStyle = 'rgba(255,225,180,.12)'; const words = 'the heart pumps five litres a minute and the brain runs on twenty watts and every cell holds a copy of the code we are machines that dream and learn and heal and i want to build tools that help them heal faster'.split(' ');
      for (let i = 0; i < 46; i++) { g.font = `${12 + R() * 8}px "La Belle Aurore", cursive`; let l = ''; for (let k = 0; k < 6 + R() * 6; k++) l += words[(R() * words.length) | 0] + ' '; const px = R() < 0.5 ? R() * W * 0.32 : W * 0.7 + R() * W * 0.3; g.fillText(l, px, R() * H); }
      g.strokeStyle = 'rgba(255,220,170,.18)'; g.lineWidth = 1; for (let i = 0; i < 8; i++) { const px = R() * W, py = R() * H, rr = 30 + R() * 70; g.beginPath(); g.arc(px, py, rr, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(px - rr, py); g.lineTo(px + rr, py); g.moveTo(px, py - rr); g.lineTo(px, py + rr); g.stroke(); }
      // skeleton + outline sketch
      [sketch, g] = mk(); g.save(); g.translate(CX, CY); g.scale(S, S); g.strokeStyle = 'rgba(255,230,190,.42)'; g.lineWidth = 1.2 / S;
      const outline = document.createElement('canvas'); outline.width = 400; outline.height = 560; const og = outline.getContext('2d'); og.translate(200, 280); og.fillStyle = '#fff'; og.strokeStyle = '#fff'; bodyMask(og);
      vx = og.getImageData(0, 0, 400, 560).data; const inside = (px, py) => { const ix = Math.round(px + 200), iy = Math.round(py + 280); if (ix < 0 || iy < 0 || ix >= 400 || iy >= 560) return false; return vx[(iy * 400 + ix) * 4 + 3] > 100; };
      for (let a = 0; a < TAU; a += 0.01) { } // (edge sketch done below)
      g.beginPath(); g.moveTo(0, -182); g.lineTo(0, 10); g.stroke(); for (let i = 0; i < 11; i++) { const yy = -160 + i * 11, w = 40 - Math.abs(i - 4) * 2.5; g.beginPath(); g.ellipse(0, yy, w, 6, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); }
      g.beginPath(); g.ellipse(0, -215, 24, 30, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(0, 18, 34, 14, 0, 0, Math.PI); g.stroke(); [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(s * 22, 22); g.lineTo(s * 33, 128); g.lineTo(s * 39, 232); g.stroke(); g.beginPath(); g.moveTo(s * 60, -160); g.lineTo(s * 106, -44); g.lineTo(s * 138, 56); g.stroke(); });
      // body edge (marching the mask)
      g.fillStyle = 'rgba(255,230,190,.5)'; for (let iy = 2; iy < 558; iy += 2) for (let ix = 2; ix < 398; ix += 2) { const a = vx[(iy * 400 + ix) * 4 + 3] > 100; if (a && (!(vx[(iy * 400 + ix - 2) * 4 + 3] > 100) || !(vx[(iy * 400 + ix + 2) * 4 + 3] > 100) || !(vx[((iy - 2) * 400 + ix) * 4 + 3] > 100) || !(vx[((iy + 2) * 400 + ix) * 4 + 3] > 100))) g.fillRect(ix - 200, iy - 280, 1.4, 1.4); }
      // DNA strand sketch
      g.strokeStyle = 'rgba(255,200,120,.55)'; for (let i = 0; i < 60; i++) { const yy = -140 + i * 4.5, a = i * 0.32; g.beginPath(); g.arc(205 + Math.cos(a) * 16, yy, 1.4, 0, TAU); g.arc(205 - Math.cos(a) * 16, yy, 1.4, 0, TAU); g.stroke(); if (i % 3 === 0) { g.beginPath(); g.moveTo(205 + Math.cos(a) * 16, yy); g.lineTo(205 - Math.cos(a) * 16, yy); g.stroke(); } }
      g.restore();
      // grow the vascular tree inside the mask
      segs = []; const H0 = KP.heart, targets = [[0, -228], [-148, 84], [148, 84], [-46, 248], [46, 248], [0, 15], [-30, -110], [30, -110]];
      const grow = (px, py, ang, steps, w, order, depth, target) => { for (let i = 0; i < steps && segs.length < 9000; i++) { if (target) { const ta = Math.atan2(target[1] - py, target[0] - px); let d = ta - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); ang += d * 0.25; }
          ang += (R() - 0.5) * 0.5; let nx = px + Math.cos(ang) * 3, ny = py + Math.sin(ang) * 3; let tries = 0; while (!inside(nx, ny) && tries++ < 6) { ang += (R() < 0.5 ? 1 : -1) * 0.8; nx = px + Math.cos(ang) * 3; ny = py + Math.sin(ang) * 3; } if (!inside(nx, ny)) return;
          segs.push([px, py, nx, ny, w, order]); px = nx; py = ny; order += 3; if (target && Math.hypot(target[0] - px, target[1] - py) < 6) target = null;
          if (depth < 4 && R() < (target ? 0.14 : 0.07)) grow(px, py, ang + (R() < 0.5 ? 1 : -1) * (0.5 + R() * 0.8), 10 + R() * 40, w * 0.62, order, depth + 1, null); } };
      targets.forEach((tg) => grow(H0[0], H0[1], Math.atan2(tg[1] - H0[1], tg[0] - H0[0]), 400, 2.6, 0, 0, tg));
      segs.sort((a, b) => a[5] - b[5]); maxO = segs.length ? segs[segs.length - 1][5] : 1; [veinL] = mk(); drawn = 0; }
    build(); addEventListener('resize', build);
    const callouts = $$('.callout', sec), thr = { brain: 0.2, heart: 0.34, lungs: 0.48, dna: 0.62, hand: 0.76 };
    const place = () => callouts.forEach((c) => { const [kx, ky] = KP[c.dataset.k]; const px = CX + kx * S, py = CY + ky * S, right = kx >= 0; c.style.left = (right ? px + 60 : px - 290) + 'px'; c.style.top = (py - 30) + 'px'; c.style.textAlign = right ? 'left' : 'right'; });
    place(); addEventListener('resize', place);
    (function f(now) { requestAnimationFrame(f); if (!vis(sec)) return; const t = now / 1000, p = prog(sec);
      x.clearRect(0, 0, W, H); x.drawImage(paper, 0, 0, W, H); x.globalAlpha = clamp(0.4 + p * 2); x.drawImage(sketch, 0, 0, W, H); x.globalAlpha = 1;
      // reveal veins incrementally
      const target = Math.floor(segs.length * clamp(p * 1.25)); const vg = veinL.getContext('2d');
      if (target < drawn) { vg.setTransform(1, 0, 0, 1, 0, 0); vg.clearRect(0, 0, veinL.width, veinL.height); drawn = 0; }
      if (target > drawn) { vg.setTransform(D * S, 0, 0, D * S, CX * D, CY * D); vg.lineCap = 'round'; vg.globalCompositeOperation = 'lighter';
        for (let i = drawn; i < target; i++) { const [a, b, c2, d, w] = segs[i]; vg.strokeStyle = 'rgba(255,40,20,.18)'; vg.lineWidth = w * 3.2; vg.beginPath(); vg.moveTo(a, b); vg.lineTo(c2, d); vg.stroke(); vg.strokeStyle = 'rgba(255,90,50,.9)'; vg.lineWidth = w; vg.stroke(); } drawn = target; }
      x.save(); x.shadowColor = '#ff2a1a'; x.shadowBlur = 18; x.drawImage(veinL, 0, 0, W, H); x.restore();
      // growth-front sparks + heart core + head rays
      x.save(); x.globalCompositeOperation = 'lighter'; x.translate(CX, CY); x.scale(S, S);
      for (let i = 0; i < 26 && drawn > 0; i++) { const sgm = segs[Math.max(0, drawn - 1 - ((R() * 400) | 0))]; if (!sgm) continue; x.fillStyle = `rgba(255,${180 + R() * 70 | 0},90,${0.5 + R() * 0.5})`; x.beginPath(); x.arc(sgm[2], sgm[3], 1 + R() * 1.6, 0, TAU); x.fill(); }
      const beat = Math.pow(Math.max(0, Math.sin(t * 5.2)), 8) + Math.pow(Math.max(0, Math.sin(t * 5.2 - 0.6)), 10) * 0.6; const hp = KP.heart, hr = 16 + beat * 8;
      const hg = x.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], hr * 3); hg.addColorStop(0, 'rgba(255,250,220,1)'); hg.addColorStop(0.25, 'rgba(255,190,90,.9)'); hg.addColorStop(1, 'rgba(255,80,20,0)'); x.fillStyle = hg; x.beginPath(); x.arc(hp[0], hp[1], hr * 3, 0, TAU); x.fill();
      const rays = 30 + p * 60; for (let i = 0; i < rays; i++) { const a = R() * TAU, l = 20 + R() * (80 + p * 160), o = [0, -218]; x.strokeStyle = `rgba(255,${170 + R() * 80 | 0},90,${R() * 0.35 * clamp(p * 2)})`; x.lineWidth = 0.6 + R(); x.beginPath(); x.moveTo(o[0] + Math.cos(a) * 30, o[1] + Math.sin(a) * 36); x.lineTo(o[0] + Math.cos(a) * l, o[1] + Math.sin(a) * l); x.stroke(); }
      x.restore();
      // leader lines + callouts
      callouts.forEach((c) => { const on = p >= thr[c.dataset.k]; c.classList.toggle('on', on); if (!on) return; const [kx, ky] = KP[c.dataset.k], px = CX + kx * S, py = CY + ky * S, right = kx >= 0;
        x.strokeStyle = 'rgba(255,190,110,.7)'; x.lineWidth = 1; x.beginPath(); x.arc(px, py, 5, 0, TAU); x.moveTo(px + (right ? 5 : -5), py); x.lineTo(px + (right ? 55 : -55), py - 20); x.stroke(); });
      $('#bioDefn').classList.toggle('on', p > 0.88);
    })(0);
  }


  /* ===================== BRAIN: particle brain that assembles / disperses ===================== */
  function brain() {
    const sec = $('#brain'), cv = $('#brainGL'); if (!sec || !window.THREE) return;
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100); cam.position.set(0, 0.2, 7.5);
    const N = innerWidth < 700 ? 9000 : 16000, home = new Float32Array(N * 3), dust = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N);
    const gold = new THREE.Color('#ffb347'), purp = new THREE.Color('#8a5cff'), cyan = new THREE.Color('#3df5ff'), c = new THREE.Color();
    for (let i = 0; i < N; i++) { let x, y, z; const k = R();
      if (k < 0.84) { const side = R() < 0.5 ? -1 : 1, u = R() * TAU, v = Math.acos(2 * R() - 1); let rx = Math.sin(v) * Math.cos(u), ry = Math.cos(v), rz = Math.sin(v) * Math.sin(u);
        if (rx * side < -0.15) rx = -rx * 0.2; const g = 1 + 0.07 * Math.sin(u * 9 + Math.sin(v * 7) * 2.5) * Math.sin(v * 11 + u * 3) + 0.03 * Math.sin(u * 23 + v * 17); const sh = 0.85 + R() * 0.15;
        x = side * 0.06 + rx * 0.82 * g * sh + side * 0.02; y = ry * 0.78 * g * sh + 0.15; z = rz * 1.15 * g * sh; if (y < -0.25 && z < 0) y = -0.25 + (y + 0.25) * 0.3; }
      else if (k < 0.95) { const u = R() * TAU, v = Math.acos(2 * R() - 1); x = Math.sin(v) * Math.cos(u) * 0.55; y = Math.cos(v) * 0.3 - 0.55; z = Math.sin(v) * Math.sin(u) * 0.38 - 0.75; const fol = 1 + 0.08 * Math.sin(y * 60); x *= fol; z *= fol; }
      else { const tt = R(); x = (R() - 0.5) * 0.22; y = -0.4 - tt * 1.1; z = -0.35 + (R() - 0.5) * 0.22 - tt * 0.15; }
      home.set([x * 1.7, y * 1.7, z * 1.7], i * 3); const rr = 5 + R() * 6, a = R() * TAU, b = Math.acos(2 * R() - 1); dust.set([Math.sin(b) * Math.cos(a) * rr, Math.cos(b) * rr * 0.6, Math.sin(b) * Math.sin(a) * rr], i * 3);
      c.copy(gold).lerp(purp, clamp((z * 0.5 + 0.5) * 0.9 + (R() - 0.5) * 0.3)); if (R() < 0.04) c.copy(cyan); col.set([c.r, c.g, c.b], i * 3); rnd[i] = R(); }
    pos.set(dust); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    const U = { uT: { value: 0 }, uFire: { value: 0 }, uPx: { value: r.getPixelRatio() } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      vertexShader: 'attribute float rnd;uniform float uT,uFire,uPx;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float fire=step(.985,fract(rnd*91.+uT*.7))*uFire;vC=color+fire*vec3(1.,.9,.7);vA=.55+rnd*.45+fire;gl_PointSize=(1.4+rnd*2.2+fire*5.)*uPx*(7.5/-mv.z);gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,vA*smoothstep(.5,0.,d));}' });
    const pts = new THREE.Points(geo, mat); sc.add(pts);
    // neural sparks: connection lines that flicker between random nearby points
    const LN = 260, lp = new Float32Array(LN * 6), lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#ffd29a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); pts.add(lines);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.62, 128), new THREE.MeshBasicMaterial({ color: '#8a5cff', transparent: true, opacity: 0.4, side: THREE.DoubleSide })); sc.add(ring);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.9, 2.91, 128, 1, 0, 4.4), new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.5, side: THREE.DoubleSide })); sc.add(ring2);
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); pts.position.x = ring.position.x = ring2.position.x = w > 900 ? 0.2 : 0; }; size(); addEventListener('resize', size);
    let mx2 = 0, my2 = 0; sec.addEventListener('pointermove', (e) => { mx2 = e.clientX / innerWidth - 0.5; my2 = e.clientY / innerHeight - 0.5; });
    // HUD widgets
    const bars = $('#dnaBars'); let bh = ''; for (let i = 0; i < 46; i++) bh += `<rect x="${i * 3.9}" y="${R() * 30}" width="2.2" height="${20 + R() * 60}" fill="${R() < 0.15 ? '#ffb347' : '#3df5ff'}" opacity="${0.4 + R() * 0.6}"/>`; bars.innerHTML = bh;
    const ekg = $('#ekg'), ex = ekg.getContext('2d'); let ekgX = 0; const ekgY = (k) => { const m = k % 1; return m < 0.1 ? 0 : m < 0.13 ? -30 * Math.sin((m - 0.1) / 0.03 * Math.PI) : m < 0.16 ? 34 * Math.sin((m - 0.13) / 0.03 * Math.PI) : m < 0.3 ? -6 * Math.sin((m - 0.16) / 0.14 * Math.PI) : 0; };
    const st = $('#brSt'), na = $('#na'), txt = $('#brTxt'); let lastState = '';
    (function f(now) { requestAnimationFrame(f); if (!vis(sec)) return; const t = now / 1000, p = prog(sec);
      const asm = ease(clamp(p / 0.38)), dis = ease(clamp((p - 0.78) / 0.22)), k = asm * (1 - dis);
      for (let i = 0; i < N; i++) { const ri = rnd[i], kk = clamp((k - ri * 0.25) / 0.75), j = i * 3, sw = (1 - kk) * 0.3;
        pos[j] = dust[j] + (home[j] - dust[j]) * kk + Math.sin(t * 0.7 + ri * 40) * sw; pos[j + 1] = dust[j + 1] + (home[j + 1] - dust[j + 1]) * kk + Math.cos(t * 0.6 + ri * 30) * sw; pos[j + 2] = dust[j + 2] + (home[j + 2] - dust[j + 2]) * kk; }
      geo.attributes.position.needsUpdate = true; U.uT.value = t; U.uFire.value = k;
      if (k > 0.6) { for (let l = 0; l < LN; l++) { const a = (R() * N) | 0, b = Math.min(N - 1, a + 1 + ((R() * 40) | 0)); lp.set([pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], l * 6); } lg.attributes.position.needsUpdate = true; }
      lines.material.opacity = clamp((k - 0.6) * 2.5) * (0.25 + 0.2 * Math.sin(t * 9));
      pts.rotation.y = t * 0.18 + mx2 * 0.8; pts.rotation.x = 0.15 + my2 * 0.4; ring.rotation.set(1.3, 0, t * 0.2); ring2.rotation.set(1.1, 0.3, -t * 0.3); ring.material.opacity = ring2.material.opacity = 0.15 + k * 0.4;
      const state = p < 0.38 ? 'assembling neurons…' : p < 0.78 ? 'online · thinking about chai' : 'dispersing → next module'; if (state !== lastState) { lastState = state; st.textContent = state; }
      na.textContent = Math.round(k * 97 + Math.sin(t * 3) * 2 * k);
      ex.fillStyle = 'rgba(6,10,20,.25)'; ex.fillRect(0, 0, 360, 90); const kx = t * 1.1; ex.strokeStyle = '#3df5ff'; ex.lineWidth = 2; ex.shadowColor = '#3df5ff'; ex.shadowBlur = 6; ex.beginPath(); for (let i = 0; i < 4; i++) { const xx = (ekgX + i) % 360; ex.moveTo(xx, 45 + ekgY(kx - (4 - i) * 0.003)); ex.lineTo(xx + 1, 45 + ekgY(kx)); } ex.stroke(); ekgX = (ekgX + 3) % 360;
      $('#bpm').textContent = 64 + Math.round(Math.sin(t * 0.5) * 3);
      r.render(sc, cam); })(0);
  }


  /* ===================== LIQUID GLASS CURSOR ===================== */
  function blobCursor() {
    const cv = $('#blob'); if (!cv || matchMedia('(hover:none)').matches) return; const gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true }); if (!gl) return;
    const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}';
    const fs = `precision highp float;varying vec2 uv;uniform float t;uniform vec2 v;uniform float hot;
      vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
      void main(){vec2 q=uv*1.25;float sp=length(v);vec2 dir=sp>0.0001?v/sp:vec2(1.,0.);float st=min(sp*6.,.55);
        vec2 qa=vec2(dot(q,dir),dot(q,vec2(-dir.y,dir.x)));qa.x/=1.+st;qa.y*=1.+st*.5;
        float a=atan(qa.y,qa.x);float r0=.55+hot*.12+.06*sin(a*3.+t*2.3)+.045*sin(a*5.-t*3.1)+.03*sin(a*2.+t*1.7)+st*.05*sin(a*7.+t*6.);
        float d=length(qa)-r0;float edge=smoothstep(.02,-.02,d);if(edge<=0.){gl_FragColor=vec4(0.);return;}
        float rim=smoothstep(-.22,0.,d);vec3 c=hue(fract(a/6.2832+t*.08+length(qa)*.6))*1.1;
        float spec=pow(max(0.,1.-length(qa-vec2(-.18,.2)*r0*1.6)*3.2),6.);
        vec3 col=c*rim*1.4+vec3(1.)*spec*.9+vec3(.05,.02,.08);float alpha=edge*(.18+rim*.85+spec);
        gl_FragColor=vec4(col,alpha);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(pr, 't'), uV = gl.getUniformLocation(pr, 'v'), uH = gl.getUniformLocation(pr, 'hot'); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, vx = 0, vy = 0, hot = 0, th = 0; addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    document.addEventListener('pointerover', (e) => { th = e.target.closest('a,button,input,.kcap,.mod,.suit,canvas') ? 1 : 0; });
    addEventListener('pointerdown', () => { hot = 1.6; });
    (function f(now) { requestAnimationFrame(f); const nx = x + (tx - x) * 0.18, ny = y + (ty - y) * 0.18; vx += ((nx - x) - vx) * 0.3; vy += ((ny - y) - vy) * 0.3; x = nx; y = ny; hot += (th - hot) * 0.12;
      cv.style.left = x + 'px'; cv.style.top = y + 'px'; gl.viewport(0, 0, 220, 220); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, now / 1000); gl.uniform2f(uV, vx * 0.01, -vy * 0.01); gl.uniform1f(uH, hot); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); })(0);
  }

  /* ===================== SOCIAL KEYBOARD ===================== */
  function socialKeys() {
    const ks = $$('.kcap'); if (!ks.length) return; const msgs = ['posted! the algorithm is pleased ✨', 'reel scheduled for 7:30 pm (peak chai hour)', 'hook rewritten. now it slaps.', 'carousel slide 10: the CTA. always the CTA.', 'going LIVE… brand teardown in 3, 2, 1', 'analytics: your audience loves stories, not ads'];
    ks.forEach((k, i) => k.addEventListener('click', () => { k.classList.add('dn'); setTimeout(() => k.classList.remove('dn'), 160); toast(msgs[i % msgs.length]); }));
  }

  /* ===================== THE FEED: tunnel of social screens ===================== */
  function feed() {
    const sec = $('#feed'), cv = $('#feedGL'); if (!sec || !window.THREE) return;
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 1.6)); r.outputEncoding = THREE.sRGBEncoding;
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200); sc.fog = new THREE.Fog('#0a0414', 10, 40);
    const hooks = ['STOP SCROLLING', 'POV: your brand finally has a story', '3 HOOKS THAT ACTUALLY WORK', 'LIVE: brand teardown', 'chai & strategy · ep 12', 'CAROUSEL: 10 slides, 1 big idea', 'why nobody reads your caption', 'REEL: 0 to 100k', 'storytelling > selling', 'excel ops but make it aesthetic', 'BTS: how i plan 30 days', 'medtech, but explained simply'];
    const pals = [['#7b2cff', '#ff4fb8'], ['#ff7a3d', '#ffd23f'], ['#2a5cff', '#3df5ff'], ['#e0242f', '#ff8a3d'], ['#1f8a5a', '#d4ff3a'], ['#3a0f6a', '#c9a2ff']];
    const card = (i) => { const c = document.createElement('canvas'); c.width = 512; c.height = 320; const x = c.getContext('2d'), p = pals[i % pals.length], g = x.createLinearGradient(0, 0, 512, 320); g.addColorStop(0, p[0]); g.addColorStop(1, p[1]); x.fillStyle = g; x.fillRect(0, 0, 512, 320);
      for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(255,255,255,${R() * 0.08})`; x.beginPath(); x.arc(R() * 512, R() * 320, R() * 60, 0, TAU); x.fill(); }
      x.fillStyle = '#0008'; x.fillRect(0, 0, 512, 46); x.fillStyle = '#fff'; x.beginPath(); x.arc(26, 23, 14, 0, TAU); x.fill(); x.font = '600 20px Rajdhani, sans-serif'; x.fillText('@navya.creates', 50, 30);
      if (i % 3 === 0) { x.fillStyle = '#e0242f'; x.fillRect(420, 10, 74, 26); x.fillStyle = '#fff'; x.font = '700 16px Rajdhani'; x.fillText('● LIVE', 430, 29); }
      x.fillStyle = '#fff'; x.font = '900 40px Orbitron, sans-serif'; const words = hooks[i % hooks.length].split(' '); let line = '', y = 120; words.forEach((w) => { const tt = line ? line + ' ' + w : w; if (x.measureText(tt).width > 460) { x.fillText(line, 24, y); y += 46; line = w; } else line = tt; }); x.fillText(line, 24, y);
      x.font = '20px Rajdhani'; x.fillText(`♥ ${(R() * 90 + 5).toFixed(1)}k   💬 ${(R() * 900 | 0) + 40}   ↗ ${(R() * 20).toFixed(1)}k`, 24, 296);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; return t; };
    const rings = []; [[2.4, 6, 0], [4.2, 9, 1.6], [6.3, 12, 3.4], [8.8, 15, 5.4]].forEach(([rad, n, y], ri) => { const g = new THREE.Group(); g.position.y = y; const gap = 0.12, th = TAU / n - gap;
      for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, rad * 0.55, 16, 1, true, k * TAU / n, th), new THREE.MeshBasicMaterial({ map: card(ri * 20 + k), side: THREE.BackSide, toneMapped: false })); g.add(m);
        const edge = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.002, rad * 1.002, rad * 0.55 + 0.06, 16, 1, true, k * TAU / n - 0.01, th + 0.02), new THREE.MeshBasicMaterial({ color: '#8a5cff', side: THREE.BackSide, transparent: true, opacity: 0.6 })); edge.scale.set(1.01, 1, 1.01); g.add(edge); }
      g.userData.sp = (ri % 2 ? -1 : 1) * (0.08 + ri * 0.02); sc.add(g); rings.push(g); });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(2.3, 64), new THREE.ShaderMaterial({ transparent: true, vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec2 vU;void main(){float d=length(vU-.5)*2.;gl_FragColor=vec4(mix(vec3(.7,.35,1.),vec3(.25,.05,.5),d),1.-d*.6);}' })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.8; sc.add(floor);
    const me = new THREE.Group(), mm = new THREE.MeshStandardMaterial({ color: '#141018', roughness: 0.6 }); const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 8, 16), mm); body.position.y = -0.2; me.add(body);
    const headM = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), mm); headM.position.y = 0.28; me.add(headM); const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), mm); bun.position.set(0, 0.42, -0.04); me.add(bun);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.42, 6, 12), mm); arm.position.set(0.16, 0.25, 0.06); arm.rotation.z = -0.5; arm.rotation.x = -0.4; me.add(arm); me.position.y = -0.45; sc.add(me);
    sc.add(new THREE.AmbientLight('#8a5cff', 0.6)); const pl = new THREE.PointLight('#c9a2ff', 3, 6); pl.position.set(0, 0.5, 0); sc.add(pl);
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }; size(); addEventListener('resize', size);
    let mx3 = 0, my3 = 0; sec.addEventListener('pointermove', (e) => { mx3 = e.clientX / innerWidth - 0.5; my3 = e.clientY / innerHeight - 0.5; }); const nEl = $('#feedN');
    (function f(now) { requestAnimationFrame(f); if (!vis(sec)) return; const t = now / 1000, p = prog(sec), e = ease(p);
      cam.position.set(Math.sin(t * 0.1) * 0.3 + mx3 * 1.2, lerp(17, 2.4, e), lerp(2.2, 0.01, e) + my3 * 1.2); cam.lookAt(0, -0.6, 0); cam.rotation.z += t * 0.02;
      rings.forEach((g) => (g.rotation.y += g.userData.sp * 0.01)); me.rotation.y = Math.sin(t * 0.5) * 0.4; arm.rotation.z = -0.5 + Math.sin(t * 2) * 0.15;
      nEl.textContent = `● LIVE · ${(1200 + Math.round(p * 98000 + Math.sin(t) * 40)).toLocaleString('en-IN')} viewers`; r.render(sc, cam); })(0);
  }

  /* ===================== MARKETING: reach globe ===================== */
  function globe() {
    const cv = $('#globeGL'); if (!cv || !window.THREE) return; const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100); cam.position.set(0, 0.5, 7.4); cam.lookAt(0, 0, 0); const G = new THREE.Group(); sc.add(G);
    const N = 3200, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963; pos.set([Math.cos(th) * rr * 1.6, y * 1.6, Math.sin(th) * rr * 1.6], i * 3); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: '#3d8fff', size: 0.022, transparent: true, opacity: 0.75 })));
    G.add(new THREE.Mesh(new THREE.SphereGeometry(1.58, 48, 32), new THREE.MeshBasicMaterial({ color: '#030814' })));
    const atm = new THREE.Mesh(new THREE.SphereGeometry(1.75, 48, 32), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: 'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vN;void main(){float f=pow(.75-dot(vN,vec3(0,0,1.)),3.);gl_FragColor=vec4(mix(vec3(.24,.96,1.),vec3(1.,.29,.11),.35)*f,f);}' })); sc.add(atm);
    const ll = (la, lo, rad = 1.6) => { const p = (90 - la) * Math.PI / 180, t = (lo + 180) * Math.PI / 180; return new THREE.Vector3(-rad * Math.sin(p) * Math.cos(t), rad * Math.cos(p), rad * Math.sin(p) * Math.sin(t)); };
    const home = ll(23.26, 77.41), cities = [[19.07, 72.88], [28.61, 77.21], [12.97, 77.59], [25.2, 55.27], [51.5, -0.12], [40.71, -74], [1.35, 103.8], [35.68, 139.69], [-33.87, 151.2], [52.52, 13.4], [37.77, -122.4]];
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: '#ff4a1c' })); hm.position.copy(home); G.add(hm);
    const arcs = cities.map(([la, lo], i) => { const to = ll(la, lo), mid = home.clone().add(to).multiplyScalar(0.5); mid.setLength(1.6 + home.distanceTo(to) * 0.45); const curve = new THREE.QuadraticBezierCurve3(home, mid, to), pts = curve.getPoints(64);
      const g = new THREE.BufferGeometry().setFromPoints(pts), m = new THREE.Line(g, new THREE.LineBasicMaterial({ color: i % 2 ? '#3df5ff' : '#ff4a1c', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })); G.add(m);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff' })); G.add(dot); const cm = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffb347' })); cm.position.copy(to); G.add(cm);
      return { g, curve, dot, off: i * 0.37 }; });
    G.rotation.y = -1.9; G.rotation.x = 0.25; let drag = false, lx = 0, vy = 0.002;
    cv.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; }); addEventListener('pointerup', () => (drag = false)); cv.addEventListener('pointermove', (e) => { if (drag) { G.rotation.y += (e.clientX - lx) * 0.008; lx = e.clientX; } });
    const size = () => { const w = cv.clientWidth; r.setSize(w, w, false); }; size(); addEventListener('resize', size);
    (function f(now) { requestAnimationFrame(f); if (!vis(cv)) return; const t = now / 1000; if (!drag) G.rotation.y += vy;
      arcs.forEach((a) => { const k = ((t * 0.35 + a.off) % 1.4); a.g.setDrawRange(0, Math.floor(Math.min(1, k) * 65)); a.dot.position.copy(a.curve.getPoint(Math.min(1, k))); a.dot.visible = k < 1; });
      hm.scale.setScalar(1 + Math.sin(t * 4) * 0.4); r.render(sc, cam); })(0);
  }

  /* ===================== boot order ===================== */
  const afterIntro = () => { setTimeout(() => typeInto($('#greet'), 'N.O.V.A. › wake up, navya. the world needs your code.', 30), 600); };
  const start = () => { [hero, core, tech, bio, brain, globe, blobCursor, socialKeys, feed].forEach((fn) => { try { fn(); } catch (e) { console.error('nova init failed:', fn.name, e); } }); try { intro(afterIntro); } catch (e) { console.error(e); const i = $('#intro'); i && i.remove(); afterIntro(); } };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
})();
