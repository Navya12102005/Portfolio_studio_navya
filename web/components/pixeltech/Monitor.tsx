"use client";

import { K, PText, R, useTick } from "./pixel";

const SW = 104, SH = 44; // screen size in scene pixels

// code lines: [indent, [width, colour] tokens...] scrolled upward like an editor
const CODE: [number, [number, string][]][] = [
  [0, [[3, K.pink], [6, K.white], [4, K.cyan]]], [1, [[5, K.yellow], [9, K.white]]], [1, [[4, K.pink], [7, K.green], [3, K.white]]],
  [2, [[8, K.white], [4, K.orange]]], [2, [[6, K.cyan], [5, K.white], [6, K.yellow]]], [1, [[3, K.pink], [10, K.white]]],
  [0, [[6, K.green], [4, K.white]]], [1, [[7, K.white], [5, K.cyan]]], [2, [[4, K.pink], [8, K.white]]], [1, [[9, K.yellow]]],
];
const LAYERS = [3, 5, 4, 2];
// neural-net node coordinates (x per layer, y per node)
const NET = LAYERS.map((n, li) => Array.from({ length: n }, (_, ni) => ({ x: 6 + li * 12, y: Math.round(3 + ((ni + 0.5) * 21) / n) })));
const HEX = "0A1F3C7E5B92D4F8";

/** The big monitor: a live "TECH DOMAIN - AI SYSTEMS" screen with scrolling code, a neural net and a build ticker. */
export default function Monitor({ x, y, live }: { x: number; y: number; live: boolean }) {
  const tick = useTick(8, live);
  const t = tick / 8;
  const scroll = Math.floor(t * 4) % 4;
  const pulse = Math.floor(t * 3) % 4; // which layer is lit

  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <R x={0} y={0} w={SW + 8} h={SH + 12} c={K.greyD} />
      <R x={1} y={1} w={SW + 6} h={SH + 10} c="#2a3050" />
      <R x={1} y={1} w={SW + 6} h={1} c={K.grey} />
      <R x={SW / 2 + 2} y={SH + 8} w={4} h={2} c={K.orange} />
      <g transform="translate(4 4)">
        <R x={0} y={0} w={SW} h={SH} c="#0a1220" />
        {/* header */}
        <R x={0} y={0} w={SW} h={8} c="#1a2748" />
        <R x={0} y={8} w={SW} h={1} c={K.orange} o={0.7} />
        <PText x={3} y={1} text="TECH DOMAIN - AI SYSTEMS" color={K.white} />
        <R x={SW - 5} y={3} w={2} h={2} c={Math.floor(t * 2) % 2 ? K.neon : K.greenD} />
        {/* editor panel */}
        <g transform="translate(3 11)">
          <R x={0} y={0} w={48} h={27} c="#0e1830" />
          <R x={0} y={0} w={6} h={27} c="#0b1326" />
          {Array.from({ length: 6 }, (_, i) => {
            const line = CODE[(i + scroll) % CODE.length];
            let cx = 8 + line[0] * 3;
            return (
              <g key={i}>
                <R x={1} y={2 + i * 4} w={3} h={1} c={K.greyD} />
                {line[1].map(([w, c], j) => { const r = <R key={j} x={cx} y={2 + i * 4} w={w} h={2} c={c} />; cx += w + 2; return r; })}
              </g>
            );
          })}
          <R x={8 + 2 * 3} y={2 + 5 * 4} w={1} h={2} c={Math.floor(t * 3) % 2 ? K.white : "#0e1830"} />
        </g>
        {/* neural net panel */}
        <g transform="translate(54 11)">
          <R x={0} y={0} w={47} h={27} c="#0e1830" />
          {NET.slice(0, -1).map((layer, li) => layer.flatMap((a, ai) => NET[li + 1].map((b, bi) => {
            const steps = 6, lit = li === pulse - 1 || li === pulse;
            return Array.from({ length: steps }, (_, k) => (
              <R key={`${li}-${ai}-${bi}-${k}`} x={Math.round(a.x + 2 + ((b.x - a.x) * k) / steps)} y={Math.round(a.y + 2 + ((b.y - a.y) * k) / steps)} w={1} h={1} c={lit ? K.orange : K.greyD} o={lit ? 0.9 : 0.5} />
            ));
          })))}
          {NET.map((layer, li) => layer.map((n, ni) => <R key={`${li}-${ni}`} x={n.x} y={n.y} w={4} h={4} c={li === pulse ? K.neon : K.cyan} />))}
          <PText x={38} y={20} text="AI" color={K.orange} />
        </g>
        {/* build ticker */}
        <R x={0} y={SH - 6} w={SW} h={6} c={K.ink} o={0.75} />
        <PText x={2} y={SH - 5} text=">" color={K.neon} />
        {Array.from({ length: 22 }, (_, i) => {
          const ch = HEX[(i + Math.floor(t * 7)) % HEX.length];
          return <PText key={i} x={7 + i * 4} y={SH - 5} text={ch} color={i % 5 === 0 ? K.orange : K.cyan} />;
        })}
        {Array.from({ length: 22 }, (_, i) => <R key={i} x={0} y={i * 2 + 1} w={SW} h={1} c="#000" o={0.12} />)}
        <R x={2} y={10} w={14} h={1} c={K.white} o={0.1} />
      </g>
      <R x={SW / 2 - 2} y={SH + 12} w={12} h={4} c={K.greyD} />
      <R x={SW / 2 - 10} y={SH + 15} w={28} h={2} c={K.grey} />
    </g>
  );
}
