"use client";

import { PText, R, useTick } from "./pixel";

/**
 * The scientist-turned-engineer, drawn pixel by pixel from spans: [y, x0, x1, colour] (inclusive), painted in order.
 * Long dark hair with highlights, round glasses with a lens glint, lashes, lips and blush, a slim neck, an orange
 * hoodie with shading and monitor rim-light, jeans and sneakers. Everything is a pure function of a few flags.
 */
const C = {
  H: "#1c1220", Hm: "#33223a", Hh: "#5b3a63", Hs: "#84568c",
  S: "#f3bd98", Ss: "#d98f6e", Sd: "#b86e55", St: "#ffd9bb", B: "#ec8a9a", L: "#c93f5a", Lh: "#ea6e88",
  E: "#14102a", G: "#e6f2ff", Gd: "#8fb3c8", g: "#a9def5", q: "#ffffff",
  O: "#FF5A14", Oh: "#ff8c55", Os: "#d9470f", Od: "#9a2f0a", Ot: "#ffb48a",
  W: "#f2f2ee", Wd: "#c9cbe0", J: "#33509a", Jh: "#4f72c4", Js: "#243a73", Jd: "#17264f", Sh: "#f2f2ee", Sd2: "#b8bccf",
  rim: "#27f0ff",
};
type Seg = [number, number, number, string];
function Spans({ s, ox = 0, oy = 0 }: { s: Seg[]; ox?: number; oy?: number }) {
  return <g shapeRendering="crispEdges">{s.map(([y, x0, x1, c], i) => <rect key={i} x={x0 + ox} y={y + oy} width={x1 - x0 + 1.02} height={1.02} fill={c} />)}</g>;
}
const px = (x: number, y: number, c: string): Seg => [y, x, x, c];
/** mirrors segs written for the left half around centre line cx (so faces are symmetric) */
const mirror = (segs: Seg[], cx: number): Seg[] => segs.flatMap(([y, a, b, c]) => [[y, a, b, c] as Seg, [y, 2 * cx - b, 2 * cx - a, c] as Seg]);

