"use client";

import { K, PText, R, useTick } from "./pixel";

const SW = 164, SH = 80; // screen size in scene pixels
const CODE: [number, [number, string][]][] = [
  [0, [[3, K.pink], [8, K.white], [5, K.cyan], [3, K.white]]], [1, [[6, K.yellow], [12, K.white]]], [1, [[4, K.pink], [9, K.green], [4, K.white], [6, K.orange]]],
  [2, [[10, K.white], [5, K.orange]]], [2, [[7, K.cyan], [6, K.white], [8, K.yellow]]], [1, [[3, K.pink], [14, K.white]]],
  [0, [[8, K.green], [5, K.white]]], [1, [[9, K.white], [6, K.cyan], [4, K.pink]]], [2, [[5, K.pink], [10, K.white]]], [1, [[12, K.yellow], [3, K.white]]],
  [2, [[6, K.cyan], [9, K.white], [5, K.green]]], [0, [[4, K.pink], [4, K.white]]],
];
const LAYERS = [3, 5, 5, 3];
const NET = LAYERS.map((n, li) => Array.from({ length: n }, (_, ni) => ({ x: 6 + li * 20, y: Math.round(3 + ((ni + 0.5) * 26) / n) })));
const HEX = "0A1F3C7E5B92D4F8";
const LOGS = ["BUILD OK", "TESTS 42 42", "DEPLOY 100%", "MODEL V3 READY"];

export type MonitorFx = { hold?: boolean; celebrate?: boolean; netFocus?: number | null; netSweep?: boolean; chartX?: number | null; chartHigh?: boolean; typed?: string };

