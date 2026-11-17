import type { ReactElement } from "react";

/**
 * Original vector artwork for the BIO collage: brain scans, a muscle-anatomy chart, a skeleton, a heart plate,
 * an anatomy book, a doctor in a gown, surgeons in blue scrubs, bone diagrams and an organ plate.
 * Each piece is its own <svg>, so the collage can dim and light them one by one.
 */
function rng(seed: number) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const grain = (id: string) => (
  <filter id={id} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.34 0" /></filter>
);

/* ---------- brain MRI tile ---------- */
export function MriTile({ seed }: { seed: number }) {
  const r = rng(seed * 97 + 13), id = `mri${seed}`;
  const rx = 28 + r() * 6, ry = 34 + r() * 5, face = seed % 3 === 0;
  const sulci = Array.from({ length: 22 }, () => {
    const a = r() * Math.PI * 2, d = 6 + r() * (rx - 9), x0 = 50 + Math.cos(a) * d, y0 = 54 + Math.sin(a) * d * (ry / rx);
    const a2 = a + (r() - 0.5) * 1.3, d2 = d + (r() - 0.5) * 10, x1 = 50 + Math.cos(a2) * d2, y1 = 54 + Math.sin(a2) * d2 * (ry / rx);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${((x0 + x1) / 2 + (r() - 0.5) * 9).toFixed(1)} ${((y0 + y1) / 2 + (r() - 0.5) * 9).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id}><stop offset="0" stopColor="#dfe5ee" /><stop offset="0.55" stopColor="#8d97a6" /><stop offset="1" stopColor="#3a4352" /></radialGradient>
      </defs>
      <rect width="100" height="100" fill="#04060a" /><rect x="1" y="1" width="98" height="98" fill="none" stroke="#2c3443" />
      <ellipse cx="50" cy="54" rx={rx + 5} ry={ry + 5} fill="#0b0f16" stroke="#b8c1ce" strokeWidth="2.4" />
      <ellipse cx="50" cy="54" rx={rx} ry={ry} fill={`url(#${id})`} />
      {face && <g fill="none" stroke="#b8c1ce" strokeWidth="1.6"><circle cx="38" cy="14" r="6" /><circle cx="62" cy="14" r="6" /><path d="M46 12 L50 24 L54 12" /></g>}
      {sulci.map((d, i) => <path key={i} d={d} fill="none" stroke="#161c26" strokeWidth={1 + r() * 1.2} opacity={0.85} strokeLinecap="round" />)}
      <path d="M50 50 Q42 44 40 54 Q42 62 50 60 Q58 62 60 54 Q58 44 50 50Z" fill="#0a0e15" opacity={0.9} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${34 + i * 12} ${40 + r() * 6} q${6 + r() * 6} -${4 + r() * 4} ${12} 0`} stroke="#f2f5fa" strokeWidth="0.8" fill="none" opacity={0.4} />)}
    </svg>
  );
}

/* ---------- red muscle-anatomy chart on cream paper ---------- */
function Fig({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const red = "#a3262a", dk = "#5a1013", lt = "#d4514f";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-92" rx="11" ry="13" fill={red} stroke={dk} strokeWidth="0.8" />
      <path d="M-7 -80 L7 -80 L11 -69 L-11 -69Z" fill={red} stroke={dk} strokeWidth="0.8" />
      <path d="M-34 -68 Q-38 -50 -26 -8 L-17 10 L17 10 L26 -8 Q38 -50 34 -68 Q0 -78 -34 -68Z" fill={red} stroke={dk} strokeWidth="0.8" />
      <path d="M-30 -60 Q-14 -68 0 -54 Q-8 -36 -28 -42Z M30 -60 Q14 -68 0 -54 Q8 -36 28 -42Z" fill={lt} stroke={dk} strokeWidth="0.7" />
      {[0, 1, 2].map((i) => <g key={i}><rect x="-13" y={-30 + i * 11} width="12" height="9" rx="3" fill={lt} stroke={dk} strokeWidth="0.6" /><rect x="1" y={-30 + i * 11} width="12" height="9" rx="3" fill={lt} stroke={dk} strokeWidth="0.6" /></g>)}
      <path d="M-34 -66 Q-52 -52 -54 -20 Q-56 2 -50 28 L-40 28 Q-42 2 -41 -20 Q-38 -46 -28 -58Z M34 -66 Q52 -52 54 -20 Q56 2 50 28 L40 28 Q42 2 41 -20 Q38 -46 28 -58Z" fill={red} stroke={dk} strokeWidth="0.8" />
      <path d="M-17 10 Q-30 44 -25 84 Q-23 104 -21 122 L-9 122 Q-9 84 -4 44 L0 10Z M17 10 Q30 44 25 84 Q23 104 21 122 L9 122 Q9 84 4 44 L0 10Z" fill={red} stroke={dk} strokeWidth="0.8" />
      {[-46, -40, 40, 46].map((px, i) => <path key={i} d={`M${px} -40 q${px < 0 ? -2 : 2} 30 0 60`} stroke={dk} strokeWidth="0.6" fill="none" opacity={0.7} />)}
      {[-22, 22].map((px, i) => <path key={i} d={`M${px} 30 q${px < 0 ? -4 : 4} 40 0 84`} stroke={dk} strokeWidth="0.6" fill="none" opacity={0.7} />)}
    </g>
  );
}
export function MuscleChart() {
  return (
    <svg viewBox="0 0 230 400" preserveAspectRatio="xMidYMid meet">
      <defs>{grain("mcg")}<linearGradient id="mcp" x1="0" x2="1"><stop offset="0" stopColor="#d9c9a6" /><stop offset="0.5" stopColor="#efe2c4" /><stop offset="1" stopColor="#d2c19c" /></linearGradient></defs>
      <rect width="230" height="400" fill="url(#mcp)" /><rect width="230" height="400" filter="url(#mcg)" />
      <rect x="6" y="6" width="218" height="388" fill="none" stroke="#6b4a2a" strokeWidth="1.2" opacity={0.6} />
      <text x="115" y="26" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fill="#3a2414" letterSpacing="2">MUSCLES OF THE HUMAN BODY</text>
      <line x1="30" y1="34" x2="200" y2="34" stroke="#6b4a2a" strokeWidth="0.8" />
      <Fig x={62} y={160} s={1.05} /><Fig x={168} y={160} s={1.05} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 52} y={330} width={36} height={4 + (i % 2) * 2} fill="#5b3f26" opacity={0.7} />)}
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20} y={346 + i * 8} width={150 + (i % 3) * 20} height={2} fill="#5b3f26" opacity={0.5} />)}
      <ellipse cx="196" cy="352" rx="14" ry="10" fill="#a3262a" opacity={0.85} /><ellipse cx="196" cy="376" rx="10" ry="8" fill="#c4635f" opacity={0.85} />
    </svg>
  );
}

/* ---------- skeleton lying across the collage ---------- */
export function Skeleton() {
  const ivory = "#dccfad", sh = "#a89a78", dk = "#4a4030";
  const vert = Array.from({ length: 22 }, (_, i) => i);
  return (
    <svg viewBox="0 0 640 230" preserveAspectRatio="xMidYMid meet">
      <defs><radialGradient id="skg"><stop offset="0" stopColor="#f3ead2" /><stop offset="1" stopColor="#cdbf9a" /></radialGradient></defs>
      {/* skull + jaw + teeth */}
      <ellipse cx="62" cy="108" rx="44" ry="50" fill="url(#skg)" stroke={sh} strokeWidth="2" />
      <ellipse cx="46" cy="96" rx="11" ry="13" fill={dk} /><ellipse cx="46" cy="126" rx="11" ry="12" fill={dk} />
      <path d="M72 104 L88 112 L72 120Z" fill={dk} />
      <rect x="82" y="94" width="26" height="32" rx="8" fill="url(#skg)" stroke={sh} strokeWidth="1.6" />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x="100" y={97 + i * 6} width="9" height="4" fill="#f6efdc" stroke={dk} strokeWidth="0.5" />)}
      {/* spine */}
      {vert.map((i) => <g key={i}><rect x={116 + i * 13} y={104 + Math.sin(i / 3.2) * 7} width="11" height="15" rx="4" fill={ivory} stroke={sh} strokeWidth="1.2" /><rect x={118 + i * 13} y={100 + Math.sin(i / 3.2) * 7} width="7" height="5" rx="2" fill={sh} /></g>)}
      {/* ribcage: arcs above and below the spine */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} fill="none" stroke={ivory} strokeWidth="5" strokeLinecap="round">
          <path d={`M${146 + i * 12} 108 Q${140 + i * 12} ${52 - i * 1.2} ${180 + i * 13} ${34 + i * 2}`} /><path d={`M${146 + i * 12} 118 Q${140 + i * 12} ${172 + i * 1.2} ${180 + i * 13} ${196 - i * 2}`} />
        </g>
      ))}
      <path d="M150 112 L276 112" stroke={sh} strokeWidth="9" opacity={0.7} />
      {/* shoulders, arms, hands */}
      <path d="M150 100 L120 40 L96 20 M150 124 L122 184 L98 208" fill="none" stroke={ivory} strokeWidth="8" strokeLinecap="round" />
      <g fill="none" stroke={ivory} strokeWidth="3" strokeLinecap="round"><path d="M96 20 l-14 -8 M96 20 l-8 -12 M96 20 l-2 -13 M98 208 l-14 8 M98 208 l-8 12 M98 208 l-2 13" /></g>
      {/* pelvis */}
      <path d="M392 104 Q432 70 470 90 Q490 112 470 134 Q432 154 392 120Z" fill="url(#skg)" stroke={sh} strokeWidth="2" /><ellipse cx="448" cy="112" rx="11" ry="9" fill={dk} />
      {/* legs: femur, knee, tibia, foot */}
      <path d="M470 96 L580 82 M470 128 L582 142" stroke={ivory} strokeWidth="11" strokeLinecap="round" /><circle cx="582" cy="80" r="11" fill={ivory} stroke={sh} strokeWidth="1.5" /><circle cx="584" cy="144" r="11" fill={ivory} stroke={sh} strokeWidth="1.5" />
      <path d="M590 82 L636 74 M592 146 L636 150" stroke={ivory} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- heart plate ---------- */
export function HeartPlate() {
  return (
    <svg viewBox="0 0 210 270" preserveAspectRatio="xMidYMid meet">
      <defs>{grain("htg")}
        <linearGradient id="htp" x1="0" x2="1"><stop offset="0" stopColor="#d8c8a4" /><stop offset="0.5" stopColor="#ecdfc0" /><stop offset="1" stopColor="#d0bf9a" /></linearGradient>
        <radialGradient id="htr" cx="0.4" cy="0.35"><stop offset="0" stopColor="#d4504c" /><stop offset="0.6" stopColor="#962024" /><stop offset="1" stopColor="#4d0c10" /></radialGradient>
      </defs>
      <rect width="210" height="270" fill="url(#htp)" /><rect width="210" height="270" filter="url(#htg)" />
      <rect x="5" y="5" width="200" height="260" fill="none" stroke="#6b4a2a" strokeWidth="1" opacity={0.6} />
      {/* vessels */}
      <path d="M110 76 Q116 30 150 34 Q170 40 168 64 M96 80 Q80 40 52 44 M126 80 Q150 60 172 82" fill="none" stroke="#7a1a1e" strokeWidth="12" strokeLinecap="round" />
      <path d="M96 82 Q76 56 58 62 M124 86 Q144 96 156 116" fill="none" stroke="#2b4a7a" strokeWidth="9" strokeLinecap="round" />
      {/* heart body */}
      <path d="M104 78 Q150 62 168 108 Q176 170 118 232 Q108 244 98 232 Q36 172 44 112 Q58 66 104 78Z" fill="url(#htr)" stroke="#3d080b" strokeWidth="1.6" />
      <path d="M74 116 Q96 150 106 214 M118 100 Q146 140 128 206" fill="none" stroke="#3d080b" strokeWidth="1.4" opacity={0.7} />
      <path d="M70 110 Q82 94 100 96" fill="none" stroke="#f0a0a0" strokeWidth="3" opacity={0.6} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="14" y={226 + i * 8} width={80 + (i % 2) * 40} height="2" fill="#5b3f26" opacity={0.55} />)}
      <text x="14" y="24" fontFamily="Georgia, serif" fontSize="10" fill="#3a2414" letterSpacing="2">CORPUS CORDIS</text>
    </svg>
  );
}

/* ---------- ANATOMY book ---------- */
export function AnatomyBook() {
  return (
    <svg viewBox="0 0 170 250" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="bkc" x1="0" x2="1"><stop offset="0" stopColor="#0d1016" /><stop offset="0.5" stopColor="#202733" /><stop offset="1" stopColor="#0d1016" /></linearGradient></defs>
      <g transform="rotate(-5 85 125)">
        <rect x="14" y="12" width="140" height="226" rx="4" fill="url(#bkc)" stroke="#5a6272" strokeWidth="1.5" />
        <rect x="14" y="12" width="12" height="226" fill="#07090d" /><rect x="24" y="12" width="2" height="226" fill="#3a4252" />
        <rect x="34" y="22" width="112" height="206" fill="none" stroke="#9aa3b2" strokeWidth="1.2" /><rect x="38" y="26" width="104" height="198" fill="none" stroke="#9aa3b2" strokeWidth="0.5" />
        <text x="90" y="52" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill="#d8dde6" letterSpacing="3">ANATOMY</text>
        <line x1="50" y1="60" x2="130" y2="60" stroke="#9aa3b2" strokeWidth="0.8" />
        {/* engraved figure */}
        <g fill="none" stroke="#c6ccd6" strokeWidth="1.1" opacity={0.9}>
          <circle cx="90" cy="92" r="10" /><path d="M80 104 Q60 120 62 160 L66 200 M100 104 Q120 120 118 160 L114 200 M80 106 Q90 116 100 106 M70 140 Q90 154 110 140 M76 160 Q90 170 104 160 M72 120 Q90 134 108 120" />
          <path d="M90 122 V196" strokeWidth="0.8" />
        </g>
        <text x="90" y="216" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7" fill="#9aa3b2" letterSpacing="2">ILLUSTRATED</text>
      </g>
    </svg>
  );
}

/* ---------- doctor in a grey gown with a stethoscope ---------- */
export function Doctor() {
  return (
    <svg viewBox="0 0 280 340" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stopColor="#6e747e" /><stop offset="0.5" stopColor="#c9ced6" /><stop offset="1" stopColor="#555b65" /></linearGradient></defs>
      {/* gown */}
      <path d="M40 340 Q30 220 74 150 Q100 118 140 112 Q180 118 206 150 Q250 220 240 340Z" fill="url(#dg)" stroke="#2c3038" strokeWidth="2" />
      <path d="M140 112 L108 200 L140 340 L172 200Z" fill="#e4e7ec" stroke="#2c3038" strokeWidth="1.4" />
      <path d="M108 200 Q92 250 96 340 M172 200 Q188 250 184 340 M70 230 Q90 270 96 340 M210 230 Q190 270 184 340" fill="none" stroke="#454b55" strokeWidth="2" opacity={0.7} />
      <path d="M74 150 Q58 220 50 330 M206 150 Q222 220 230 330" fill="none" stroke="#9aa0aa" strokeWidth="3" opacity={0.6} />
      {/* neck, collar */}
      <path d="M120 112 L120 80 Q140 70 160 80 L160 112 Q140 124 120 112Z" fill="#c9a98c" stroke="#2c3038" strokeWidth="1.4" />
      <path d="M108 118 L140 150 L172 118 L160 108 L140 128 L120 108Z" fill="#f2f4f8" stroke="#2c3038" strokeWidth="1.4" />
      {/* stethoscope */}
      <path d="M112 112 Q96 170 120 200 Q132 214 140 232 M168 112 Q184 170 160 200 Q148 214 140 232" fill="none" stroke="#14171d" strokeWidth="5" strokeLinecap="round" />
      <circle cx="140" cy="244" r="13" fill="#9aa3b2" stroke="#14171d" strokeWidth="3" /><circle cx="140" cy="244" r="6" fill="#14171d" />
      <path d="M150 72 Q150 40 140 30" stroke="#14171d" strokeWidth="0" />
    </svg>
  );
}

/* ---------- surgeons in blue scrubs ---------- */
function Surgeon({ x, y, s, hue }: { x: number; y: number; s: number; hue: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 220 Q-74 150 -30 128 L30 128 Q74 150 70 220Z" fill={hue} stroke="#0a2438" strokeWidth="2" />
      <path d="M-20 128 L0 170 L20 128" fill="#8cc4e6" stroke="#0a2438" strokeWidth="1.5" />
      <ellipse cx="0" cy="88" rx="34" ry="40" fill="#cfe6f6" stroke="#0a2438" strokeWidth="2" />
      <path d="M-36 80 Q-36 40 0 36 Q36 40 36 80 Q20 64 0 66 Q-20 64 -36 80Z" fill={hue} stroke="#0a2438" strokeWidth="2" />
      <path d="M-30 96 Q0 128 30 96 L26 120 Q0 140 -26 120Z" fill="#7fb8dc" stroke="#0a2438" strokeWidth="1.6" />
      <g stroke="#0a2438" strokeWidth="2.4" fill="none" strokeLinecap="round"><path d="M-22 88 q8 -5 14 0 M8 88 q8 -5 14 0" /></g>
      <ellipse cx="-14" cy="90" rx="3" ry="2" fill="#0a2438" /><ellipse cx="14" cy="90" rx="3" ry="2" fill="#0a2438" />
    </g>
  );
}
export function Surgeons() {
  return (
    <svg viewBox="0 0 460 400" preserveAspectRatio="xMidYMax meet">
      <defs><radialGradient id="sgb"><stop offset="0" stopColor="#3a86b8" /><stop offset="1" stopColor="#0d2f4c" /></radialGradient></defs>
      <rect width="460" height="400" fill="url(#sgb)" opacity={0.0} />
      <Surgeon x={120} y={160} s={1.25} hue="#2f77ad" /><Surgeon x={320} y={150} s={1.3} hue="#2a6aa0" /><Surgeon x={230} y={210} s={1.1} hue="#3a86be" />
    </svg>
  );
}

/* ---------- blue brain illustrations ---------- */
export function BlueBrains() {
  const r = rng(5);
  const brain = (x: number, y: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y})`}>
      <path d="M8 40 Q4 14 32 8 Q56 2 66 22 Q78 34 64 52 Q50 66 30 60 Q10 60 8 40Z" fill="#245c88" stroke="#7fb8e0" strokeWidth="1.6" />
      {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M${14 + r() * 50} ${14 + r() * 40} q${r() * 14 - 7} ${r() * 12 - 6} ${r() * 14 - 7} ${r() * 12 - 6}`} stroke="#9fd0f0" strokeWidth="1.1" fill="none" opacity={0.85} />)}
      <path d="M46 56 L52 72 L40 72Z" fill="#245c88" stroke="#7fb8e0" strokeWidth="1.2" />
    </g>
  );
  return (
    <svg viewBox="0 0 170 240" preserveAspectRatio="xMidYMid meet">
      <rect width="170" height="240" fill="#050a12" />
      {[0, 1, 2].flatMap((row) => [0, 1].map((col) => brain(6 + col * 82, 6 + row * 78, row * 2 + col)))}
    </svg>
  );
}

/* ---------- bone diagrams strip ---------- */
export function BoneStrip() {
  const bone = (x: number, y: number, len: number, rot: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot})`} fill="none" stroke="#c9d3e0" strokeWidth="2">
      <path d={`M0 -4 Q${len / 2} -9 ${len} -4 M0 4 Q${len / 2} 9 ${len} 4`} /><circle cx="0" cy="-5" r="5" /><circle cx="0" cy="5" r="5" /><circle cx={len} cy="-5" r="5" /><circle cx={len} cy="5" r="5" />
    </g>
  );
  return (
    <svg viewBox="0 0 1000 110" preserveAspectRatio="xMidYMid slice">
      <rect width="1000" height="110" fill="#070d18" />
      {/* hand fan */}
      {Array.from({ length: 5 }, (_, i) => bone(70, 60, 60 + (i % 3) * 14, -70 + i * 28, i))}
      {/* spine curve */}
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={230 + Math.sin(i / 3) * 8} y={10 + i * 6} width="22" height="5" rx="2" fill="none" stroke="#c9d3e0" strokeWidth="1.6" />)}
      {/* long bones */}
      {Array.from({ length: 4 }, (_, i) => bone(330 + i * 6, 20 + i * 22, 190 - i * 18, 4 - i * 3, 100 + i))}
      {/* foot + pelvis */}
      <path d="M600 30 Q650 20 700 40 Q720 70 690 84 Q640 94 604 78Z" fill="none" stroke="#c9d3e0" strokeWidth="2" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${620 + i * 11} ${40 + Math.sin(i) * 6} v26`} stroke="#c9d3e0" strokeWidth="2" />)}
      <path d="M760 20 Q830 -4 880 26 Q900 60 870 84 Q820 104 770 80 Q744 54 760 20Z" fill="none" stroke="#c9d3e0" strokeWidth="2" /><ellipse cx="826" cy="54" rx="14" ry="10" fill="none" stroke="#c9d3e0" strokeWidth="1.6" />
      {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={920 + i * 14} cy={30 + (i % 2) * 30} r="7" fill="none" stroke="#c9d3e0" strokeWidth="1.8" />)}
    </svg>
  );
}

/* ---------- grey organ plate ---------- */
export function OrganPlate() {
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
      <defs>{grain("opg")}<linearGradient id="opp" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#6c727c" /><stop offset="1" stopColor="#3f444c" /></linearGradient></defs>
      <rect width="300" height="300" fill="url(#opp)" /><rect width="300" height="300" filter="url(#opg)" opacity={0.7} />
      <rect x="8" y="8" width="284" height="284" fill="none" stroke="#d2d6dc" strokeWidth="1.4" opacity={0.7} />
      <path d="M140 60 L160 60 L160 140 L140 140Z" fill="#aab0ba" stroke="#20242b" strokeWidth="2" />
      <path d="M140 110 Q70 70 56 150 Q54 220 106 232 Q140 236 140 160Z M160 110 Q230 70 244 150 Q246 220 194 232 Q160 236 160 160Z" fill="#b8bec8" stroke="#20242b" strokeWidth="2.4" />
      <path d="M96 130 q10 40 0 80 M120 128 q8 40 -4 84 M204 130 q-10 40 0 80 M180 128 q-8 40 4 84" fill="none" stroke="#6e747e" strokeWidth="1.6" />
      <path d="M130 170 Q150 150 172 172 Q170 214 150 226 Q128 210 130 170Z" fill="#8d939d" stroke="#20242b" strokeWidth="2" />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x="22" y={248 + i * 8} width={150 + (i % 2) * 50} height="2" fill="#e0e3e8" opacity={0.6} />)}
    </svg>
  );
}


/* ---------- MRI control-room console: monitors with sagittal / axial / coronal scans + keyboard ---------- */
export function Console() {
  const pane = (x: number, k: number) => (
    <g key={k}>
      <rect x={x} y="96" width="96" height="104" fill="#06090f" stroke="#2f6f4a" strokeWidth="1" />
      <ellipse cx={x + 48} cy="150" rx="32" ry="40" fill="#8c95a3" stroke="#d3d9e2" strokeWidth="2.4" />
      <ellipse cx={x + 48} cy="150" rx="25" ry="33" fill="#aab2bf" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${x + 28 + i * 6} ${128 + (i % 3) * 8} q6 14 ${(i % 2 ? -4 : 4)} 34`} stroke="#2b3340" strokeWidth="1.6" fill="none" />)}
      <path d={`M${x + 48} 138 q-10 8 0 22 q10 -14 0 -22`} fill="#10151d" />
      <rect x={x + 6} y="102" width="84" height="92" fill="none" stroke="#38d27a" strokeWidth="0.8" opacity={0.6} />
    </g>
  );
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
      <rect x="40" y="6" width="84" height="64" rx="4" fill="#0d1117" stroke="#3a4252" strokeWidth="2" /><rect x="46" y="12" width="72" height="52" fill="#9fb8cc" opacity={0.75} />
      <rect x="130" y="40" width="70" height="52" rx="4" fill="#0d1117" stroke="#3a4252" strokeWidth="2" /><rect x="135" y="45" width="60" height="42" fill="#3a5a86" opacity={0.7} />
      <rect x="126" y="60" width="5" height="48" fill="#566073" />
      <rect x="12" y="84" width="276" height="150" rx="6" fill="#0b0e14" stroke="#4a5364" strokeWidth="3" />
      <rect x="20" y="92" width="260" height="134" fill="#05080d" />
      <rect x="22" y="94" width="54" height="130" fill="#0d1a2c" stroke="#25405e" /><rect x="28" y="102" width="42" height="8" fill="#2f7fd0" opacity={0.8} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="28" y={118 + i * 12} width={30 + (i % 3) * 6} height="4" fill="#5a7aa0" opacity={0.7} />)}
      {pane(80, 0)}{pane(180, 1)}
      <rect x="20" y="204" width="260" height="22" fill="#0d1a2c" stroke="#25405e" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={28 + i * 40} y="210" width="32" height="9" rx="2" fill="#244b78" />)}
      <path d="M130 234 L170 234 L184 258 L116 258Z" fill="#1b212b" stroke="#3a4252" strokeWidth="2" />
      <path d="M20 262 L280 262 L296 296 L4 296Z" fill="#12161d" stroke="#4a5364" strokeWidth="2.4" />
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 16 }, (_, c) => <rect key={r * 16 + c} x={16 + c * 16 + r * 4} y={268 + r * 9} width="12" height="6" rx="1.5" fill="#2c3340" />))}
    </svg>
  );
}

export const ART: Record<string, () => ReactElement> = { chart: MuscleChart, skeleton: Skeleton, heart: HeartPlate, book: AnatomyBook, doctor: Doctor, surgeons: Surgeons, blue: BlueBrains, bones: BoneStrip, organs: OrganPlate, console: Console };