/* ---------- profile head, facing left (origin: top-left of the head box) ---------- */
function profileHead({ blink, hairSway, gaze, phones }: { blink: boolean; hairSway: number; gaze: { x: number; y: number }; phones: boolean }): Seg[] {
  const s: Seg[] = [];
  // hair: crown, back mass and the long curtain down her back
  s.push([-5, 9, 15, C.H], [-4, 7, 18, C.H], [-3, 5, 20, C.H], [-2, 4, 21, C.H], [-1, 3, 22, C.H]);
  for (let y = 0; y <= 6; y++) s.push([y, 3, 23, C.H]);
  for (let y = 7; y <= 20; y++) s.push([y, 10, 24, C.H]);
  for (let y = 21; y <= 36; y++) s.push([y, 12 + (y > 28 ? 1 : 0), 25 + hairSway * (y > 30 ? 1 : 0), C.H]);
  s.push([37, 14, 24 + hairSway, C.H], [38, 15, 23 + hairSway, C.H], [39, 17, 22 + hairSway, C.Hm]);
  // highlights + strand lines
  s.push([-4, 10, 13, C.Hm], [-3, 8, 13, C.Hh], [-2, 7, 11, C.Hh], [-1, 7, 9, C.Hs], [0, 6, 8, C.Hh], [1, 5, 6, C.Hm]);
  for (const y of [9, 13, 17, 22, 26, 30, 34]) s.push(px(16, y, C.Hm), px(17, y + 1, C.Hm), px(20, y + 2, C.Hm), px(21, y + 3, C.Hm));
  for (const y of [12, 24, 31]) s.push(px(14, y, C.Hh), px(19, y + 4, C.Hh));
  // face
  s.push([5, 3, 5, C.S], [6, 2, 6, C.S], [7, 2, 9, C.S]);
  for (let y = 8; y <= 14; y++) s.push([y, 4, 9, C.S]);
  s.push([8, 9, 12, C.S], [9, 9, 12, C.S], [10, 9, 12, C.S], [11, 9, 12, C.S], [12, 9, 12, C.S], [13, 9, 11, C.Ss]);
  s.push(px(2, 11, C.S), [12, 1, 2, C.S], [13, 1, 3, C.S], [14, 2, 3, C.S], px(1, 12, C.St));
  s.push([15, 3, 7, C.S], [16, 3, 8, C.S], [17, 4, 9, C.S], [18, 6, 10, C.Ss], [19, 8, 11, C.Ss]);
  s.push([14, 7, 8, C.B], [13, 6, 7, C.B]);                                   // blush
  s.push([15, 3, 5, C.L], [16, 3, 4, C.Lh], px(6, 15, C.Ss));               // lips + smile corner
  s.push(px(5, 7, C.St), px(4, 6, C.St));
  // neck (slim) with shadow under the jaw
  for (let y = 19; y <= 28; y++) s.push([y, 8, 13, y < 22 ? C.Ss : C.S], [y, 12, 13, C.Ss]);
  s.push([20, 8, 12, C.Sd]);
  // round glasses: rim, lens, eye, glint
  s.push([8, 4, 7, C.G], [9, 3, 3, C.G], [9, 8, 8, C.G], [10, 3, 3, C.G], [10, 8, 8, C.G], [11, 3, 3, C.G], [11, 8, 8, C.G], [12, 4, 7, C.G]);
  s.push([9, 4, 7, C.g], [10, 4, 7, C.g], [11, 4, 7, C.g]);
  const sx = gaze.x > 0 ? 1 : 0, py = 10 + (gaze.y > 0 ? 1 : gaze.y < 0 ? -1 : 0);
  if (blink) s.push([10, 4, 7, C.E]); else s.push([py, 4 + sx, 5 + sx, C.E], px(4 + sx, py - 1, C.E), px(3 + sx, py - 1, C.E), px(5 + sx, py + 1, C.Hm));
  s.push(px(6, 9, C.q), px(7, 9, C.q), px(7, 10, C.Gd), [9, 9, 13, C.G]);   // glint + temple arm
  s.push([7, 2, 5, C.H]);                                                     // brow
  // side-swept bangs over the forehead + a lock falling beside the cheek
  s.push([1, 3, 9, C.H], [2, 3, 8, C.H], [3, 3, 7, C.Hm], [4, 3, 6, C.H], px(3, 5, C.H));
  for (let y = 7; y <= 18; y++) s.push([y, 10, 12, y % 4 === 0 ? C.Hh : C.Hm]);
  s.push([5, 12, 13, C.O], [6, 12, 13, C.Os]);                               // orange hair clip
  if (phones) {
    // headphones: a band over the crown and an orange ear cup
    s.push([-6, 8, 17, "#2c3162"], [-5, 6, 19, "#2c3162"], [-4, 5, 7, "#2c3162"], [-4, 18, 20, "#2c3162"]);
    for (let y = -3; y <= 6; y++) s.push([y, 5, 6, "#2c3162"], [y, 19, 20, "#2c3162"]);
    for (let y = 7; y <= 14; y++) s.push([y, 9, 14, y === 7 || y === 14 ? C.Os : C.O]);
    s.push([8, 10, 12, C.Oh], [9, 10, 11, C.Ot], [15, 10, 13, C.Od]);
  }
  return s;
}

