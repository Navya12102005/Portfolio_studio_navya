"use client";

import { useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectModalStore } from "@/lib/projectModalStore";

const EMERALD = new THREE.Color("#00FF88");
const AMBER = new THREE.Color("#FF5E00");

/** Scene 1 centerpiece: gyroscopic wireframe rings around an "optical
 *  palm core" that shifts emerald -> amber as the cursor approaches it
 *  on screen (projected distance from the core's screen-space position
 *  to the live NDC pointer, not a 3D raycast — cheap and correct for a
 *  mostly-static core). */
export function TechScene() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreGlowRef = useRef<THREE.PointLight>(null);
  const proximity = useRef(0);
  const { camera, pointer } = useThree();
  const openProject = useProjectModalStore((s) => s.openProject);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.x = t * 0.4;
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * 0.3;
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.25;

    if (groupRef.current) {
      const corePos = groupRef.current.getWorldPosition(new THREE.Vector3());
      const screenPos = corePos.clone().project(camera);
      const dist = Math.hypot(screenPos.x - pointer.x, screenPos.y - pointer.y);
      const target = THREE.MathUtils.clamp(1 - dist / 0.6, 0, 1);
      proximity.current = THREE.MathUtils.lerp(proximity.current, target, 0.08);
    }

    if (coreMatRef.current) {
      const color = EMERALD.clone().lerp(AMBER, proximity.current);
      coreMatRef.current.color.copy(color);
      coreMatRef.current.emissive.copy(color);
      coreMatRef.current.emissiveIntensity = 0.6 + proximity.current * 0.8;
    }
    if (coreGlowRef.current) {
      coreGlowRef.current.color.copy(EMERALD.clone().lerp(AMBER, proximity.current));
      coreGlowRef.current.intensity = 1.5 + proximity.current * 2;
    }
  });

  const handleCoreClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    openProject("tech-novicord", { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };

  return (
    <group ref={groupRef} position={[-3, 0, 0]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.1, 0.015, 8, 64]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.85, 0.012, 8, 64]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.4} roughness={0.3} metalness={0.7} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.35, 0.01, 8, 64]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.3} roughness={0.3} metalness={0.7} transparent opacity={0.5} />
      </mesh>

      <pointLight ref={coreGlowRef} position={[0, 0, 0]} distance={3} intensity={1.5} color="#00FF88" />
      <mesh onClick={handleCoreClick}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial ref={coreMatRef} color="#00FF88" emissive="#00FF88" emissiveIntensity={0.6} roughness={0.15} metalness={0.85} wireframe />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#030508" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}
