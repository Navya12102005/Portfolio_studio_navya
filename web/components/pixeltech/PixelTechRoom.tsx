"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Px, R, stepped, useProgress } from "./pixel";
import Background, { DESK, H, SHELF_A, SHELF_B, W, type Fx } from "./Background";
import Monitor, { type MonitorFx } from "./Monitor";
import { SeatedGirl, StandingGirl, type Face } from "./Girl";
import { BLOOM, CAP, DINO, DINO_OPEN, FIREBALL, MUG, PLANT, SHARDS, VASE } from "./sprites";
import { soundFX } from "@/utils/soundManager";

/* positions in scene pixels (the scene is 480 x 270) */
const GX = 292, GY = 138;                          // seated girl: top-left of her head box
const STAND = { cx: 404, feetY: 234 };             // where she stands for the cap dance
const CAP_AT = { hook: { x: 334, y: 70 }, stand: { x: STAND.cx - 5, y: STAND.feetY - 113 }, seated: { x: GX + 11, y: GY - 10 } };
const MUG_X = 192, MUG_Y = DESK - 6;
const VASE_X = 384, DINO_X = 356;

type Spot = { k: string; x: number; y: number; w: number; h: number; label: string; ms?: number; click?: string[]; clickMs?: number; focus?: boolean };
/** every hoverable / clickable thing in the room. `k` is the effect that plays on hover; `click` are extra effects on click. */
const SPOTS: Spot[] = [
  { k: "moon", x: 78, y: 42, w: 22, h: 20, label: "Moon: glows. Click for a shooting star", ms: 1900, click: ["shoot"], clickMs: 1000 },
  { k: "cloud", x: 44, y: 54, w: 22, h: 8, label: "Clouds drift away", ms: 2000 },
  { k: "skyline", x: 34, y: 92, w: 72, h: 38, label: "City skyline: windows light up in a wave. Click for a plane", ms: 2200, click: ["plane"], clickMs: 2500 },
  { k: "curtain", x: 24, y: 28, w: 16, h: 100, label: "Curtain sways", ms: 2500 }, { k: "curtain", x: 96, y: 28, w: 16, h: 100, label: "Curtain sways", ms: 2500 },
  { k: "sill", x: 36, y: 122, w: 12, h: 14, label: "Window plant wiggles", ms: 1300 }, { k: "sill", x: 58, y: 122, w: 12, h: 14, label: "Window plant wiggles", ms: 1300 }, { k: "sill", x: 94, y: 122, w: 12, h: 14, label: "Window plant wiggles", ms: 1300 },
  { k: "sign", x: 204, y: 28, w: 66, h: 24, label: "Neon TECH sign: flickers. Click to relight letter by letter", ms: 1600, click: ["signsweep"], clickMs: 2200 },
  { k: "lights", x: 10, y: 10, w: 460, h: 18, label: "String lights chase", ms: 2600 },
  { k: "tube", x: 8, y: 3, w: 464, h: 7, label: "Neon tube changes colour", ms: 2500 },
  { k: "clock", x: 322, y: 28, w: 22, h: 22, label: "Wall clock spins", ms: 2000 },
  { k: "poster", x: 284, y: 28, w: 28, h: 34, label: "Rocket poster: launches", ms: 1700 },
  { k: "chip", x: 176, y: 30, w: 26, h: 32, label: "Chip poster blinks", ms: 2400 },
  { k: "hearts", x: 118, y: 36, w: 22, h: 22, label: "Heart frame: hearts float up", ms: 2000 },
  { k: "notes", x: 126, y: 86, w: 24, h: 32, label: "Sticky notes flutter. Click to read one", ms: 1400, click: ["note2"], clickMs: 2200 },
  { k: "pad", x: 30, y: 192, w: 16, h: 7, label: "Console: controller rumbles. Click to change game", ms: 1500 },
  { k: "pad", x: 60, y: 195, w: 9, h: 5, label: "Controller rumbles. Click to change game", ms: 1500 },
  { k: "cart", x: 74, y: 188, w: 7, h: 8, label: "Cartridge: click to load a new game", ms: 1500 },
  { k: "robot", x: 458, y: 82, w: 10, h: 10, label: "Robot: eyes follow you", ms: 2600 },
  { k: "trophy", x: 430, y: 82, w: 8, h: 10, label: "Trophy: shines. Click to win", ms: 1800, click: ["winner"], clickMs: 2200 },
  { k: "rocketfig", x: 444, y: 81, w: 6, h: 11, label: "Rocket: fires its engine. Click to blast off", ms: 1400, click: ["blast"], clickMs: 2300 },
  { k: "floppy", x: 426, y: 102, w: 10, h: 26, label: "Floppy disks: click to load one", ms: 2300 },
  { k: "lava1", x: 448, y: 115, w: 7, h: 14, label: "Lava lamp: blobs speed up. Click to change colour", ms: 2200 },
  { k: "cart2", x: 414, y: 120, w: 7, h: 8, label: "Game cartridge wiggles", ms: 900 },
  { k: "cat1", x: 372, y: 154, w: 10, h: 10, label: "Cat plush: blinks. Click to jump", ms: 1800, click: ["catj1"], clickMs: 800 },
  { k: "console2", x: 392, y: 158, w: 16, h: 6, label: "Console wiggles", ms: 900 }, { k: "pad2", x: 412, y: 159, w: 9, h: 5, label: "Controller rumbles", ms: 1500 },
  { k: "arcade", x: 430, y: 142, w: 22, h: 22, label: "Mini arcade: lights up", ms: 2600 },
  { k: "cactus", x: 458, y: 154, w: 7, h: 10, label: "Cactus grows a flower", ms: 1800 }, { k: "cactus", x: 106, y: 164, w: 7, h: 10, label: "Cactus grows a flower", ms: 1800 },
  { k: "cat2", x: 380, y: 164, w: 10, h: 10, label: "Cat plush: blinks. Click to jump", ms: 1800, click: ["catj2"], clickMs: 800 },
  { k: "lava2", x: 368, y: 161, w: 6, h: 13, label: "Lava lamp: blobs speed up. Click to change colour", ms: 2200 },
  { k: "speaker", x: 128, y: 142, w: 20, h: 32, label: "Speaker pulses and plays notes", ms: 2500 },
  { k: "keys", x: 214, y: 168, w: 72, h: 8, label: "Keyboard: keys light up", ms: 1900 },
  { k: "duck", x: 154, y: 65, w: 7, h: 7, label: "Rubber duck: quack", ms: 1800 }, { k: "duck", x: 26, y: 135, w: 7, h: 7, label: "Rubber duck: quack", ms: 1800 },
  { k: "drawer", x: 156, y: 181, w: 50, h: 20, label: "Drawer slides open", ms: 2700 },
  { k: "pc", x: 124, y: 186, w: 26, h: 39, label: "PC tower: lights speed up. Click to change colour", ms: 2400 },
  { k: "box", x: 420, y: 202, w: 34, h: 23, label: "Box pops open", ms: 2500 },
  { k: "bigplant", x: 446, y: 148, w: 34, h: 52, label: "Big plant rustles", ms: 2000 },
  { k: "skate", x: 106, y: 254, w: 28, h: 8, label: "Skateboard rolls away and back", ms: 3100 },
  { k: "rug", x: 222, y: 236, w: 190, h: 26, label: "Rug ripples", ms: 1800 },
  { k: "spin", x: 294, y: 192, w: 38, h: 34, label: "Chair: click to spin", ms: 1300 },
];

