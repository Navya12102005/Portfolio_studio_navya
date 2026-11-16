"use client";

import { K, R, useTick } from "./pixel";

const HD = "#FF5A14", HDS = "#c4420f", HDH = "#ff8a52"; // hoodie, shade, highlight

/**
 * The scientist, built from rectangles so every pose is just different coordinates.
 * Dark hair, round glasses, orange hoodie. SeatedGirl faces the monitor (profile, facing left) and can whip her
 * head round to glare at the viewer; StandingGirl faces front for the cap dance.
 */

function FrontHead({ x, y, angry }: { x: number; y: number; angry: boolean }) {
  // x,y = top-left of a 16-wide head box
  return (
    <g shapeRendering="crispEdges">
      <R x={x - 1} y={y - 2} w={18} h={9} c={K.hair} />
      <R x={x - 1} y={y + 7} w={4} h={13} c={K.hair} />
      <R x={x + 13} y={y + 7} w={4} h={13} c={K.hair} />
      <R x={x + 2} y={y - 3} w={7} h={1} c={K.hairH} />
      <R x={x + 2} y={y + 3} w={12} h={13} c={K.skin} />
      <R x={x + 2} y={y + 3} w={12} h={3} c={K.hair} />
      <R x={x + 3} y={y + 15} w={10} h={1} c={K.skinD} />
      {/* round glasses */}
      <R x={x + 3} y={y + 7} w={4} h={4} c={K.glass} />
      <R x={x + 9} y={y + 7} w={4} h={4} c={K.glass} />
      <R x={x + 4} y={y + 8} w={2} h={2} c={K.n8} />
      <R x={x + 10} y={y + 8} w={2} h={2} c={K.n8} />
      <R x={x + 7} y={y + 8} w={2} h={1} c={K.glass} />
      {angry ? (
        <>
          <R x={x + 2} y={y + 5} w={2} h={1} c={K.redD} /><R x={x + 4} y={y + 6} w={3} h={1} c={K.redD} />
          <R x={x + 12} y={y + 5} w={2} h={1} c={K.redD} /><R x={x + 9} y={y + 6} w={3} h={1} c={K.redD} />
          <R x={x + 6} y={y + 13} w={4} h={1} c={K.redD} /><R x={x + 5} y={y + 14} w={1} h={1} c={K.redD} /><R x={x + 10} y={y + 14} w={1} h={1} c={K.redD} />
          <R x={x + 3} y={y + 12} w={2} h={1} c={K.red} o={0.7} /><R x={x + 11} y={y + 12} w={2} h={1} c={K.red} o={0.7} />
        </>
      ) : (
        <>
          <R x={x + 6} y={y + 13} w={4} h={1} c={K.red} /><R x={x + 5} y={y + 12} w={1} h={1} c={K.red} /><R x={x + 10} y={y + 12} w={1} h={1} c={K.red} />
          <R x={x + 3} y={y + 12} w={2} h={1} c={K.pink} o={0.6} /><R x={x + 11} y={y + 12} w={2} h={1} c={K.pink} o={0.6} />
        </>
      )}
    </g>
  );
}

