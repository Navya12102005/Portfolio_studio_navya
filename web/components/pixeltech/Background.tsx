"use client";

import { memo } from "react";
import { K, PText, Px, R, useTick } from "./pixel";
import { LEAF, CACTUS, CARTRIDGE, CAT, CHIP, CONSOLE, CONTROLLER, DUCK, FLOPPY, HEADPHONES, HEART, LAVA, PLANT, ROBOT, ROCKET, TROPHY } from "./sprites";

export const W = 480, H = 270, FLOOR = 225, DESK = 174;
export const SHELF_A = 92, SHELF_B = 128, SHELF_C = 164;

const Glow = ({ c, children }: { c: string; children: React.ReactNode }) => <g style={{ filter: `drop-shadow(0 0 2px ${c})` }}>{children}</g>;
/** a shelf board with a shadow under it and two brackets */
const Shelf = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <g>
    <R x={x} y={y} w={w} h={3} c={K.w6} /><R x={x} y={y} w={w} h={1} c={K.w5} /><R x={x} y={y + 3} w={w} h={1} c={K.w9} />
    <R x={x} y={y + 4} w={w} h={3} c={K.ink} o={0.28} /><R x={x + 4} y={y + 4} w={2} h={6} c={K.w8} /><R x={x + w - 6} y={y + 4} w={2} h={6} c={K.w8} />
  </g>
);
const Book = ({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) => (
  <g><R x={x} y={y - h} w={w} h={h} c={c} /><R x={x} y={y - h} w={w} h={1} c={K.ink} o={0.3} /><R x={x + w - 1} y={y - h} w={1} h={h} c={K.ink} o={0.25} /><R x={x + 1} y={y - h + 3} w={w - 2} h={1} c={K.white} o={0.45} /></g>
);
const Frame = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: React.ReactNode }) => (
  <g><R x={x} y={y} w={w} h={h} c={K.w6} /><R x={x} y={y} w={w} h={1} c={K.w5} /><R x={x + 2} y={y + 2} w={w - 4} h={h - 4} c={K.n7} /><g transform={`translate(${x} ${y})`}>{children}</g></g>
);

/** tiny platformer on the CRT: a block hops over pipes while a coin spins */
function TvGame() {
  const t = useTick(8);
  const px = (t * 3) % 60, jump = Math.abs(Math.sin((t % 16) / 16 * Math.PI)) * 12;
  return (
    <g>
      <R x={0} y={0} w={54} h={32} c="#4aa8ff" /><R x={0} y={14} w={54} h={10} c="#7cc5ff" />
      <R x={((t * 1) % 70) - 12} y={5} w={12} h={4} c={K.white} o={0.9} /><R x={((t * 1) % 90) + 20 - 30} y={9} w={9} h={3} c={K.white} o={0.8} />
      <R x={0} y={24} w={54} h={8} c="#7a4a1e" /><R x={0} y={24} w={54} h={2} c={K.green} />
      {[0, 1].map((i) => { const gx = 60 - ((px + i * 30) % 60); return <g key={i}><R x={gx} y={17} w={7} h={7} c={K.greenD} /><R x={gx - 1} y={16} w={9} h={2} c={K.green} /></g>; })}
      <R x={10} y={Math.round(18 - jump)} w={5} h={6} c={K.orange} /><R x={11} y={Math.round(19 - jump)} w={1} h={1} c={K.white} />
      <R x={36 + (t % 4 < 2 ? 0 : 1)} y={8} w={3} h={4} c={K.yellow} />
      <PText x={2} y={2} text="00120" color={K.white} />
      {Array.from({ length: 16 }, (_, i) => <R key={i} x={0} y={i * 2 + 1} w={54} h={1} c="#000" o={0.1} />)}
    </g>
  );
}