/** An invisible hit area over one object. Hover (mouse) triggers, tap/click/Enter fires the click effects. */
function Hot({ x, y, w, h, label, onEnter, onClick, onLeave, onMove, focus = true }: { x: number; y: number; w: number; h: number; label: string; onEnter?: () => void; onClick?: () => void; onLeave?: () => void; onMove?: (e: React.PointerEvent<SVGRectElement>) => void; focus?: boolean }) {
  const fire = onClick ?? onEnter;
  return (
    <rect x={x} y={y} width={w} height={h} fill="transparent" role="button" tabIndex={focus ? 0 : -1} aria-label={label} className="pt-hot" style={{ cursor: "pointer" }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") onEnter?.(); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") onLeave?.(); }} onPointerMove={onMove}
      onClick={() => fire?.()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire?.(); } }} />
  );
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function PixelTechRoom({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => { const t = timers.current; return () => t.forEach((id) => window.clearTimeout(id)); }, []);

  /* ---------- generic timed effects ---------- */
  const [act, setAct] = useState<Record<string, number>>({});
  const actRef = useRef<Record<string, number>>({});
  const nonce = useRef(0);
  const [party, setParty] = useState(false);
  const is = useCallback((k: string) => party || !!act[k], [party, act]);
  const trig = useCallback((k: string, ms = 1500) => {
    if (actRef.current[k]) return;
    const n = ++nonce.current;
    actRef.current = { ...actRef.current, [k]: n }; setAct(actRef.current);
    later(() => { if (actRef.current[k] === n) { actRef.current = { ...actRef.current, [k]: 0 }; setAct(actRef.current); } }, ms);
  }, [later]);
  const blip = useCallback((k: string) => { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) % 7; soundFX.playBlip(380 + h * 90, 55); }, []);

  /* ---------- persistent toggles + counters ---------- */
  const [dark, setDark] = useState(false);
  const [phones, setPhones] = useState(false);
  const [channel, setChannel] = useState(0);
  const [jump, setJump] = useState(0);
  const [lava, setLava] = useState(0);
  const [pcHue, setPcHue] = useState(0);
  const [book, setBook] = useState(-1);

  /* ---------- the girl + cap sequence + one-off objects (kept from before) ---------- */
  const [pose, setPose] = useState<"type" | "angry" | "hello" | "stand" | "dance">("type");
  const busy = useRef(false); // true during the cap sequence
  const [capPos, setCapPos] = useState<"hook" | "stand" | "seated">("hook");
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [rgaze, setRgaze] = useState({ x: 0, y: 0 });

  const [dino, setDino] = useState({ open: false, fire: 0 });
  const dinoBusy = useRef(false);
  const onDino = () => {
    if (dinoBusy.current) return; dinoBusy.current = true;
    setDino((d) => ({ open: true, fire: d.fire + 1 })); soundFX.playBlip(220, 180, 90);
    later(() => setDino((d) => ({ ...d, open: false })), 1000); later(() => { dinoBusy.current = false; }, 1500);
  };
  const [mugOn, setMugOn] = useState(false);
  const mugBusy = useRef(false);
  const mugP = useProgress(mugOn, 650, 6);
  const onMug = () => { if (mugBusy.current) return; mugBusy.current = true; setMugOn(true); soundFX.playBlip(300, 140, 160); later(() => setMugOn(false), 4300); later(() => { mugBusy.current = false; }, 5200); };
  const [vase, setVase] = useState<"shelf" | "wobble" | "fall" | "broken">("shelf");
  const onVase = () => {
    if (vase !== "shelf") return;
    setVase("wobble");
    later(() => setVase("fall"), 600);
    later(() => { setVase("broken"); soundFX.playBlip(900, 220, 120); if (!busy.current) setPose("angry"); }, 1500);
    later(() => { if (!busy.current) setPose("type"); }, 3400);
    later(() => setVase("shelf"), 5800);
  };
  const [bloom, setBloom] = useState(false);
  const bloomT = useRef<number | undefined>(undefined);
  const bloomStep = useProgress(bloom, 260, 3);
  const onPlantEnter = () => { window.clearTimeout(bloomT.current); setBloom(true); };
  const onPlantLeave = () => { window.clearTimeout(bloomT.current); bloomT.current = window.setTimeout(() => setBloom(false), 1600); };
  useEffect(() => () => window.clearTimeout(bloomT.current), []);
  const onCap = () => {
    if (busy.current) return; busy.current = true;
    const toHead = capPos === "hook";
    setPose("stand"); soundFX.playBlip(440, 90, 880);
    if (toHead) later(() => setCapPos("stand"), 450); else { setCapPos("stand"); later(() => setCapPos("hook"), 450); }
    later(() => setPose("dance"), 1000);
    later(() => { setPose("type"); if (toHead) setCapPos("seated"); busy.current = false; }, 3000);
  };
  const onHello = () => { if (busy.current || pose !== "type") return; setPose("hello"); soundFX.playBlip(660, 90, 990); later(() => setPose((p) => (p === "hello" ? "type" : p)), 1800); };

  /* ---------- monitor reactions ---------- */
  const [mon, setMon] = useState<MonitorFx>({});
  const [termOn, setTermOn] = useState(false);
  const [tvOn, setTvOn] = useState(false);
  const patchMon = (p: MonitorFx) => setMon((m) => ({ ...m, ...p }));

  /* ---------- pointer: scene coordinates, spotlight, parallax, gaze, robot eyes ---------- */
  const toScene = useCallback((cx: number, cy: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    const s = Math.max(r.width / W, r.height / H), ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2;
    return { x: (cx - r.left - ox) / s, y: (cy - r.top - oy) / s };
  }, []);
  const raf = useRef(0);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = svgRef.current; if (!el) return;
      const { x, y } = toScene(clientX, clientY);
      el.style.setProperty("--sx", x.toFixed(1)); el.style.setProperty("--sy", y.toFixed(1));
      el.style.setProperty("--px", String(Math.max(-3, Math.min(3, Math.round((x / W - 0.5) * 6)))));
      el.style.setProperty("--py", String(Math.max(-2, Math.min(2, Math.round((y / H - 0.5) * 4)))));
      const q = (v: number, a: number, b: number) => (v < a ? -1 : v > b ? 1 : 0);
      const g = { x: q(x - 316, -34, 34), y: q(y - 150, -34, 40) };
      setGaze((o) => (o.x === g.x && o.y === g.y ? o : g));
      const rg = { x: q(x - 463, -20, 20), y: q(y - 87, -14, 14) };
      setRgaze((o) => (o.x === rg.x && o.y === rg.y ? o : rg));
    });
  }, [toScene]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* ---------- keyboard: terminal typing, TV jump, secret code ---------- */
  const konami = useRef(0);
  useEffect(() => {
    const onKeyCapture = (e: KeyboardEvent) => {
      if (termOn) {
        if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); patchMon({ typed: "OK - BUILD PASSED" }); soundFX.playBlip(700, 90, 1200); later(() => patchMon({ typed: "" }), 1400); return; }
        if (e.key === "Backspace") { e.preventDefault(); e.stopPropagation(); setMon((m) => ({ ...m, typed: (m.typed ?? "").slice(0, -1) })); return; }
        if (e.key.length === 1 && /[a-z0-9 ]/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); setMon((m) => ((m.typed ?? "").length < 18 ? { ...m, typed: ((m.typed ?? "") + e.key).toUpperCase() } : m)); soundFX.playBlip(900, 25); return; }
      }
      if (tvOn && e.key === " ") { e.preventDefault(); e.stopPropagation(); setJump((j) => j + 1); soundFX.playBlip(500, 90, 900); }
    };
    const onKey = (e: KeyboardEvent) => {
      konami.current = e.key.toLowerCase() === KONAMI[konami.current].toLowerCase() ? konami.current + 1 : e.key.toLowerCase() === KONAMI[0].toLowerCase() ? 1 : 0;
      if (konami.current === KONAMI.length) { konami.current = 0; setParty(true); soundFX.playBlip(400, 400, 1600); later(() => setParty(false), 7000); }
    };
    window.addEventListener("keydown", onKeyCapture, true); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKeyCapture, true); window.removeEventListener("keydown", onKey); };
  }, [termOn, tvOn, later]);

  /* ---------- idle surprises: every so often she stretches ---------- */
  useEffect(() => {
    const id = window.setInterval(() => { if (!busy.current && !document.hidden) trig("stretch", 1300); }, 16000);
    return () => window.clearInterval(id);
  }, [trig]);

  /* ---------- fire an effect ---------- */
  const hover = (s: Spot) => { if (actRef.current[s.k]) return; trig(s.k, s.ms ?? 1500); blip(s.k); };
  const click = (s: Spot) => {
    hover(s);
    for (const c of s.click ?? []) trig(c, s.clickMs ?? 1500);
    switch (s.k) {
      case "pad": case "cart": setChannel((c) => c + 1); soundFX.playBlip(300, 160, 900); break;
      case "lava1": case "lava2": setLava((l) => (l + 1) % 4); break;
      case "pc": setPcHue((h) => (h + 1) % 6); break;
      case "robot": soundFX.playBlip(800, 90, 400); break;
      case "duck": soundFX.playBlip(1000, 70, 600); break;
      case "clock": soundFX.playBlip(1200, 200); break;
    }
  };
  const standing = pose === "stand" || pose === "dance";
  const face: Face = pose === "angry" ? "angry" : pose === "hello" ? "hello" : "side";
  const spill = Math.max(0, (mugP - 0.35) / 0.65);
  const SHELF_FLOOR = 228;

  const fx: Fx = useMemo(() => ({ is, dark, phones, channel, jump, gaze, rgaze, book, lava, pcHue }), [is, dark, phones, channel, jump, gaze, rgaze, book, lava, pcHue]);

  return (
    <div className={className} onPointerMove={onPointerMove}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full" style={{ imageRendering: "pixelated" }} role="group" aria-label="Pixel-art workstation. Hover or tap the objects in the room, click the red cap, or click the lamp to turn the lights off.">
        <defs>
          <radialGradient id="pt-hole"><stop offset="0" stopColor="#000" stopOpacity="1" /><stop offset="0.5" stopColor="#000" stopOpacity="0.85" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <radialGradient id="pt-spot"><stop offset="0" stopColor="#fff2d0" stopOpacity="0.16" /><stop offset="1" stopColor="#fff2d0" stopOpacity="0" /></radialGradient>
          <mask id="pt-darkmask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="#fff" />
            <circle cx={240} cy={122} r={115} fill="url(#pt-hole)" />
            <g className="pt-cursor"><circle r={50} fill="url(#pt-hole)" /></g>
          </mask>
        </defs>

        <Background fx={fx} />
        <Monitor x={150} y={72} live={!reduce} fx={{ ...mon, netSweep: mon.netSweep || is("netsweep") }} />

        {/* mug + spill */}
        <g>
          <motion.g initial={false} animate={{ opacity: spill > 0 ? 1 : 0 }}>
            <R x={MUG_X - 2 - Math.round(34 * spill)} y={DESK - 2} w={Math.round(34 * spill)} h={2} c="#5a2f1a" />
            <R x={MUG_X - 2 - Math.round(34 * spill)} y={DESK - 2} w={Math.round(34 * spill)} h={1} c="#7d4526" />
            {spill > 0.5 && <><R x={MUG_X - 8} y={DESK - 8} w={1} h={1} c="#7d4526" /><R x={MUG_X - 15} y={DESK - 11} w={1} h={1} c="#7d4526" /><R x={MUG_X - 3} y={DESK - 12} w={1} h={1} c="#7d4526" /></>}
            {spill > 0.9 && <R x={MUG_X - 36} y={DESK} w={1} h={3} c="#5a2f1a" />}
          </motion.g>
          <g transform={`translate(${MUG_X} ${MUG_Y + 6}) rotate(${-90 * mugP})`}><g transform="translate(0 -6)"><Px s={MUG} /></g></g>
          {mugP < 0.2 && <g className="pt-steam"><R x={MUG_X + 2} y={MUG_Y - 3} w={1} h={1} c="#fff" o={0.6} /><R x={MUG_X + 4} y={MUG_Y - 5} w={1} h={1} c="#fff" o={0.4} /></g>}
        </g>

        <g className={is("spin") ? "pt-spinchair" : undefined}>
          <SeatedGirl x={GX} y={GY} face={face} empty={standing} gaze={gaze} phones={phones} stretch={is("stretch")} />
        </g>

        {/* shelf A: dino + vase */}
        <g>
          <Px s={dino.open ? DINO_OPEN : DINO} x={DINO_X} y={SHELF_A - 14} />
          {dino.fire > 0 && (
            <motion.g key={dino.fire} initial={{ x: 0, opacity: 1 }} animate={{ x: 52, opacity: [1, 1, 1, 0] }} transition={{ duration: 0.9, ease: stepped(9) }}>
              <Px s={FIREBALL} x={DINO_X + 17} y={SHELF_A - 11} />
            </motion.g>
          )}
        </g>
        <g>
          {vase === "shelf" && <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />}
          {vase === "wobble" && (<motion.g animate={{ rotate: [0, -7, 7, -7, 7, 0] }} transition={{ duration: 0.6, ease: "linear" }} style={{ originX: 0.5, originY: 1 }}><Px s={VASE} x={VASE_X} y={SHELF_A - 13} /></motion.g>)}
          {vase === "fall" && (<motion.g initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: [0, -10, -20, -30, -36, -38, -39, -39], y: [0, 0, 0, 2, 24, 62, 108, SHELF_FLOOR - SHELF_A], rotate: [0, 0, 0, 12, 35, 70, 110, 150] }} transition={{ duration: 0.9, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }}><Px s={VASE} x={VASE_X} y={SHELF_A - 13} /></motion.g>)}
          {vase === "broken" && (
            <g>
              <Px s={SHARDS} x={VASE_X - 46} y={SHELF_FLOOR - 4} />
              <motion.g initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                {[[-3, -5], [3, -7], [8, -4], [-8, -3], [0, -9], [11, -8]].map(([dx, dy], i) => <R key={i} x={VASE_X - 38 + dx} y={SHELF_FLOOR - 4 + dy} w={1} h={1} c="#9fe6ff" />)}
              </motion.g>
            </g>
          )}
        </g>
        {/* shelf B: plant */}
        <motion.g animate={{ scale: 1 + bloomStep }} transition={{ duration: 0 }} style={{ originX: 0.5, originY: 1 }}>
          <Px s={PLANT} x={364} y={SHELF_B - 10} />
          {bloomStep > 0 && <Px s={BLOOM} x={364} y={SHELF_B - 13} />}
        </motion.g>

        {/* the cap travels between its hook, her head while she stands, and her head while she sits */}
        <motion.g initial={false} animate={{ x: CAP_AT[capPos].x, y: CAP_AT[capPos].y, rotate: pose === "dance" && capPos === "stand" ? [0, -6, 6, -6, 6, 0] : 0 }} transition={{ duration: capPos === "seated" ? 0.2 : 0.45, ease: stepped(4) }}>
          <Px s={CAP} />
        </motion.g>

        {standing && <StandingGirl cx={STAND.cx} feetY={STAND.feetY} dancing={pose === "dance"} />}

        {/* lights-off overlay: everything dims except around the monitor and the cursor */}
        {dark && <rect width={W} height={H} fill="#02030c" opacity={0.74} mask="url(#pt-darkmask)" pointerEvents="none" />}
        {/* soft cursor spotlight */}
        <g className="pt-cursor" pointerEvents="none" style={{ mixBlendMode: "screen" }}><circle r={dark ? 70 : 56} fill="url(#pt-spot)" /></g>

        {/* ===== hit areas (drawn last, on top). Most are tab-skipped; the key ones are keyboard reachable. ===== */}
        {SPOTS.map((s, i) => <Hot key={`${s.k}-${i}`} x={s.x} y={s.y} w={s.w} h={s.h} label={s.label} focus={false} onEnter={() => hover(s)} onClick={() => click(s)} />)}
        <Hot x={MUG_X - 2} y={MUG_Y - 6} w={12} h={12} label="Coffee mug: tips over and spills" onEnter={onMug} />
        <Hot x={DINO_X - 1} y={SHELF_A - 16} w={19} h={17} label="Dinosaur figurine: breathes fire" onEnter={onDino} />
        <Hot x={VASE_X - 2} y={SHELF_A - 15} w={11} h={16} label="Glass vase: wobbles and falls" onEnter={onVase} />
        <Hot x={360} y={SHELF_B - 34} w={20} h={36} label="Potted plant: blooms and grows" onEnter={onPlantEnter} onClick={() => setBloom((b) => !b)} onLeave={onPlantLeave} />
        <Hot x={331} y={64} w={19} h={14} label={capPos === "hook" ? "Red cap: click to make her put it on and dance" : "Hang the red cap back up"} onClick={onCap} />
        <Hot x={146} y={30} w={26} h={22} label="Lamp: swings. Click to turn the lights off or on" onEnter={() => { if (!is("lamp")) { trig("lamp", 2900); blip("lamp"); } }} onClick={() => { setDark((d) => !d); soundFX.playBlip(260, 120, 140); }} />
        <Hot x={156} y={DESK - 11} w={12} h={11} label={phones ? "Headphones: click to take them off" : "Headphones: click to make her put them on"} onEnter={() => hover({ k: "phones", x: 0, y: 0, w: 0, h: 0, label: "", ms: 800 })} onClick={() => { setPhones((p) => !p); soundFX.playBlip(500, 120, 1000); }} />
        <Hot x={298} y={126} w={50} h={64} label="Her: click to say hello" onClick={onHello} onEnter={() => blip("girl")} />
        {/* monitor: screen (hold + celebrate), neural net (follows cursor), chart (follows cursor), terminal (type!) */}
        <Hot x={158} y={78} w={164} h={80} label="Monitor: hover to pause the code, click to deploy" focus={false} onEnter={() => patchMon({ hold: true })} onLeave={() => patchMon({ hold: false })} onClick={() => { patchMon({ celebrate: true }); soundFX.playBlip(600, 300, 1500); later(() => patchMon({ celebrate: false }), 2200); }} />
        <Hot x={247} y={92} w={72} h={34} label="Neural net: follows your cursor, click to send a signal" focus={false}
          onMove={(e) => { const { x } = toScene(e.clientX, e.clientY); patchMon({ netFocus: Math.max(0, Math.min(3, Math.round((x - 253) / 20))) }); }} onLeave={() => patchMon({ netFocus: null })} onClick={() => { trig("netsweep", 1800); soundFX.playBlip(400, 300, 1400); }} />
        <Hot x={247} y={129} w={72} h={15} label="Chart: bars follow your cursor, click for a new high" focus={false}
          onMove={(e) => { const { x } = toScene(e.clientX, e.clientY); patchMon({ chartX: x - 247 }); }} onLeave={() => patchMon({ chartX: null })} onClick={() => { patchMon({ chartHigh: true }); soundFX.playBlip(500, 250, 1300); later(() => patchMon({ chartHigh: false }), 2200); }} />
        <Hot x={158} y={146} w={164} h={12} label="Terminal: hover and type, Enter to run" focus={false} onEnter={() => { setTermOn(true); patchMon({ typed: "" }); }} onLeave={() => { setTermOn(false); patchMon({ typed: "" }); }} />
        <Hot x={29} y={158} w={54} h={32} label="CRT TV: click (or press Space while hovering) to jump" focus={false} onEnter={() => setTvOn(true)} onLeave={() => setTvOn(false)} onClick={() => { setJump((j) => j + 1); soundFX.playBlip(500, 90, 900); }} />
        <Hot x={402} y={76} w={24} h={17} label="Books: hover one to pull it out, click to topple them" focus={false}
          onMove={(e) => { const { x } = toScene(e.clientX, e.clientY); setBook(Math.max(0, Math.min(5, Math.floor((x - 404) / 3.6)))); }} onLeave={() => setBook(-1)} onClick={() => { trig("dominoes", 2300); soundFX.playBlip(300, 300, 120); }} />
      </svg>
    </div>
  );
}