/** Seated at the desk. Origin (x, y) = top of her head. */
export function SeatedGirl({ x, y, angry, empty = false }: { x: number; y: number; angry: boolean; empty?: boolean }) {
  const frame = useTick(3, !angry && !empty);
  const lean = angry ? 1 : 0;
  const hy = frame % 2 === 0 ? 0 : 1; // typing bob of the hand
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      {/* chair */}
      <R x={20} y={22} w={6} h={34} c="#2a2f55" /><R x={20} y={22} w={1} h={34} c={K.n5} />
      <R x={4} y={55} w={22} h={4} c="#2a2f55" /><R x={4} y={55} w={22} h={1} c={K.n5} />
      <R x={13} y={59} w={3} h={13} c={K.greyD} />
      <R x={3} y={72} w={24} h={2} c={K.greyD} /><R x={3} y={74} w={3} h={2} c={K.ink} /><R x={24} y={74} w={3} h={2} c={K.ink} /><R x={13} y={74} w={3} h={2} c={K.ink} />
      {empty ? null : <>
      {/* ponytail behind the hoodie */}
      <R x={19} y={10} w={5} h={26} c={K.hair} /><R x={20} y={12} w={1} h={14} c={K.hairH} />
      {/* legs: thigh, shin, shoe */}
      <R x={-2} y={51} w={22} h={6} c={K.jeans} /><R x={-2} y={51} w={22} h={1} c={K.jeansD} />
      <R x={-2} y={57} w={5} h={23} c={K.jeans} /><R x={2} y={57} w={1} h={23} c={K.jeansD} />
      <R x={-5} y={80} w={9} h={3} c={K.white} /><R x={-5} y={82} w={9} h={1} c={K.orange} />
      {/* coat */}
      <g transform={`translate(${lean} 0)`}>
        <R x={8} y={19} w={15} h={34} c={HD} />
        <R x={18} y={19} w={5} h={34} c={HDS} />
        <R x={8} y={48} w={17} h={6} c={HD} /><R x={8} y={52} w={17} h={2} c={HDS} />
        <R x={15} y={13} w={10} h={12} c={HDS} /><R x={16} y={14} w={6} h={2} c={HDH} /> {/* hood bunched at the back of the neck */}
        <R x={12} y={22} w={1} h={7} c={K.white} /><R x={14} y={22} w={1} h={5} c={K.white} /> {/* drawstrings */}
        {/* arm: sleeve then forearm reaching the keyboard */}
        <R x={5} y={25} w={9} h={7} c={HD} /><R x={5} y={31} w={9} h={1} c={HDS} />
        <R x={-9} y={31 + hy} w={15} h={5} c={HD} /><R x={-9} y={35 + hy} w={15} h={1} c={HDS} /><R x={-9} y={31 + hy} w={2} h={5} c={HDS} />
        <R x={-13} y={31 + hy} w={4} h={5} c={K.skin} /><R x={-13} y={35 + hy} w={4} h={1} c={K.skinD} />
        <R x={12} y={16} w={4} h={4} c={K.skinD} />
        {/* head */}
        {angry ? <FrontHead x={7} y={0} angry /> : (
          <g>
            <R x={9} y={-1} w={14} h={19} c={K.hair} /><R x={8} y={1} w={3} h={7} c={K.hair} />
            <R x={11} y={-2} w={8} h={1} c={K.hairH} /><R x={14} y={-5} w={6} h={5} c={K.hair} /><R x={15} y={-6} w={3} h={1} c={K.hairH} />
            <R x={6} y={5} w={8} h={11} c={K.skin} /><R x={5} y={10} w={2} h={3} c={K.skin} />
            <R x={9} y={7} w={5} h={5} c={K.glass} /><R x={10} y={8} w={3} h={3} c={K.n8} /><R x={14} y={8} w={8} h={1} c={K.glass} />
            <R x={6} y={14} w={3} h={1} c={K.red} /><R x={9} y={12} w={2} h={1} c={K.pink} o={0.6} />
            <R x={8} y={5} w={6} h={2} c={K.hair} /><R x={11} y={14} w={4} h={2} c={K.skinD} />
          </g>
        )}
      </g>
      </>}
    </g>
  );
}

/** Standing and facing the viewer. cx = centre x, feet at y = 152. */
export function StandingGirl({ cx, dancing }: { cx: number; dancing: boolean }) {
  const frame = useTick(4, dancing);
  const f = dancing ? frame % 4 : 0;
  const bob = dancing && f % 2 === 1 ? -2 : 0;
  const leftUp = f === 0 || f === 1, rightUp = f === 0 || f === 3;
  const arm = (side: -1 | 1, up: boolean) => {
    const ax = side === -1 ? cx - 14 : cx + 10;
    return up
      ? <g><R x={ax} y={70 + bob} w={4} h={24} c={HD} /><R x={ax} y={70 + bob} w={4} h={2} c={HDS} /><R x={ax} y={65 + bob} w={4} h={5} c={K.skin} /></g>
      : <g><R x={ax} y={90 + bob} w={4} h={24} c={HD} /><R x={ax} y={112 + bob} w={4} h={2} c={HDS} /><R x={ax} y={114 + bob} w={4} h={4} c={K.skin} /></g>;
  };
  return (
    <g shapeRendering="crispEdges">
      {/* legs + shoes */}
      <R x={cx - 7} y={118} w={6} h={32} c={K.jeans} /><R x={cx + 1} y={118} w={6} h={32} c={K.jeans} /><R x={cx - 1} y={118} w={2} h={32} c={K.jeansD} />
      <R x={cx - 9} y={150} w={8} h={3} c={K.white} /><R x={cx + 1} y={150} w={8} h={3} c={K.white} /><R x={cx - 9} y={152} w={8} h={1} c={K.orange} /><R x={cx + 1} y={152} w={8} h={1} c={K.orange} />
      <g transform={`translate(${dancing && f === 2 ? 1 : 0} ${bob})`}>
        {/* coat */}
        <R x={cx - 10} y={88} w={20} h={34} c={HD} /><R x={cx - 10} y={118} w={20} h={5} c={HDS} />
        <R x={cx - 9} y={83} w={18} h={7} c={HDS} /><R x={cx - 3} y={85} w={6} h={5} c={K.skin} /><R x={cx - 9} y={83} w={18} h={1} c={HDH} /> {/* hood around the neck */}
        <R x={cx - 4} y={90} w={1} h={9} c={K.white} /><R x={cx + 3} y={90} w={1} h={9} c={K.white} />
        <R x={cx - 7} y={108} w={14} h={9} c={HDS} /><R x={cx - 7} y={108} w={14} h={1} c={HDH} /><R x={cx - 1} y={108} w={2} h={9} c={HD} /> {/* kangaroo pocket */}
        <FrontHead x={cx - 8} y={66} angry={false} />
      </g>
      {arm(-1, leftUp)}{arm(1, rightUp)}
    </g>
  );
}
