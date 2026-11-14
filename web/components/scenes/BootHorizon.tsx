"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Scene 0 centerpiece: a dark infinite grid horizon the camera pitches
 * down through on scroll (driven externally via the group's rotation,
 * passed in as `pitch`, 0..1). Amber/cyan dual-tone grid, glowing toward
 * the vanishing point. */
export default function BootHorizon({ pitch }: { pitch: React.MutableRefObject<number> }) {
  const grid = useRef<THREE.GridHelper>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    // 0 => looking at horizon; 1 => pitched down, diving through the grid
    group.current.rotation.x = THREE.MathUtils.lerp(0, -0.9, pitch.current);
    group.current.position.z = THREE.MathUtils.lerp(0, 14, pitch.current);
  });

  return (
    <group ref={group} position={[0, -1.1, -4]}>
      <gridHelper ref={grid} args={[80, 60, "#00f0ff", "#ff8a3d"]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial color="#030508" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
