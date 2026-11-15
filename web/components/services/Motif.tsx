"use client";

import type { Motif as MotifKind } from "@/lib/services";

/**
 * Animated SVG motif floating beside a dossier. SVG rather than a second R3F
 * canvas on purpose: the site already runs one persistent WebGL context, and a
 * second canvas mounting/unmounting alongside it is what caused the earlier
 * removeChild crash. Same visual language (nodes, lines, base pairs), zero GPU cost.
 */
export default function Motif({ kind, color }: { kind: MotifKind; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.4 } as const;
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full" role="img" aria-label={`${kind} motif`}>
      <style>{`
        @keyframes sn-pulse{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes sn-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes sn-spin{to{transform:rotate(360deg)}}
        @keyframes sn-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
        @keyframes sn-wave{to{stroke-dashoffset:-60}}
        @media (prefers-reduced-motion: reduce){svg *{animation:none!important}}
      `}</style>
      {kind === "neural" && (
        <g>
          {[0, 1, 2].map((l) =>
            [0, 1, 2, 3].map((n) =>
              [0, 1, 2, 3].map((m) =>
                l < 2 ? <line key={`${l}${n}${m}`} x1={40 + l * 80} y1={50 + n * 46} x2={120 + l * 80} y2={50 + m * 46} {...common} opacity={0.25} /> : null
              )
            )
          )}
          {[0, 1, 2].map((l) =>
            [0, 1, 2, 3].map((n) => (
              <circle key={`n${l}${n}`} cx={40 + l * 80} cy={50 + n * 46} r={7} fill={color} style={{ animation: `sn-pulse 2.4s ease-in-out ${(l * 4 + n) * 0.17}s infinite` }} />
            ))
          )}
        </g>
      )}
      {kind === "helix" && (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const y = 24 + i * 17, a = Math.sin(i * 0.7) * 56;
            return (
              <g key={i} style={{ animation: `sn-pulse 2.8s ease-in-out ${i * 0.15}s infinite` }}>
                <line x1={120 - a} y1={y} x2={120 + a} y2={y} {...common} opacity={0.5} />
                <circle cx={120 - a} cy={y} r={5} fill={color} />
                <circle cx={120 + a} cy={y} r={5} fill="#19E3F0" />
              </g>
            );
          })}
        </g>
      )}
      {kind === "bars" && (
        <g>
          {[70, 120, 50, 150, 100, 170].map((h, i) => (
            <rect key={i} x={30 + i * 30} y={200 - h} width={18} height={h} fill={color} opacity={0.85} style={{ transformOrigin: `${39 + i * 30}px 200px`, animation: `sn-bar 2.6s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
          <line x1={20} y1={202} x2={220} y2={202} {...common} />
        </g>
      )}
      {kind === "wave" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M10 ${90 + i * 22} Q 40 ${50 + i * 22} 70 ${90 + i * 22} T 130 ${90 + i * 22} T 190 ${90 + i * 22} T 250 ${90 + i * 22}`} {...common} strokeDasharray="14 10" opacity={0.9 - i * 0.18} style={{ animation: `sn-wave ${2 + i * 0.4}s linear infinite` }} />
          ))}
        </g>
      )}
      {kind === "cube" && (
        <g style={{ transformOrigin: "120px 120px", animation: "sn-bob 4s ease-in-out infinite" }}>
          <polygon points="120,40 190,80 120,120 50,80" {...common} />
          <polygon points="50,80 120,120 120,200 50,160" {...common} />
          <polygon points="190,80 120,120 120,200 190,160" {...common} />
          <circle cx="120" cy="120" r="46" {...common} opacity={0.4} strokeDasharray="4 8" style={{ transformOrigin: "120px 120px", animation: "sn-spin 14s linear infinite" }} />
        </g>
      )}
    </svg>
  );
}