/* ---------- front-facing head (angry glare + the standing dance), 22 wide ---------- */
function frontHead({ angry, blink }: { angry: boolean; blink: boolean }): Seg[] {
  const half: Seg[] = [];
  // hair: crown, centre part, long locks framing the face down to the chest
  half.push([-5, 5, 10, C.H], [-4, 3, 10, C.H], [-3, 1, 10, C.H], [-2, 0, 10, C.H]);
  for (let y = -1; y <= 6; y++) half.push([y, -1, 10, C.H]);
  for (let y = 7; y <= 14; y++) half.push([y, -1, 2, C.H]);
  for (let y = 15; y <= 30; y++) half.push([y, -1 + (y > 22 ? 1 : 0), 3, C.H]);
  half.push([-4, 4, 7, C.Hm], [-3, 2, 6, C.Hh], [-2, 1, 3, C.Hs], [0, 0, 2, C.Hh], [2, -1, 1, C.Hm]);
  for (const y of [8, 12, 17, 21, 25]) half.push(px(0, y, C.Hm), px(1, y + 1, C.Hh));
  // face oval
  half.push([6, 3, 10, C.S], [7, 2, 10, C.S]);
  for (let y = 8; y <= 15; y++) half.push([y, 2, 10, C.S]);
  half.push([16, 3, 10, C.S], [17, 4, 10, C.S], [18, 6, 10, C.Ss], [19, 8, 10, C.Ss]);
  half.push([13, 3, 4, C.B], [14, 3, 4, C.B]);                               // cheeks
  half.push([2, 3, 10, C.H], [3, 3, 10, C.H], [4, 4, 10, C.H]);               // fringe (centre part drawn by the gap)
  half.push([5, 2, 4, C.H], [6, 2, 3, C.H]);                                 // side locks over the forehead corners
  // glasses: ring, lens, eye, glint
  half.push([8, 2, 5, C.G], [9, 1, 1, C.G], [10, 1, 1, C.G], [11, 1, 1, C.G], [12, 2, 5, C.G], [9, 6, 6, C.G], [10, 6, 6, C.G], [11, 6, 6, C.G]);
  half.push([9, 2, 5, C.g], [10, 2, 5, C.g], [11, 2, 5, C.g]);
  half.push(blink ? [10, 2, 5, C.E] : [10, 3, 4, C.E]);
  if (!blink) half.push(px(3, 9, C.E), px(2, 9, C.q), px(5, 11, C.q));
  half.push(px(2, 8, C.Gd));
  // brows (angry slants down toward the nose; calm arcs)
  if (angry) half.push([6, 1, 2, C.H], [7, 3, 4, C.H], [8, 5, 5, C.H], px(2, 5, "#7a2230"), px(3, 6, "#7a2230"));
  else half.push([6, 1, 5, C.H], px(0, 7, C.H));
  const f = mirror(half, 10);
  // centre features
  f.push([13, 10, 11, C.Ss], [14, 10, 11, C.Ss]);                            // nose
  if (angry) f.push([16, 7, 14, C.L], px(6, 17, C.L), px(15, 17, C.L), [17, 8, 13, C.Lh]);
  else f.push([16, 8, 13, C.L], [17, 9, 12, C.Lh], px(7, 16, C.Ss), px(14, 16, C.Ss));
  f.push([20, 9, 12, C.Ss]);                                                 // chin shadow
  return f;
}

