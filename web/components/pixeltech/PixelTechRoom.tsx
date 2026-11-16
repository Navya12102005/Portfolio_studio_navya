"use client";

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { K, PText, Px, R, stepped, useProgress } from "./pixel";
import Monitor from "./Monitor";
import { SeatedGirl, StandingGirl } from "./Girl";
import { BLOOM, CAP, CHIP, DINO, DINO_OPEN, DUCK, FIREBALL, FLOPPY, MOON, MUG, PLANT, ROBOT, SHARDS, VASE } from "./sprites";

/* positions (scene pixels, scene is 320 x 180) */
const GX = 196, GY = 66;                   // seated girl: top-left of her head box
const STAND_CX = 238;                      // where she stands for the cap dance
const CAP_AT = { hook: { x: 210, y: 35 }, stand: { x: 231, y: 59 }, seated: { x: 202, y: 61 } };
const MUG_X = 110, MUG_Y = 98;
const VASE_X = 258, SHELF_A = 57;

/** An invisible, keyboard-focusable hit area over one object. Hover (mouse) or tap/Enter triggers it. */
function Hot({ x, y, w, h, label, onEnter, onClick, onLeave }: { x: number; y: number; w: number; h: number; label: string; onEnter?: () => void; onClick?: () => void; onLeave?: () => void }) {
  const fire = onClick ?? onEnter;
  return (
    <rect x={x} y={y} width={w} height={h} fill="transparent" role="button" tabIndex={0} aria-label={label} className="pt-hot" style={{ cursor: "pointer" }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") onEnter?.(); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") onLeave?.(); }}
      onClick={() => fire?.()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire?.(); } }} />
  );
}

const Glow = ({ c, children }: { c: string; children: ReactNode }) => <g style={{ filter: `drop-shadow(0 0 2px ${c})` }}>{children}</g>;

