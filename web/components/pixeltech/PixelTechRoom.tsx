"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Px, R, stepped, useProgress } from "./pixel";
import Background, { DESK, H, SHELF_A, SHELF_B, W } from "./Background";
import Monitor from "./Monitor";
import { SeatedGirl, StandingGirl } from "./Girl";
import { BLOOM, CAP, DINO, DINO_OPEN, FIREBALL, MUG, PLANT, SHARDS, VASE } from "./sprites";

/* positions in scene pixels (the scene is 480 x 270) */
const GX = 292, GY = 138;                          // seated girl: top-left of her head box
const STAND = { cx: 404, feetY: 234 };             // where she stands for the cap dance
const CAP_AT = { hook: { x: 334, y: 70 }, stand: { x: STAND.cx - 5, y: STAND.feetY - 112 - 1 }, seated: { x: GX + 11, y: GY - 10 } };
const MUG_X = 192, MUG_Y = DESK - 6;
const VASE_X = 384, DINO_X = 356;

/** An invisible, keyboard-focusable hit area over one object. Hover (mouse) or tap/Enter triggers it. */
function Hot({ x, y, w, h, label, onEnter, onClick, onLeave }: { x: number; y: number; w: number; h: number; label: string; onEnter?: () => void; onClick?: () => void; onLeave?: () => void }) {
  const fire = onClick ?? onEnter;
  return (
    <rect x={x} y={y} width={w} height={h} fill="transparent" role="button" tabIndex={0} aria-label={label} className="pt-hot" style={{ cursor: "pointer" }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") onEnter?.(); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") onLeave?.(); }}
      onClick={() => fire?.()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire?.(); } }} />
  );
}

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
    later(() => { setVase("broken"); if (!capBusy.current) setPose("angry"); }, 1500);
    later(() => { if (!capBusy.current) setPose("type"); }, 3400);
    later(() => setVase("shelf"), 5800);
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
  const spill = Math.max(0, (mugP - 0.35) / 0.65);
  const SHELF_FLOOR = 228;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full" style={{ imageRendering: "pixelated" }} role="group" aria-label="Pixel-art workstation. Hover the dinosaur, mug, vase or plant, and click the red cap.">
        <Background />
        <Monitor x={150} y={72} live={!reduce} />

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
          <Hot x={MUG_X - 2} y={MUG_Y - 6} w={12} h={12} label="Coffee mug: tips over and spills" onEnter={onMug} />
        </g>

        <SeatedGirl x={GX} y={GY} angry={pose === "angry"} empty={standing} />

        {/* shelf A: dino + vase */}
        <g>
          <Px s={dino.open ? DINO_OPEN : DINO} x={DINO_X} y={SHELF_A - 14} />
          <Hot x={DINO_X - 1} y={SHELF_A - 16} w={19} h={17} label="Dinosaur figurine: breathes fire" onEnter={onDino} />
          {dino.fire > 0 && (
            <motion.g key={dino.fire} initial={{ x: 0, opacity: 1 }} animate={{ x: 52, opacity: [1, 1, 1, 0] }} transition={{ duration: 0.9, ease: stepped(9) }}>
              <Px s={FIREBALL} x={DINO_X + 17} y={SHELF_A - 11} />
            </motion.g>
          )}
        </g>
        <g>
          {vase === "shelf" && <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />}
          {vase === "wobble" && (
            <motion.g animate={{ rotate: [0, -7, 7, -7, 7, 0] }} transition={{ duration: 0.6, ease: "linear" }} style={{ originX: 0.5, originY: 1 }}>
              <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />
            </motion.g>
          )}
          {vase === "fall" && (
            <motion.g initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: [0, -10, -20, -30, -36, -38, -39, -39], y: [0, 0, 0, 2, 24, 62, 108, SHELF_FLOOR - SHELF_A], rotate: [0, 0, 0, 12, 35, 70, 110, 150] }} transition={{ duration: 0.9, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }}>
              <Px s={VASE} x={VASE_X} y={SHELF_A - 13} />
            </motion.g>
          )}
          {vase === "broken" && (
            <g>
              <Px s={SHARDS} x={VASE_X - 46} y={SHELF_FLOOR - 4} />
              <motion.g initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                {[[-3, -5], [3, -7], [8, -4], [-8, -3], [0, -9], [11, -8]].map(([dx, dy], i) => <R key={i} x={VASE_X - 38 + dx} y={SHELF_FLOOR - 4 + dy} w={1} h={1} c="#9fe6ff" />)}
              </motion.g>
            </g>
          )}
          <Hot x={VASE_X - 2} y={SHELF_A - 15} w={11} h={16} label="Glass vase: wobbles and falls" onEnter={onVase} />
        </g>

        {/* shelf B: plant */}
        <g>
          <motion.g animate={{ scale: 1 + bloomStep }} transition={{ duration: 0 }} style={{ originX: 0.5, originY: 1 }}>
            <Px s={PLANT} x={364} y={SHELF_B - 10} />
            {bloomStep > 0 && <Px s={BLOOM} x={364} y={SHELF_B - 13} />}
          </motion.g>
          <Hot x={360} y={SHELF_B - 34} w={20} h={36} label="Potted plant: blooms and grows" onEnter={onPlantEnter} onClick={() => setBloom((b) => !b)} onLeave={onPlantLeave} />
        </g>

        {/* the cap travels between its hook, her head while she stands, and her head while she sits */}
        <motion.g initial={false} animate={{ x: CAP_AT[capPos].x, y: CAP_AT[capPos].y, rotate: pose === "dance" && capPos === "stand" ? [0, -6, 6, -6, 6, 0] : 0 }} transition={{ duration: capPos === "seated" ? 0.2 : 0.45, ease: stepped(4) }}>
          <Px s={CAP} />
        </motion.g>
        <Hot x={331} y={64} w={19} h={14} label={capPos === "hook" ? "Red cap: click to make her put it on and dance" : "Hang the red cap back up"} onClick={onCap} />

        {standing && <StandingGirl cx={STAND.cx} feetY={STAND.feetY} dancing={pose === "dance"} />}
      </svg>
    </div>
  );
}
