"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";

const PANEL_PROJECTS: ProjectId[] = ["ops-mailchimp", "ops-excel"];

/** Scene 3 centerpiece: 360° curved cylindrical command arena. */
export function OperationsArenaScene() {
  const arenaRef = useRef<THREE.Group>(null);
  const openProject = useProjectModalStore((s) => s.openProject);

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

        const projectId = PANEL_PROJECTS[i % PANEL_PROJECTS.length];
        const handleClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          openProject(projectId, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
        };

        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]} onClick={handleClick}>
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