/** Seated at the desk, profile facing the monitor. (x, y) = top of her head box. */
export type Face = "side" | "angry" | "hello";
export function SeatedGirl({ x, y, face = "side", empty = false, gaze = { x: 0, y: 0 }, phones = false, stretch = false }: { x: number; y: number; face?: Face; empty?: boolean; gaze?: { x: number; y: number }; phones?: boolean; stretch?: boolean }) {
  const angry = face === "angry", front = face !== "side";
  const tick = useTick(phones ? 9 : 6, !empty);
  const typing = Math.floor(tick / 2) % 2;
  const breathe = Math.floor(tick / 5) % 2;
  const blink = tick % 22 === 0;
  const hairSway = Math.floor(tick / 9) % 2;
  const lean = angry ? 1 : 0;
  const hy = typing ? 1 : 0;
  const nod = phones && Math.floor(tick / 3) % 2 ? 1 : 0;
  const hx = gaze.x < 0 ? -1 : gaze.x > 0 ? 1 : 0, hyy = gaze.y > 0 ? 1 : gaze.y < 0 ? -1 : 0;
  const up = stretch ? -3 : 0;
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      {/* office chair: mesh back with a frame, armrest, seat, gas lift, five-star base with wheels */}
      <Spans s={[
        [20, 22, 30, "#262b52"], ...Array.from({ length: 36 }, (_, i): Seg => [21 + i, 23, 29, i % 2 ? "#303766" : "#1e2344"]), [57, 22, 30, "#262b52"],
        [22, 22, 22, "#4a5496"], [22, 23, 23, "#4a5496"],
        [58, 4, 30, "#2a3060"], [59, 4, 30, "#1d2347"], [60, 6, 28, "#14183a"],
        [61, 16, 18, "#6a7099"], [62, 16, 18, "#5a6080"], [63, 16, 18, "#6a7099"], [64, 16, 18, "#5a6080"], [65, 16, 18, "#6a7099"], [66, 16, 18, "#5a6080"], [67, 16, 18, "#6a7099"], [68, 16, 18, "#5a6080"], [69, 16, 18, "#6a7099"], [70, 16, 18, "#5a6080"],
        [71, 4, 30, "#5a6080"], [72, 3, 31, "#3d4268"], [73, 2, 6, "#14102a"], [73, 14, 20, "#14102a"], [73, 28, 32, "#14102a"], [74, 2, 6, "#14102a"], [74, 14, 20, "#14102a"], [74, 28, 32, "#14102a"],
        [49, 3, 15, "#3d4268"], [50, 3, 15, "#2a3060"],
      ]} />
      {empty ? null : (
        <g>
          {/* legs: thigh, knee, shin, sneaker with laces */}
          <g transform="translate(0 0)">
            <Spans s={[
              [52, -4, 22, C.J], [53, -4, 22, C.Jh], [54, -4, 22, C.J], [55, -5, 22, C.J], [56, -5, 22, C.Js], [57, -5, 20, C.Js], [58, -5, 8, C.Jd],
              ...Array.from({ length: 22 }, (_, i): Seg => [59 + i, -5, 1, i % 6 === 5 ? C.Js : C.J]),
              ...Array.from({ length: 22 }, (_, i): Seg => [59 + i, 0, 1, C.Js]),
              [59, -5, -3, C.Jh], [66, -5, -4, C.Jh],
              [81, -9, 2, C.Sh], [82, -10, 3, C.Sh], [83, -10, 3, C.Sd2], [84, -10, 3, C.O], [85, -10, 3, C.Od],
              px(-5, 81, C.Sd2), px(-3, 81, C.Sd2), px(-1, 81, C.Sd2), px(-7, 82, C.Sd2),
            ]} />
          </g>
          <g transform={`translate(${lean} ${breathe + up})`}>
            {/* hair curtain behind the body, head, neck */}
            {!front && <g transform={`translate(${hx} ${hyy + nod})`}><Spans s={profileHead({ blink, hairSway, gaze, phones })} ox={9} oy={0} /></g>}
            {front && <Spans s={[...Array.from({ length: 22 }, (_, i): Seg => [14 + i, 21, 34 + (i > 14 ? 1 : 0), C.H]), [30, 19, 22, C.S], [31, 19, 22, C.Ss], [32, 19, 22, C.Ss]]} />}
            {/* torso: hoodie with hood bunched behind the neck, folds, drawstrings and rim light */}
            <Spans s={[
              ...Array.from({ length: 30 }, (_, i): Seg => [21 + i, i < 4 ? 15 - i : i < 14 ? 11 : i < 22 ? 11 + Math.floor((i - 13) / 3) : i < 26 ? 14 : 13, 29, C.O]),
              ...Array.from({ length: 30 }, (_, i): Seg => [21 + i, 24, 29, C.Os]),
              ...Array.from({ length: 30 }, (_, i): Seg => [21 + i, 27, 29, C.Od]),
              [21, 14, 20, C.Oh], [22, 13, 18, C.Oh], [23, 13, 15, C.Ot],
              [50, 14, 29, C.Os], [51, 14, 29, C.Od],
              [27, 18, 29, C.Os], [28, 20, 29, C.Od],
              [34, 16, 22, C.Os], [35, 17, 21, C.Os], [41, 15, 23, C.Os], [42, 16, 22, C.Os],
              // hood bunched behind the neck
              [18, 24, 32, C.Os], [19, 23, 33, C.O], [20, 22, 33, C.Oh], [21, 22, 33, C.O], [22, 22, 32, C.Os], [23, 23, 31, C.Os], [24, 24, 30, C.Od],
              // drawstrings
              [27, 14, 14, C.W], [28, 14, 14, C.W], [29, 14, 14, C.W], [30, 14, 14, C.Wd], [27, 16, 16, C.W], [28, 16, 16, C.W], [29, 16, 16, C.Wd],
              // cyan/orange rim light from the monitor on her front edge
              [26, 11, 11, C.rim], [29, 11, 11, C.rim], [32, 11, 11, C.Ot], [36, 12, 12, C.Ot], [44, 14, 14, C.Ot],
            ]} ox={6} oy={0} />
            {/* arm: shoulder, elbow, forearm, cuff, hand on the keys with fingers */}
            <Spans s={[
              [26, 11, 21, C.O], [27, 10, 21, C.Oh], [28, 10, 21, C.O], [29, 10, 20, C.O], [30, 10, 19, C.Os], [31, 9, 18, C.Os], [32, 9, 17, C.Od],
              [33 + hy, -10, 12, C.O], [34 + hy, -10, 12, C.Oh], [35 + hy, -10, 12, C.O], [36 + hy, -10, 12, C.Os], [37 + hy, -10, 12, C.Os], [38 + hy, -9, 12, C.Od],
              [33 + hy, -10, -8, C.Od], [34 + hy, -10, -8, C.Od], [35 + hy, -10, -8, C.Od], [36 + hy, -10, -8, C.Od], [37 + hy, -10, -8, C.Od],
              [33 + hy, -15, -11, C.S], [34 + hy, -16, -11, C.St], [35 + hy, -16, -11, C.S], [36 + hy, -16, -11, C.S], [37 + hy, -15, -11, C.Ss],
              px(-17, 35 + hy, C.S), px(-17, 36 + hy, C.Ss), px(-13, 38 + hy, C.Ss), px(-15, 38 + hy, C.Ss),
            ]} ox={9} oy={0} />
          </g>
        </g>
      )}
      {!empty && front && (
        <g transform={`translate(${lean} ${up})`}>
          <Spans s={frontHead({ angry, blink: false })} ox={19} oy={4} />
          {angry ? (
            <Spans s={[[-10, 14, 16, C.W], [-9, 13, 17, C.W], [-8, 14, 16, C.Wd], [-12, 35, 36, "#ff4040"], [-11, 35, 36, "#ff4040"], [-10, 35, 36, "#ff4040"], [-8, 35, 36, "#ff4040"], [-14, 4, 5, C.Wd], [-13, 3, 6, C.W]]} ox={0} oy={0} />
          ) : (
            <g>{/* speech bubble: HI */}<R x={4} y={-16} w={19} h={11} c={C.W} /><R x={3} y={-15} w={21} h={9} c={C.W} /><R x={9} y={-5} w={4} h={3} c={C.W} /><R x={10} y={-2} w={2} h={1} c={C.W} /><PText x={8} y={-13} text="HI" color="#1c1220" /></g>
          )}
        </g>
      )}
    </g>
  );
}

