"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Scene 3 centerpiece: 360° curved cylindrical command arena. */
export function OperationsArenaScene() {
  const arenaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arenaRef.current) {
      arenaRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={arenaRef} position={[0, -2, 0]}>
      {/* Curved Cylindrical Data Panels */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <planeGeometry args={[1.4, 0.9]} />
            <meshStandardMaterial
              color="#030508"
              emissive="#00F0FF"
              emissiveIntensity={0.15}
              roughness={0.3}
              metalness={0.8}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