/** Everything that never changes: wall, window, neon, shelves, desk, floor, decor. Memoised so interactions don't repaint it. */
const Background = memo(function Background() {
  const stars = [[24, 20], [30, 44], [48, 18], [52, 50], [20, 52], [44, 40], [26, 32], [54, 30]];
  return (
    <g shapeRendering="crispEdges">
      <defs>
        <radialGradient id="pt-lamp"><stop offset="0" stopColor={K.yellow} stopOpacity="0.35" /><stop offset="1" stopColor={K.yellow} stopOpacity="0" /></radialGradient>
        <radialGradient id="pt-mon"><stop offset="0" stopColor={K.orange} stopOpacity="0.28" /><stop offset="1" stopColor={K.orange} stopOpacity="0" /></radialGradient>
      </defs>
      {/* wall */}
      <R x={0} y={0} w={320} h={150} c={K.n8} />
      {Array.from({ length: 20 }, (_, i) => <R key={i} x={i * 16} y={0} w={1} h={122} c={K.n9} />)}
      <R x={0} y={122} w={320} h={28} c={K.t9} /><R x={0} y={121} w={320} h={2} c={K.t7} />
      {Array.from({ length: 10 }, (_, i) => <R key={i} x={i * 32 + 8} y={126} w={1} h={22} c={K.t8} />)}
      {/* neon tube + TECH sign */}
      <Glow c={K.pink}><R x={6} y={6} w={308} h={1} c={K.pink} /><R x={6} y={7} w={308} h={1} c={K.pink} o={0.35} /></Glow>
      <Glow c={K.orange}><g transform="translate(112 17) scale(3)"><PText x={0} y={0} text="TECH" color={K.orange} /></g></Glow>
      {/* arched night window */}
      <R x={16} y={14} w={44} h={50} c={K.w7} />
      <R x={18} y={12} w={40} h={2} c={K.w7} /><R x={22} y={10} w={32} h={2} c={K.w7} />
      <R x={19} y={14} w={38} h={48} c={K.n6} /><R x={20} y={12} w={36} h={2} c={K.n6} /><R x={24} y={11} w={28} h={1} c={K.n6} />
      <R x={19} y={38} w={38} h={24} c={K.n7} /><R x={19} y={52} w={38} h={10} c={K.n8} />
      {stars.map(([x, y], i) => <rect key={i} className="pt-tw" x={x} y={y} width={1.02} height={1.02} fill={K.white} style={{ animationDelay: `${-i * 0.7}s` }} />)}
      <Px s={MOON} x={38} y={22} />
      <R x={37} y={12} w={2} h={50} c={K.w7} /><R x={19} y={37} w={38} h={2} c={K.w7} />
      <R x={14} y={62} w={48} h={3} c={K.w6} /><R x={14} y={65} w={48} h={1} c={K.w9} />
      {/* hanging lamp */}
      <circle cx={76} cy={36} r={22} fill="url(#pt-lamp)" />
      <R x={76} y={0} w={1} h={20} c={K.greyD} /><R x={71} y={20} w={11} h={4} c={K.w6} /><R x={72} y={24} w={9} h={1} c={K.w9} /><R x={74} y={25} w={5} h={3} c={K.yellow} />
      {/* poster + pennants */}
      <R x={160} y={12} w={26} h={26} c={K.w7} /><R x={162} y={14} w={22} h={22} c={K.n7} /><Px s={CHIP} x={167} y={19} />
      {[0, 1, 2, 3, 4].map((i) => <R key={i} x={190 + i * 5} y={11 + (i % 2)} w={3} h={5} c={[K.pink, K.orange, K.yellow, K.cyan, K.pink][i]} />)}
      <R x={188} y={10} w={28} h={1} c={K.greyD} />
      {/* monitor glow on the wall */}
      <circle cx={132} cy={74} r={78} fill="url(#pt-mon)" />
      {/* right shelves */}
      <R x={232} y={SHELF_A} w={84} h={3} c={K.w6} /><R x={232} y={SHELF_A + 3} w={84} h={1} c={K.w9} /><R x={236} y={SHELF_A + 4} w={2} h={5} c={K.w8} /><R x={306} y={SHELF_A + 4} w={2} h={5} c={K.w8} />
      <R x={238} y={93} w={78} h={3} c={K.w6} /><R x={238} y={96} w={78} h={1} c={K.w9} /><R x={242} y={97} w={2} h={5} c={K.w8} /><R x={306} y={97} w={2} h={5} c={K.w8} />
      {[[274, K.blue, 12], [277, K.orange, 10], [280, K.pink, 13], [283, K.white, 11], [286, K.cyan, 9]].map(([x, c, h], i) => <g key={i}><R x={x as number} y={SHELF_A - (h as number)} w={3} h={h as number} c={c as string} /><R x={x as number} y={SHELF_A - (h as number)} w={3} h={1} c={K.ink} o={0.35} /></g>)}
      <Px s={ROBOT} x={298} y={SHELF_A - 10} />
      <R x={262} y={73} w={20} h={19} c={K.w7} /><R x={264} y={75} w={16} h={15} c={K.n7} /><Px s={CHIP} x={267} y={78} />
      <Px s={FLOPPY} x={288} y={86} /><Px s={FLOPPY} x={290} y={79} /><Px s={FLOPPY} x={288} y={72} />
      {/* left shelf + server rack */}
      <R x={6} y={90} w={50} h={3} c={K.w6} /><R x={6} y={93} w={50} h={1} c={K.w9} />
      <Px s={DUCK} x={10} y={83} /><Px s={FLOPPY} x={26} y={83} /><Px s={FLOPPY} x={34} y={83} />
      {[[44, K.pink, 9], [47, K.cyan, 7], [50, K.yellow, 8]].map(([x, c, h], i) => <R key={i} x={x as number} y={90 - (h as number)} w={3} h={h as number} c={c as string} />)}
      <R x={6} y={108} w={28} h={42} c={K.n9} /><R x={6} y={108} w={28} h={1} c={K.greyD} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}><R x={8} y={111 + i * 8} w={24} h={6} c={K.n7} /><R x={9} y={112 + i * 8} w={14} h={1} c={K.greyD} /><R x={9} y={114 + i * 8} w={14} h={1} c={K.greyD} />
          <rect className="pt-led" x={26} y={113 + i * 8} width={2} height={2} fill={i % 2 ? K.neon : K.orange} style={{ animationDelay: `${-i * 0.45}s` }} /><rect className="pt-led" x={29} y={113 + i * 8} width={2} height={2} fill={K.cyan} style={{ animationDelay: `${-i * 0.8}s` }} /></g>
      ))}
      {/* cap hook */}
      <R x={212} y={31} w={3} h={3} c={K.greyD} /><R x={211} y={33} w={5} h={1} c={K.grey} />
      {/* desk: top, drawers, leg */}
      <R x={58} y={104} w={192} h={4} c={K.w5} /><R x={58} y={104} w={192} h={1} c={K.w6} /><R x={58} y={108} w={192} h={1} c={K.w9} />
      <R x={60} y={109} w={34} h={41} c={K.w8} /><R x={62} y={112} w={30} h={15} c={K.w7} /><R x={62} y={129} w={30} h={15} c={K.w7} /><R x={74} y={118} w={6} h={2} c={K.w5} /><R x={74} y={135} w={6} h={2} c={K.w5} />
      <R x={244} y={109} w={4} h={41} c={K.w8} />
      {/* keyboard, mouse, duck */}
      <R x={128} y={101} w={46} h={3} c={K.greyD} />{Array.from({ length: 11 }, (_, i) => <R key={i} x={129 + i * 4} y={101} w={3} h={1} c={K.grey} />)}
      <R x={178} y={102} w={4} h={2} c={K.grey} /><Px s={DUCK} x={62} y={98} />
      {/* floor */}
      <R x={0} y={150} w={320} h={30} c={K.w9} /><R x={0} y={150} w={320} h={1} c={K.w8} />
      {Array.from({ length: 16 }, (_, i) => <R key={i} x={i * 20 + 6} y={151} w={1} h={29} c={K.w8} />)}
      <R x={130} y={160} w={130} h={14} c={K.n6} /><R x={134} y={162} w={122} h={10} c={K.n7} />
    </g>
  );
});

