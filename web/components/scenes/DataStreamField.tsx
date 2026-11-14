"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLUMNS = 36;
const PER_COLUMN = 14;
const COUNT = COLUMNS * PER_COLUMN;

// A deterministic pseudo-random generator (same technique used in
// BioEngineeringScene's point-cloud bust) — pure, so it's safe to call
// during render/useMemo instead of Math.random().
function hashRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

const VERTEX_SHADER = `
  uniform float uTime;
  attribute float aColumnSeed;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aSize;
  varying float vFade;

  void main() {
    // each point cycles upward through a fixed height range, wrapping
    // around — a column is really one looping stream, not PER_COLUMN
    // separate static points.
    float cycle = fract(aOffset + uTime * aSpeed);
    vec3 pos = position;
    pos.y = mix(-9.0, 9.0, cycle);

    // brighter near the leading (top) edge of the stream, fading out
    // as it wraps back to the bottom — gives the "falling/rising code"
    // trail look without any texture.
    vFade = smoothstep(0.0, 0.15, cycle) * smoothstep(1.0, 0.75, cycle);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (80.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vFade;

  void main() {
    // soft round sprite via distance from the point's center — no
    // texture needed, cheap and tiny bundle-wise.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    float alpha = smoothstep(0.5, 0.0, d) * vFade;
    if (alpha < 0.01) discard;
    vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vFade));
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Procedural "data stream" / telemetry-feed particle field: THREE.Points
 * with a custom vertex+fragment shader, flowing continuously upward in
 * loose vertical columns. Deliberately not literal matrix "characters"
 * (that needs a font/glyph atlas — a texture file, which this component
 * is specifically avoiding) — it's glowing streak-points with a fading
 * trail, which reads as a telemetry/code-stream aesthetic while staying
 * 100% procedural (geometry + math only, zero textures, zero external
 * assets).
 */
export default function DataStreamField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const columnSeeds = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);

    let i = 0;
    for (let c = 0; c < COLUMNS; c++) {
      const colSeed = hashRandom(c * 7.13);
      const x = (hashRandom(c * 3.7 + 1.1) - 0.5) * 34;
      const z = (hashRandom(c * 5.2 + 2.3) - 0.5) * 26 - 6;
      for (let j = 0; j < PER_COLUMN; j++) {
        const seed = c * PER_COLUMN + j;
        positions[i * 3] = x + (hashRandom(seed + 0.31) - 0.5) * 0.3;
        positions[i * 3 + 1] = 0; // overwritten every frame in the vertex shader
        positions[i * 3 + 2] = z;
        columnSeeds[i] = colSeed;
        speeds[i] = 0.05 + hashRandom(seed + 9.4) * 0.05;
        offsets[i] = j / PER_COLUMN + hashRandom(seed + 2.2) * 0.05;
        sizes[i] = 1.4 + hashRandom(seed + 5.8) * 1.6;
        i++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColumnSeed", new THREE.BufferAttribute(columnSeeds, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#00F0FF") },
      uColorB: { value: new THREE.Color("#FFB800") },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={-900} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
