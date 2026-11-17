"use client";

import { useState, type CSSProperties } from "react";
import { ART, MriTile } from "./art";

type El = { id: string; art: string; seed?: number; d: [number, number, number, number]; m: [number, number, number, number]; z: number };
const T = (i: number, d: [number, number, number, number], m: [number, number, number, number]): El => ({ id: `mri${i}`, art: "mri", seed: i + 1, d, m, z: 2 });
const EL: El[] = [
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => T(i, [(i % 3) * 9.3, Math.floor(i / 3) * 16.5, 9.3, 16.5], i < 6 ? [i * 16.6, 0, 16.6, 12.5] : [(i - 6) * 16.6, 12.5, 16.6, 12.5])),
  { id: "chart", art: "chart", d: [0, 50, 14, 34], m: [0, 25, 22, 33], z: 3 },
  { id: "skeleton", art: "skeleton", d: [14, 52, 28, 30], m: [0, 82.5, 100, 10], z: 3 },
  { id: "heart", art: "heart", d: [28, 0, 13, 50], m: [50, 36.5, 25, 22], z: 3 },
  { id: "doctor", art: "doctor", d: [42, 0, 16, 84], m: [22, 25, 28, 40], z: 4 },
  { id: "book", art: "book", d: [58, 0, 11, 42], m: [75, 36.5, 25, 22], z: 3 },
  { id: "blue", art: "blue", d: [69, 0, 11, 42], m: [0, 58, 22, 24], z: 3 },
  { id: "surgeons", art: "surgeons", d: [80, 0, 20, 46], m: [50, 12.5, 50, 24], z: 3 },
  { id: "console", art: "console", d: [58, 42, 22, 42], m: [22, 65, 36, 17], z: 4 },
  { id: "organs", art: "organs", d: [80, 46, 20, 38], m: [58, 58.5, 42, 24], z: 3 },
  { id: "bones", art: "bones", d: [0, 84, 100, 16], m: [0, 92.5, 100, 7.5], z: 2 },
];

/** Dim anatomy collage; the element under the cursor (or the last one tapped) lights up. Styles: .bio-el in globals.css. */
export default function BioCollage({ className = "" }: { className?: string }) {
  const [lit, setLit] = useState<string | null>(null);
  return (
    <div aria-hidden className={`${className} overflow-hidden bg-[#03050a]`}>
      {EL.map((e) => {
        const Art = e.art === "mri" ? null : ART[e.art];
        const st = { "--dl": `${e.d[0]}%`, "--dt": `${e.d[1]}%`, "--dw": `${e.d[2]}%`, "--dh": `${e.d[3]}%`, "--ml": `${e.m[0]}%`, "--mt": `${e.m[1]}%`, "--mw": `${e.m[2]}%`, "--mh": `${e.m[3]}%`, "--z": e.z } as CSSProperties;
        return (
          <div key={e.id} style={st} className={`bio-el${lit === e.id ? " lit" : ""}`}
            onPointerDown={(ev) => { if (ev.pointerType !== "mouse") setLit(e.id); }}>
            {Art ? <Art /> : <MriTile seed={e.seed ?? 1} />}
          </div>
        );
      })}
    </div>
  );
}