/** Front-facing, standing and dancing. cx = centre x, feet at feetY. */
export function StandingGirl({ cx, feetY, dancing }: { cx: number; feetY: number; dancing: boolean }) {
  const tick = useTick(5, dancing);
  const f = dancing ? tick % 4 : 0;
  const bob = dancing && f % 2 === 1 ? -3 : 0;
  const sway = dancing ? (f === 0 ? -1 : f === 2 ? 1 : 0) : 0;
  const leftUp = f === 0 || f === 1, rightUp = f === 0 || f === 3;
  const top = feetY - 112; // head top
  // arms hang from the shoulder (y 30) or swing up and outward; hand + cuff at the end
  const sleeve = (side: -1 | 1, up: boolean): Seg[] => {
    const out: Seg[] = [];
    if (up) {
      for (let i = 0; i < 30; i++) { const y = 31 - i, x0 = side * (11 + Math.floor(i / 2.2)) - (side === -1 ? 4 : 0); out.push([y, x0, x0 + 4, i < 3 ? C.Os : i > 24 ? C.Od : i % 8 === 7 ? C.Os : C.O]); }
      const x0 = side * (11 + Math.floor(29 / 2.2)) - (side === -1 ? 4 : 0);
      out.push([0, x0, x0 + 4, C.S], [-1, x0, x0 + 4, C.St], [-2, x0 + 1, x0 + 3, C.S]);
    } else {
      for (let i = 0; i < 28; i++) { const x0 = side * (11 + Math.floor(i / 14)) - (side === -1 ? 4 : 0); out.push([30 + i, x0, x0 + 4, i > 24 ? C.Od : i % 8 === 7 ? C.Os : i < 3 ? C.Os : C.O]); }
      const x0 = side * 12 - (side === -1 ? 4 : 0);
      out.push([58, x0, x0 + 4, C.S], [59, x0, x0 + 4, C.St], [60, x0 + 1, x0 + 3, C.Ss]);
    }
    return out;
  };
  return (
    <g transform={`translate(${cx + sway} ${top + bob})`} shapeRendering="crispEdges">
      {/* legs + sneakers (drawn first so the hoodie hem overlaps) */}
      <Spans s={[
        ...Array.from({ length: 46 }, (_, i): Seg => [58 + i, -9, -2, i % 9 === 8 ? C.Js : C.J]), ...Array.from({ length: 46 }, (_, i): Seg => [58 + i, 2, 9, i % 9 === 8 ? C.Js : C.J]),
        ...Array.from({ length: 46 }, (_, i): Seg => [58 + i, -3, -2, C.Js]), ...Array.from({ length: 46 }, (_, i): Seg => [58 + i, 2, 3, C.Jh]),
        [104, -12, -1, C.Sh], [105, -13, -1, C.Sh], [106, -13, -1, C.Sd2], [107, -13, -1, C.O], [108, -13, -1, C.Od],
        [104, 1, 12, C.Sh], [105, 1, 13, C.Sh], [106, 1, 13, C.Sd2], [107, 1, 13, C.O], [108, 1, 13, C.Od],
      ]} oy={0} />
      {/* hoodie body, hood ring, drawstrings, pocket, hem band */}
      <Spans s={[
        ...Array.from({ length: 44 }, (_, i): Seg => [24 + i, -11 + (i > 14 && i < 30 ? 1 : 0) - (i > 36 ? 1 : 0), 10 - (i > 14 && i < 30 ? 1 : 0) + (i > 36 ? 1 : 0), C.O]),
        ...Array.from({ length: 44 }, (_, i): Seg => [24 + i, 6, 10 - (i > 14 && i < 30 ? 1 : 0) + (i > 36 ? 1 : 0), C.Os]),
        ...Array.from({ length: 44 }, (_, i): Seg => [24 + i, -11 + (i > 14 && i < 30 ? 1 : 0) - (i > 36 ? 1 : 0), -8, C.Oh]),
        [66, -13, 12, C.Os], [67, -13, 12, C.Od],
        [24, -9, 8, C.Os], [25, -10, 9, C.O], [26, -10, 9, C.Oh], [27, -9, 8, C.Os],
        [52, -9, 7, C.Os], [53, -8, 6, C.Od], [54, -7, 5, C.Os],
        [50, -9, 8, C.Os], [51, -10, 9, C.Os], [56, -10, 9, C.Os], [57, -10, 9, C.Os], [58, -9, 8, C.Os],
        // drawstrings
        [28, -4, -4, C.W], [29, -4, -4, C.W], [30, -4, -4, C.W], [31, -4, -4, C.W], [32, -4, -4, C.W], [33, -4, -4, C.Wd], [28, 3, 3, C.W], [29, 3, 3, C.W], [30, 3, 3, C.W], [31, 3, 3, C.W], [32, 3, 3, C.W], [33, 3, 3, C.Wd],
        px(-4, 34, C.W), px(3, 34, C.W),
        // kangaroo pocket
        [50, -9, 8, C.Os], [51, -9, 8, C.Os], ...Array.from({ length: 10 }, (_, i): Seg => [52 + i, -9 + Math.floor(i / 5), 8 - Math.floor(i / 5), C.Os]),
        [51, -9, 8, C.Oh], [61, -8, 7, C.Od],
        // seam lines
        [40, 0, 0, C.Os], [41, 0, 0, C.Os], [42, 0, 0, C.Os],
      ]} oy={0} />
      <Spans s={frontHead({ angry: false, blink: dancing && tick % 6 === 0 })} ox={-10} oy={5} />
      <Spans s={sleeve(-1, leftUp)} oy={0} />
      <Spans s={sleeve(1, rightUp)} oy={0} />
    </g>
  );
}
