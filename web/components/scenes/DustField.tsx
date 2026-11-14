"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 4000; // trimmed from the spec's 15,000 for a safe first pass on unknown client GPUs; see note in report

type Props = {
  /** ref to a mutable number (scroll velocity) the field reacts to, 0..~3 typical */
  velocity: React.MutableRefObject<number>;
};

export default function DustField({ velocity }: Props) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useRef<Float32Array>(null!);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seedArr = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      seedArr[i] = Math.random();
    }
    seeds.current = seedArr;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#00f0ff"),
        size: 0.025,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const v = THREE.MathUtils.clamp(velocity.current, -4, 4);
    const drift = dt * (0.08 + Math.abs(v) * 0.6);
    for (let i = 0; i < COUNT; i++) {
      const s = seeds.current[i];
      arr[i * 3 + 1] += drift * (0.4 + s * 0.6) * Math.sign(-v || 1);
      arr[i * 3 + 0] += Math.sin(s * 10 + performance.now() * 0.00005) * 0.0015;
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = -12;
      if (arr[i * 3 + 1] < -12) arr[i * 3 + 1] = 12;
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
