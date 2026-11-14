"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectModalStore } from "@/lib/projectModalStore";

/** Scene 2 centerpiece: procedural double-helix DNA strand. */
export function BioEngineeringScene() {
  const helixRef = useRef<THREE.Group>(null);
  const openProject = useProjectModalStore((s) => s.openProject);

  const handleNodeClick = (id: "bio-biosensor" | "bio-docking") => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    openProject(id, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  const rungs = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const y = (i - 10) * 0.3;
      const angle = i * 0.5;
      const x1 = Math.cos(angle) * 0.8;
      const z1 = Math.sin(angle) * 0.8;
      const x2 = Math.cos(angle + Math.PI) * 0.8;
      const z2 = Math.sin(angle + Math.PI) * 0.8;
      // Flat Float32Array of the two endpoints — the correct way to feed a
      // <line> geometry in R3F (attribute-based, not spreading a
      // constructed BufferGeometry instance as JSX props).
      const positions = new Float32Array([x1, y, z1, x2, y, z2]);
      return { i, y, x1, z1, x2, z2, positions };
    });
  }, []);

  return (
    <group ref={helixRef} position={[2, 0, 0]}>
      {/* Double Helix Simulation Backbone */}
      {rungs.map(({ i, y, x1, z1, x2, z2, positions }) => (
        <group key={i}>
          {/* Strand Nodes — each is a clickable domain node opening its case study */}
          <mesh position={[x1, y, z1]} onClick={handleNodeClick("bio-biosensor")}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#00F0FF" roughness={0.2} metalness={0.8} emissive="#00F0FF" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[x2, y, z2]} onClick={handleNodeClick("bio-docking")}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#FF5E00" roughness={0.2} metalness={0.8} emissive="#FF5E00" emissiveIntensity={0.8} />
          </mesh>
          {/* Hydrogen Bond Bridge */}
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#FFB800" transparent opacity={0.6} />
          </line>
        </group>
      ))}
    </group>
  );
}