export default function PixelTechRoom({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => { const t = timers.current; return () => t.forEach((id) => window.clearTimeout(id)); }, []);

  const [pose, setPose] = useState<"type" | "angry" | "stand" | "dance">("type");
  const capBusy = useRef(false);
  const [capPos, setCapPos] = useState<"hook" | "stand" | "seated">("hook");

  /* dinosaur */
  const [dino, setDino] = useState({ open: false, fire: 0 });
  const dinoBusy = useRef(false);
  const onDino = () => {
    if (dinoBusy.current) return; dinoBusy.current = true;
    setDino((d) => ({ open: true, fire: d.fire + 1 }));
    later(() => setDino((d) => ({ ...d, open: false })), 1000); later(() => { dinoBusy.current = false; }, 1500);
  };

  /* mug */
  const [mugOn, setMugOn] = useState(false);
  const mugBusy = useRef(false);
  const mugP = useProgress(mugOn, 650, 6);
  const onMug = () => { if (mugBusy.current) return; mugBusy.current = true; setMugOn(true); later(() => setMugOn(false), 4300); later(() => { mugBusy.current = false; }, 5200); };

  /* vase: wobble, slide off the shelf, fall, shatter (and she glares) */
  const [vase, setVase] = useState<"shelf" | "wobble" | "fall" | "broken">("shelf");
  const onVase = () => {
    if (vase !== "shelf") return;
    setVase("wobble");
    later(() => setVase("fall"), 600);
    later(() => { setVase("broken"); if (!capBusy.current) setPose("angry"); }, 1450);
    later(() => { if (!capBusy.current) setPose("type"); }, 3300);
    later(() => setVase("shelf"), 5600);
  };

  /* plant */
  const [bloom, setBloom] = useState(false);
  const bloomT = useRef<number | undefined>(undefined);
  const bloomStep = useProgress(bloom, 260, 3);
  const onPlantEnter = () => { window.clearTimeout(bloomT.current); setBloom(true); };
  const onPlantLeave = () => { window.clearTimeout(bloomT.current); bloomT.current = window.setTimeout(() => setBloom(false), 1600); };
  useEffect(() => () => window.clearTimeout(bloomT.current), []);

  /* red cap: she stands, the cap goes up (or back to its hook), a 2s dance, then she sits down again */
  const onCap = () => {
    if (capBusy.current) return; capBusy.current = true;
    const toHead = capPos === "hook";
    setPose("stand");
    if (toHead) later(() => setCapPos("stand"), 450); else { setCapPos("stand"); later(() => setCapPos("hook"), 450); }
    later(() => setPose("dance"), 1000);
    later(() => { setPose("type"); if (toHead) setCapPos("seated"); capBusy.current = false; }, 3000);
  };

  const standing = pose === "stand" || pose === "dance";
  const mugTilt = -90 * mugP;
  const spill = Math.max(0, (mugP - 0.35) / 0.65);

  return (
    <div className={className}>
      <svg viewBox="0 0 320 180" className="block w-full h-auto" style={{ imageRendering: "pixelated" }} role="group" aria-label="Pixel-art workstation. Hover the dinosaur, mug, vase or plant, and click the red cap.">
        <Background />
        <Monitor x={76} y={44} live={!reduce} />

        {/* mug + spill */}
        <g>
          <motion.g key="spill" initial={false} animate={{ opacity: spill > 0 ? 1 : 0 }}>
            <R x={MUG_X - 2 - Math.round(24 * spill)} y={102} w={Math.round(24 * spill)} h={2} c="#5a2f1a" />
            <R x={MUG_X - 2 - Math.round(24 * spill)} y={102} w={Math.round(24 * spill)} h={1} c="#7d4526" />
            {spill > 0.5 && <><R x={MUG_X - 6} y={98} w={1} h={1} c="#7d4526" /><R x={MUG_X - 11} y={96} w={1} h={1} c="#7d4526" /><R x={MUG_X - 2} y={95} w={1} h={1} c="#7d4526" /></>}
          </motion.g>
          <g transform={`translate(${MUG_X} ${MUG_Y + 6}) rotate(${mugTilt})`}><g transform="translate(0 -6)"><Px s={MUG} /></g></g>
          {mugP < 0.2 && <g className="pt-steam"><R x={MUG_X + 2} y={MUG_Y - 3} w={1} h={1} c={K.white} o={0.6} /><R x={MUG_X + 4} y={MUG_Y - 5} w={1} h={1} c={K.white} o={0.4} /></g>}
          <Hot x={MUG_X - 2} y={MUG_Y - 6} w={12} h={12} label="Coffee mug: tips over and spills" onEnter={onMug} />
        </g>

        <SeatedGirl x={GX} y={GY} angry={pose === "angry"} empty={standing} />

        {/* shelf A: dino + vase */}
        <g>
          <Px s={dino.open ? DINO_OPEN : DINO} x={236} y={SHELF_A - 14} />
          <Hot x={235} y={SHELF_A - 16} w={18} h={17} label="Dinosaur figurine: breathes fire" onEnter={onDino} />
          {dino.fire > 0 && (
            <motion.g key={dino.fire} initial={{ x: 0, opacity: 1 }} animate={{ x: 54, opacity: [1, 1, 1, 0] }} transition={{ duration: 0.9, ease: stepped(9) }}>
              <Px s={FIREBALL} x={252} y={SHELF_A - 11} />
            </motion.g>
          )}
        </g>
        <g>
          {vase === "shelf" && <g><Px s={VASE} x={VASE_X} y={SHELF_A - 13} /></g>}
          {vase === "wobble" && (
            <motion.g animate={{ rotate: [0, -7, 7, -7, 7, 0] }} transition={{ duration: 0.6, ease: "linear" }} style={{ originX: 0.5, originY: 1 }}>
              <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />
            </motion.g>
          )}
          {vase === "fall" && (
            <motion.g initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: [0, -9, -18, -26, -30, -31, -32, -32], y: [0, 0, 0, 2, 14, 35, 66, 92], rotate: [0, 0, 0, 12, 35, 70, 110, 150] }} transition={{ duration: 0.85, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }}>
              <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />
            </motion.g>
          )}
          {vase === "broken" && (
            <g>
              <Px s={SHARDS} x={VASE_X - 36} y={SHELF_A + 94} />
              <motion.g initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                {[[-3, -5], [3, -7], [8, -4], [-8, -3], [0, -9]].map(([dx, dy], i) => <R key={i} x={VASE_X - 28 + dx} y={SHELF_A + 92 + dy} w={1} h={1} c="#9fe6ff" />)}
              </motion.g>
            </g>
          )}
          <Hot x={VASE_X - 2} y={SHELF_A - 15} w={11} h={16} label="Glass vase: wobbles and falls" onEnter={onVase} />
        </g>

        {/* shelf B: plant */}
        <g>
          <motion.g animate={{ scale: 1 + bloomStep }} transition={{ duration: 0 }} style={{ originX: 0.5, originY: 1 }}>
            <Px s={PLANT} x={244} y={83} />
            {bloomStep > 0 && <Px s={BLOOM} x={244} y={80} />}
          </motion.g>
          <Hot x={240} y={62} w={20} h={32} label="Potted plant: blooms and grows" onEnter={onPlantEnter} onClick={() => setBloom((b) => !b)} onLeave={onPlantLeave} />
        </g>

        {/* the cap travels between its hook, her head while she stands, and her head while she sits */}
        <motion.g initial={false} animate={{ x: CAP_AT[capPos].x, y: CAP_AT[capPos].y, rotate: pose === "dance" && capPos === "stand" ? [0, -6, 6, -6, 6, 0] : 0 }} transition={{ duration: capPos === "seated" ? 0.2 : 0.45, ease: stepped(4) }}>
          <Px s={CAP} />
        </motion.g>
        <Hot x={207} y={29} w={19} h={13} label={capPos === "hook" ? "Red cap: click to make her put it on and dance" : "Hang the red cap back up"} onClick={onCap} />

        {standing && <StandingGirl cx={STAND_CX} dancing={pose === "dance"} />}
      </svg>
    </div>
  );
}