/** wall clock: a second hand that ticks */
function Clock({ x, y }: { x: number; y: number }) {
  const t = useTick(1);
  const a = (t % 60) * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={9} cy={9} r={10} fill={K.w6} /><circle cx={9} cy={9} r={8} fill={K.white} /><circle cx={9} cy={9} r={8} fill="none" stroke={K.w8} strokeWidth={0.6} />
      {[0, 3, 6, 9].map((h) => <rect key={h} x={8.5 + 6.5 * Math.sin((h * Math.PI) / 6)} y={8.5 - 6.5 * Math.cos((h * Math.PI) / 6)} width={1.2} height={1.2} fill={K.ink} />)}
      <rect x={8.6} y={4.2} width={0.9} height={5} fill={K.ink} transform="rotate(40 9 9)" /><rect x={8.6} y={3} width={0.9} height={6} fill={K.ink} />
      <rect x={8.7} y={2.6} width={0.6} height={6.6} fill={K.red} transform={`rotate(${a} 9 9)`} />
    </g>
  );
}

/** Everything that never changes: wall, window, light, shelves, desk, floor and the dense collectibles. */
const Background = memo(function Background() {
  const stars = [[40, 40], [52, 62], [70, 36], [96, 50], [44, 90], [78, 70], [60, 54], [100, 82], [88, 38], [36, 70]];
  const bulbs = Array.from({ length: 36 }, (_, i) => ({ x: 14 + i * 13, y: 16 + Math.round(5 * Math.sin((i / 36) * Math.PI * 6)), c: [K.pink, K.yellow, K.cyan, K.orange][i % 4] }));
  const arch = [14, 10, 7, 5, 3, 2, 1, 0];
  return (
    <g shapeRendering="crispEdges">
      <defs>
        <radialGradient id="pt-lamp"><stop offset="0" stopColor={K.yellow} stopOpacity="0.42" /><stop offset="1" stopColor={K.yellow} stopOpacity="0" /></radialGradient>
        <radialGradient id="pt-mon"><stop offset="0" stopColor={K.orange} stopOpacity="0.26" /><stop offset="0.6" stopColor={K.cyan} stopOpacity="0.08" /><stop offset="1" stopColor={K.cyan} stopOpacity="0" /></radialGradient>
        <pattern id="pt-dith" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#000" /><rect x="1" y="1" width="1" height="1" fill="#000" /></pattern>
        <pattern id="pt-dith2" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#000" /></pattern>
        <pattern id="pt-lite" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#cfe9ff" /><rect x="1" y="1" width="1" height="1" fill="#cfe9ff" /></pattern>
      </defs>

      {/* wall with a faint diamond wallpaper, wainscot, baseboard */}
      <R x={0} y={0} w={W} h={FLOOR} c={K.n8} />
      {Array.from({ length: 24 }, (_, i) => <R key={i} x={i * 20} y={0} w={1} h={186} c={K.n9} />)}
      {Array.from({ length: 8 }, (_, r) => Array.from({ length: 20 }, (_, c) => <R key={`${r}-${c}`} x={c * 24 + (r % 2) * 12 + 6} y={r * 22 + 14} w={2} h={2} c={K.n7} />))}
      <R x={0} y={186} w={W} h={39} c={K.t9} /><R x={0} y={184} w={W} h={3} c={K.t7} /><R x={0} y={184} w={W} h={1} c={K.t6} />
      {Array.from({ length: 20 }, (_, i) => <R key={i} x={i * 24 + 10} y={190} w={1} h={32} c={K.t8} />)}
      <R x={0} y={221} w={W} h={4} c={K.w8} /><R x={0} y={221} w={W} h={1} c={K.w7} />

      {/* neon tube, string lights */}
      <Glow c={K.pink}><R x={8} y={6} w={464} h={1} c={K.pink} /><R x={8} y={7} w={464} h={1} c={K.pink} o={0.35} /></Glow>
      {bulbs.map((b, i) => <g key={i}><R x={b.x} y={b.y - 2} w={1} h={2} c={K.greyD} /><rect className="pt-tw" x={b.x - 1} y={b.y} width={3} height={4} fill={b.c} style={{ animationDelay: `${-i * 0.4}s` }} /></g>)}
      {bulbs.slice(1).map((b, i) => <R key={i} x={Math.min(b.x, bulbs[i].x)} y={Math.min(b.y, bulbs[i].y) - 2} w={13} h={1} c={K.greyD} o={0.7} />)}

      {/* arched night window with skyline, moon, stars, clouds, curtains and sill plants */}
      <R x={28} y={32} w={84} h={104} c={K.w7} />
      {arch.map((ins, i) => <R key={i} x={28 + ins} y={24 + i} w={84 - ins * 2} h={1} c={K.w7} />)}
      <R x={34} y={36} w={72} h={94} c={K.n6} />
      {arch.map((ins, i) => <R key={i} x={34 + Math.max(0, ins - 4)} y={28 + i} w={72 - Math.max(0, ins - 4) * 2} h={1} c={K.n6} />)}
      <R x={34} y={84} w={72} h={46} c={K.n7} /><R x={34} y={108} w={72} h={22} c={K.n8} />
      {stars.map(([x, y], i) => <rect key={i} className="pt-tw" x={x} y={y} width={1.1} height={1.1} fill={K.white} style={{ animationDelay: `${-i * 0.6}s` }} />)}
      {/* moon */}
      <circle cx={88} cy={52} r={9} fill="#ffe9a8" /><circle cx={92} cy={49} r={8} fill={K.n6} /><circle cx={88} cy={52} r={9} fill="none" stroke="#ffe9a8" strokeWidth={0.4} opacity={0.5} />
      <g className="pt-cloud"><R x={46} y={58} w={16} h={3} c={K.n5} /><R x={50} y={56} w={9} h={2} c={K.n5} /></g>
      {/* skyline */}
      {[[34, 100, 10, 30], [44, 94, 8, 36], [52, 104, 12, 26], [64, 90, 9, 40], [73, 98, 11, 32], [84, 102, 8, 28], [92, 92, 14, 38]].map(([x, y, w, h], i) => (
        <g key={i}><R x={x} y={y} w={w} h={h} c={K.n9} />{Array.from({ length: Math.floor(h / 6) }, (_, r) => <R key={r} x={x + 2 + (r % 2) * 3} y={y + 3 + r * 6} w={2} h={2} c={(i + r) % 3 === 0 ? K.yellow : (i + r) % 3 === 1 ? K.orange : K.n7} o={0.9} />)}</g>
      ))}
      <R x={68} y={32} w={3} h={98} c={K.w7} /><R x={34} y={84} w={72} h={3} c={K.w7} />
      <R x={22} y={24} w={96} h={3} c={K.w6} /><R x={22} y={24} w={96} h={1} c={K.w5} />
      {Array.from({ length: 8 }, (_, i) => <R key={i} x={24 + i * 2} y={28} w={2} h={100} c={i % 2 ? "#3b2a6e" : "#4a3688"} />)}
      {Array.from({ length: 8 }, (_, i) => <R key={i} x={96 + i * 2} y={28} w={2} h={100} c={i % 2 ? "#3b2a6e" : "#4a3688"} />)}
      <R x={20} y={134} w={100} h={4} c={K.w6} /><R x={20} y={134} w={100} h={1} c={K.w5} />
      <Px s={CACTUS} x={38} y={124} /><Px s={PLANT} x={60} y={124} /><Px s={CACTUS} x={96} y={124} />

      {/* moonlight shaft across the wall (dithered) */}
      <polygon points="36,136 110,136 190,225 70,225" fill="url(#pt-lite)" opacity={0.07} />

      {/* hanging lamp with a warm dithered pool */}
      <circle cx={158} cy={64} r={62} fill="url(#pt-lamp)" />
      <R x={158} y={0} w={1} h={36} c={K.greyD} /><R x={148} y={36} w={21} h={4} c={K.w6} /><R x={150} y={40} w={17} h={3} c={K.orange} /><R x={152} y={43} w={13} h={1} c={K.w9} /><R x={155} y={44} w={7} h={4} c={K.yellow} />

      {/* neon TECH title sign + posters + clock */}
      <Glow c={K.orange}><g transform="translate(206 30) scale(4)"><PText x={0} y={0} text="TECH" color={K.orange} /></g></Glow>
      <Frame x={176} y={30} w={26} h={32}><Px s={CHIP} x={8} y={12} /></Frame>
      <Frame x={284} y={28} w={28} h={34}><Px s={ROCKET} x={11} y={7} /><PText x={6} y={26} text="MOON" color={K.pink} /></Frame>
      <Clock x={324} y={30} />
      <Frame x={118} y={36} w={22} h={22}><Px s={HEART} x={7} y={8} /></Frame>
      {/* sticky notes on the wall */}
      {[[128, 88, K.yellow], [138, 90, K.pink], [130, 99, K.cyan], [140, 101, K.orange], [132, 110, K.yellow]].map(([x, y, c], i) => <g key={i}><R x={x as number} y={y as number} w={8} h={8} c={c as string} /><R x={(x as number) + 1} y={(y as number) + 2} w={5} h={1} c={K.ink} o={0.4} /><R x={(x as number) + 1} y={(y as number) + 4} w={4} h={1} c={K.ink} o={0.4} /></g>)}

      {/* monitor glow on the wall */}
      <circle cx={240} cy={132} r={150} fill="url(#pt-mon)" />

      {/* left: CRT TV on a cabinet with a console */}
      <R x={24} y={152} w={74} h={48} c="#2a2f55" /><R x={24} y={152} w={74} h={1} c={K.n5} /><R x={26} y={154} w={58} h={36} c="#14183a" />
      <g transform="translate(29 158)"><TvGame /></g>
      <R x={87} y={160} w={4} h={4} c={K.grey} /><R x={87} y={168} w={4} h={4} c={K.grey} /><R x={87} y={176} w={7} h={2} c={K.greyD} /><R x={88} y={182} w={6} h={2} c={K.orange} />
      <R x={24} y={200} w={74} h={22} c={K.w8} /><R x={26} y={202} w={34} h={18} c={K.w9} /><R x={62} y={202} w={34} h={18} c={K.w9} /><R x={42} y={210} w={4} h={2} c={K.w5} /><R x={78} y={210} w={4} h={2} c={K.w5} />
      <Px s={CONSOLE} x={30} y={192} /><Px s={CONTROLLER} x={60} y={195} /><Px s={CARTRIDGE} x={74} y={188} />
      {/* left shelf above the sill: books + duck + floppy */}
      <Shelf x={22} y={142} w={78} />
      <Px s={DUCK} x={26} y={135} /><Px s={FLOPPY} x={38} y={135} /><Px s={FLOPPY} x={46} y={135} />
      <Book x={58} y={142} w={4} h={11} c={K.pink} /><Book x={62} y={142} w={3} h={9} c={K.cyan} /><Book x={65} y={142} w={4} h={12} c={K.yellow} /><Book x={69} y={142} w={3} h={8} c={K.white} />
      <Px s={HEART} x={80} y={136} />

      {/* right shelves: dense collectibles (the interactive ones are drawn in PixelTechRoom) */}
      <Shelf x={346} y={SHELF_A} w={128} /><Shelf x={352} y={SHELF_B} w={122} /><Shelf x={362} y={SHELF_C} w={112} />
      {[[404, K.blue, 14], [407, K.orange, 12], [410, K.pink, 15], [414, K.white, 11], [417, K.cyan, 13], [421, K.yellow, 10]].map(([x, c, h], i) => <Book key={i} x={x as number} y={SHELF_A} w={3} h={h as number} c={c as string} />)}
      <Px s={TROPHY} x={430} y={SHELF_A - 10} /><Px s={ROCKET} x={444} y={SHELF_A - 11} /><Px s={ROBOT} x={458} y={SHELF_A - 10} />
      <Frame x={382} y={102} w={26} h={22}><Px s={CHIP} x={8} y={6} /></Frame>
      <Px s={CARTRIDGE} x={414} y={SHELF_B - 8} /><Px s={FLOPPY} x={428} y={SHELF_B - 7} /><Px s={FLOPPY} x={430} y={SHELF_B - 14} /><Px s={FLOPPY} x={428} y={SHELF_B - 21} />
      <Px s={LAVA} x={448} y={SHELF_B - 13} /><Px s={HEART} x={460} y={SHELF_B - 6} />
      <Px s={CAT} x={372} y={SHELF_C - 10} /><Px s={CONSOLE} x={392} y={SHELF_C - 6} /><Px s={CONTROLLER} x={412} y={SHELF_C - 5} />
      <R x={430} y={SHELF_C - 22} w={22} h={22} c="#2a2f55" /><R x={432} y={SHELF_C - 20} w={18} h={12} c={K.ink} /><R x={434} y={SHELF_C - 18} w={14} h={8} c="#14c8b4" /><R x={436} y={SHELF_C - 6} w={3} h={3} c={K.red} /><R x={442} y={SHELF_C - 6} w={3} h={3} c={K.yellow} />
      <Px s={CACTUS} x={458} y={SHELF_C - 10} />
      {/* cap hook */}
      <R x={338} y={66} w={4} h={4} c={K.greyD} /><R x={337} y={69} w={6} h={1} c={K.grey} />

      {/* desk: top, front, under-desk shadow, drawers, PC tower with RGB */}
      <R x={120} y={DESK} w={284} h={5} c={K.w5} /><R x={120} y={DESK} w={284} h={1} c={"#d09a80"} /><R x={120} y={DESK + 5} w={284} h={2} c={K.w9} />
      <R x={120} y={DESK + 7} w={284} h={14} c={K.ink} o={0.25} />
      <R x={392} y={DESK + 7} w={5} h={FLOOR - DESK - 7} c={K.w8} />
      <R x={156} y={DESK + 7} w={50} h={44} c={K.w8} /><R x={158} y={DESK + 10} w={46} h={18} c={K.w7} /><R x={158} y={DESK + 30} w={46} h={18} c={K.w7} /><R x={178} y={DESK + 17} w={8} h={3} c={K.w5} /><R x={178} y={DESK + 37} w={8} h={3} c={K.w5} />
      <R x={124} y={186} w={26} h={39} c="#14183a" /><R x={124} y={186} w={26} h={1} c={K.n5} /><R x={126} y={188} w={22} h={30} c={K.n9} />
      <circle cx={137} cy={200} r={7} fill="none" stroke={K.greyD} strokeWidth={1.4} /><circle cx={137} cy={200} r={2} fill={K.greyD} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} className="pt-rgb" x={126 + i * 3.6} y={214} width={3.4} height={3} fill={[K.pink, K.orange, K.yellow, K.neon, K.cyan, K.blue][i]} style={{ animationDelay: `${-i * 0.3}s` }} />)}
      {/* desk items: speaker, headphones, keyboard + desk mat, lamp, plush, plants */}
      <R x={128} y={142} w={20} h={32} c="#1f2347" /><R x={128} y={142} w={20} h={1} c={K.n5} /><circle cx={138} cy={150} r={4} fill={K.n9} /><circle cx={138} cy={150} r={1.6} fill={K.greyD} /><circle cx={138} cy={164} r={6} fill={K.n9} /><circle cx={138} cy={164} r={3} fill={K.greyD} /><circle cx={138} cy={164} r={1} fill={K.n9} />
      <Px s={HEADPHONES} x={156} y={DESK - 9} />
      <R x={208} y={DESK - 2} w={96} h={2} c={K.n6} /><R x={216} y={DESK - 3} w={68} h={3} c="#161a3a" />{Array.from({ length: 16 }, (_, i) => <R key={i} x={218 + i * 4} y={DESK - 3} w={3} h={1} c={K.greyD} />)}{Array.from({ length: 14 }, (_, i) => <R key={i} x={220 + i * 4} y={DESK - 2} w={3} h={1} c={K.grey} />)}
      <Px s={LAVA} x={368} y={DESK - 13} /><Px s={CAT} x={380} y={DESK - 10} /><Px s={DUCK} x={154} y={65} />
      <Px s={CACTUS} x={106} y={DESK - 10} />
      {/* floor: planks, rug, box, big plant, skateboard */}
      <R x={0} y={FLOOR} w={W} h={H - FLOOR} c={K.w9} /><R x={0} y={FLOOR} w={W} h={1} c={K.w8} />
      {Array.from({ length: 24 }, (_, i) => <R key={i} x={i * 20 + 8} y={FLOOR + 1} w={1} h={H - FLOOR - 1} c={K.w8} />)}
      {Array.from({ length: 4 }, (_, i) => <R key={i} x={0} y={FLOOR + 10 + i * 11} w={W} h={1} c={K.w8} o={0.6} />)}
      <R x={222} y={236} w={190} h={26} c={K.n6} /><R x={226} y={239} w={182} h={20} c={K.n7} /><R x={226} y={239} w={182} h={2} c={K.orange} o={0.6} /><R x={226} y={257} w={182} h={2} c={K.orange} o={0.6} />
      {Array.from({ length: 22 }, (_, i) => <R key={i} x={232 + i * 8} y={247} w={3} h={3} c={K.n5} />)}
      <R x={420} y={202} w={34} h={23} c="#a8764a" /><R x={420} y={202} w={34} h={2} c="#c9925f" /><R x={434} y={202} w={6} h={23} c="#d8b98a" /><R x={424} y={212} w={8} h={5} c={K.white} o={0.7} />
      <R x={456} y={192} w={20} h={33} c={K.orange} /><R x={456} y={192} w={20} h={3} c="#ff8a52" /><R x={456} y={219} w={20} h={6} c="#c4420f" />
      {[[462, 196, 0, 1], [470, 196, 0, 0], [452, 202, -10, 1], [476, 200, 6, 1], [458, 190, 0, 0]].map(([x, y], i) => <g key={i}><R x={(x as number) + 3} y={(y as number) + 4} w={1} h={26 - (i % 3) * 4} c={K.greenD} /></g>)}
      {[[455, 168, false], [466, 160, true], [447, 178, true], [474, 176, false], [460, 150, true], [468, 184, false], [452, 190, false]].map(([x, y, fl], i) => <Px key={i} s={LEAF} x={x as number} y={y as number} flip={fl as boolean} />)}
      <Px s={{ pal: { W: K.w5, D: K.w8, O: K.orange, K: K.ink }, rows: ["...WWWWWWWWWWWWWWWWWW...", "..WOOOOOOOOOOOOOOOOOOW..", "...DDDDDDDDDDDDDDDDDD...", "...KK............KK...."] }} x={108} y={258} />

      {/* dithered vignette + a light wash from the monitor onto the floor */}
      <R x={0} y={0} w={W} h={14} c="#000" o={0.0} />
      <rect x={0} y={0} width={W} height={H} fill="url(#pt-dith)" opacity={0.0} />
      <polygon points="0,0 60,0 0,60" fill="url(#pt-dith)" opacity={0.5} /><polygon points="480,0 420,0 480,60" fill="url(#pt-dith)" opacity={0.5} />
      <polygon points="0,270 60,270 0,210" fill="url(#pt-dith)" opacity={0.5} /><polygon points="480,270 420,270 480,210" fill="url(#pt-dith)" opacity={0.5} />
      <R x={0} y={0} w={4} h={H} c="#000" o={0.3} /><R x={W - 4} y={0} w={4} h={H} c="#000" o={0.3} />
    </g>
  );
});
export default Background;
