"use client";

import { useState } from "react";

/** Hit/light regions as polygons over the 680x382 collage photo. Later entries sit on top of earlier ones. */
const mri = (c: number, r: number): [string, number[]] => {
  const x = [507, 567, 627, 680][c], x2 = [507, 567, 627, 680][c + 1], y = r * 59, y2 = y + 59;
  return [`mri${c}${r}`, [x, y, x2, y, x2, y2, x, y2]];
};
const REGIONS: [string, number[]][] = [
  ["bones", [0, 0, 140, 0, 140, 215, 0, 215]],
  ["brain", [140, 0, 258, 0, 258, 85, 140, 85]],
  ["organs", [258, 0, 356, 0, 356, 88, 258, 88]],
  ["chart", [358, 0, 478, 0, 478, 82, 358, 82]],
  ["panel", [366, 84, 477, 84, 477, 230, 366, 230]],
  ["tissue", [477, 0, 506, 0, 506, 140, 477, 140]],
  ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => mri(c, r))),
  ["muscles", [548, 177, 680, 177, 680, 382, 548, 382]],
  ["surgeons", [0, 215, 60, 195, 110, 195, 130, 185, 190, 230, 250, 255, 250, 382, 0, 382]],
  ["skeleton", [140, 60, 190, 55, 215, 95, 245, 120, 250, 200, 225, 225, 190, 232, 150, 215, 138, 150]],
  ["heart", [243, 86, 366, 84, 366, 248, 243, 250]],
  ["book", [222, 250, 300, 215, 360, 228, 355, 340, 310, 382, 245, 382, 224, 300]],
  ["man", [490, 140, 530, 138, 562, 200, 572, 300, 548, 382, 498, 382, 478, 250]],
  ["doctor", [402, 148, 440, 150, 478, 230, 500, 382, 350, 382, 360, 290, 395, 190]],
];
const SRC = "/bio/collage.webp";

/** Dim anatomy collage: only the piece under the cursor (or last tapped on touch) lights up. Styles: .bio-* in globals.css. */
export default function BioCollage({ className = "" }: { className?: string }) {
  const [lit, setLit] = useState<string | null>(null);
  return (
    <svg aria-hidden viewBox="0 0 680 382" preserveAspectRatio="xMidYMid slice" className={`${className} block bg-[#03050a]`}>
      <defs>
        {REGIONS.map(([id, p]) => <clipPath key={id} id={`bz-${id}`}><polygon points={p.join(" ")} /></clipPath>)}
      </defs>
      <image href={SRC} width="680" height="382" preserveAspectRatio="none" className="bio-base" />
      {REGIONS.map(([id]) => (
        <g key={id} clipPath={`url(#bz-${id})`} className={`bio-z${lit === id ? " lit" : ""}`}
          onPointerDown={(e) => { if (e.pointerType !== "mouse") setLit(id); }}>
          <image href={SRC} width="680" height="382" preserveAspectRatio="none" />
        </g>
      ))}
    </svg>
  );
}