/** The big monitor: a live "TECH DOMAIN - AI SYSTEMS" screen with an editor, a neural net, a chart and a terminal. */
export default function Monitor({ x, y, live, fx = {} }: { x: number; y: number; live: boolean; fx?: MonitorFx }) {
  const tick = useTick(8, live);
  const t = tick / 8;
  const scrollTick = useTick(3, live && !fx.hold); // stops counting while hovered, so the code freezes in place
  const scroll = scrollTick % CODE.length;
  const pulse = fx.netSweep ? tick % 5 : Math.floor(t * 3) % 5;
  const log = Math.floor(t / 1.4) % LOGS.length;

  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      {/* bezel with a lit edge and a chin LED */}
      <R x={0} y={0} w={SW + 16} h={SH + 18} c="#0d1024" />
      <R x={1} y={1} w={SW + 14} h={SH + 16} c="#2a3050" /><R x={1} y={1} w={SW + 14} h={1} c={K.grey} /><R x={1} y={SH + 16} w={SW + 14} h={1} c={K.n9} />
      <R x={2} y={2} w={1} h={SH + 14} c="#3c4470" />
      <R x={SW / 2 + 5} y={SH + 12} w={6} h={2} c={K.orange} />
      <g transform="translate(8 6)">
        <R x={0} y={0} w={SW} h={SH} c="#070e1b" />
        {/* header */}
        <R x={0} y={0} w={SW} h={10} c="#18254a" /><R x={0} y={10} w={SW} h={1} c={K.orange} o={0.8} />
        <PText x={4} y={2} text="TECH DOMAIN - AI SYSTEMS" color={K.white} />
        {[0, 1, 2].map((i) => <R key={i} x={SW - 20 + i * 5} y={3} w={3} h={3} c={[K.red, K.yellow, K.neon][i]} />)}
        {/* editor */}
        <g transform="translate(4 14)">
          <R x={0} y={0} w={82} h={52} c="#0b1428" /><R x={0} y={0} w={9} h={52} c="#08101f" />
          {Array.from({ length: 9 }, (_, i) => {
            const line = CODE[(i + scroll) % CODE.length];
            let cx = 12 + line[0] * 4;
            return (
              <g key={i}>
                <PText x={2} y={2 + i * 5.5} text={String((i + scroll) % 9 + 1)} color={K.greyD} />
                {line[1].map(([w, c], j) => { const r = <R key={j} x={cx} y={2 + i * 5.5} w={w} h={2} c={c} />; cx += w + 2; return r; })}
              </g>
            );
          })}
          <R x={12 + 8} y={2 + 8 * 5.5} w={1} h={3} c={Math.floor(t * 3) % 2 ? K.white : "#0b1428"} />
          {fx.hold && <><R x={9} y={2 + 3 * 5.5 - 1} w={73} h={5} c={K.orange} o={0.22} /><R x={9} y={2 + 3 * 5.5 - 1} w={1} h={5} c={K.orange} /></>}
        </g>
        {/* neural net */}
        <g transform="translate(89 14)">
          <R x={0} y={0} w={72} h={34} c="#0b1428" />
          {NET.slice(0, -1).map((layer, li) => layer.flatMap((a, ai) => NET[li + 1].map((b, bi) =>
            Array.from({ length: 8 }, (_, k) => {
              const lit = fx.netFocus != null ? li === fx.netFocus || li === fx.netFocus - 1 : li === pulse - 1 || li === pulse;
              return <R key={`${li}-${ai}-${bi}-${k}`} x={Math.round(a.x + 2 + ((b.x - a.x) * k) / 8)} y={Math.round(a.y + 2 + ((b.y - a.y) * k) / 8)} w={1} h={1} c={lit ? K.orange : K.greyD} o={lit ? 0.9 : 0.45} />;
            })
          )))}
          {NET.map((layer, li) => layer.map((n, ni) => <R key={`${li}-${ni}`} x={n.x} y={n.y} w={4} h={4} c={(fx.netFocus != null ? li === fx.netFocus : li === pulse % 4) ? K.neon : K.cyan} />))}
        </g>
        {/* chart: bars rise, line climbs */}
        <g transform="translate(89 51)">
          <R x={0} y={0} w={72} h={15} c="#0b1428" />
          {Array.from({ length: 14 }, (_, i) => {
            const base = 3 + Math.round(8 * (0.5 + 0.5 * Math.sin(i * 0.7 + t * 1.5)) * (0.4 + i / 20));
            const near = fx.chartX != null ? Math.max(0, 1 - Math.abs(3 + i * 5 - fx.chartX) / 18) : 0;
            const h = fx.chartHigh ? 5 + Math.round(i * 0.5) + 3 : Math.min(13, Math.round(base + near * 9));
            return <R key={i} x={3 + i * 5} y={13 - h} w={3} h={h} c={fx.chartHigh || near > 0.4 ? K.neon : i % 4 === 3 ? K.orange : K.cyan} />;
          })}
          <PText x={fx.chartHigh ? 36 : 50} y={1} text={fx.chartHigh ? "NEW HIGH" : "ACC 98%"} color={fx.chartHigh ? K.neon : K.yellow} />
        </g>
        {/* terminal ticker */}
        <R x={0} y={SH - 12} w={SW} h={12} c={K.ink} o={0.8} />
        <PText x={3} y={SH - 10} text=">" color={K.neon} />
        {fx.typed != null && fx.typed !== "" ? (
          <><PText x={9} y={SH - 10} text={fx.typed} color={K.white} /><R x={9 + fx.typed.split("").reduce((a, ch) => a + (ch === " " ? 2 : 4), 0)} y={SH - 10} w={2} h={5} c={Math.floor(t * 3) % 2 ? K.neon : "#000"} /></>
        ) : (
          <><PText x={9} y={SH - 10} text={LOGS[log]} color={K.white} />
          {Array.from({ length: 24 }, (_, i) => <PText key={i} x={66 + i * 4} y={SH - 10} text={HEX[(i + Math.floor(t * 7)) % HEX.length]} color={i % 5 === 0 ? K.orange : K.greyD} />)}</>
        )}
        <R x={SW - 4} y={SH - 8} w={2} h={4} c={Math.floor(t * 2) % 2 ? K.neon : K.greenD} />
        {fx.celebrate && (
          <g>
            <R x={34} y={30} w={96} h={20} c={K.ink} o={0.85} /><R x={34} y={30} w={96} h={1} c={K.neon} /><R x={34} y={49} w={96} h={1} c={K.neon} />
            <PText x={44} y={36} text="DEPLOY 100%" color={Math.floor(t * 6) % 2 ? K.neon : K.white} />
            {Array.from({ length: 28 }, (_, i) => <R key={i} x={(i * 29) % SW} y={Math.floor((t * 34 + i * 11) % SH)} w={2} h={2} c={[K.pink, K.yellow, K.cyan, K.orange, K.neon][i % 5]} />)}
          </g>
        )}
        {Array.from({ length: 40 }, (_, i) => <R key={i} x={0} y={i * 2 + 1} w={SW} h={1} c="#000" o={0.12} />)}
        <R x={3} y={13} w={22} h={1} c={K.white} o={0.1} /><R x={SW - 30} y={SH - 18} w={26} h={1} c={K.white} o={0.06} />
      </g>
      {/* stand */}
      <R x={SW / 2 + 1} y={SH + 18} w={14} h={5} c={K.greyD} /><R x={SW / 2 - 12} y={SH + 22} w={40} h={3} c={K.grey} /><R x={SW / 2 - 12} y={SH + 24} w={40} h={1} c={K.n9} />
    </g>
  );
}
