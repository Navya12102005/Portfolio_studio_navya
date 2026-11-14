"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";

const PANEL_PROJECTS: ProjectId[] = ["ops-mailchimp", "ops-excel"];

/** A small, non-interactive live-looking preview rendered inside each
 *  panel via drei's <Html> (billboarded DOM content in 3D space) — raw
 *  WebGL text needs a font atlas, so readable preview content goes
 *  through Html instead. pointerEvents="none" so clicks still reach the
 *  panel mesh behind it (which opens the real case study). */
function PanelPreview({ kind }: { kind: "mailchimp" | "excel" }) {
  return (
    <Html transform occlude distanceFactor={2.1} pointerEvents="none" style={{ width: "180px" }}>
      <div className="sn-hud-text select-none" style={{ fontSize: "7px", color: "#9fe8ff", lineHeight: 1.4 }}>
        {kind === "excel" ? (
          <>
            <div style={{ opacity: 0.7, marginBottom: 4 }}>KPI DASHBOARD // LIVE</div>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
              {[60, 85, 40, 95, 70].map((h, i) => (
                <div key={i} style={{ width: 8, height: `${h}%`, background: "#00F0FF", opacity: 0.8 }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ opacity: 0.7, marginBottom: 4 }}>CAMPAIGN // AUTOMATED</div>
            <div>Open rate: 42.8%</div>
            <div>Click rate: 11.3%</div>
          </>
        )}
      </div>
    </Html>
  );
}

/** A small floating glass tile in front of a main panel, bobbing gently. */
function FloatingTile({ basePosition, rotation, index }: { basePosition: THREE.Vector3; rotation: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = basePosition.y + Math.sin(t * 0.8 + index) * 0.08;
  });
  return (
    <mesh ref={ref} position={basePosition} rotation={rotation}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.95}
        thickness={0.2}
        roughness={0.05}
        ior={1.4}
        clearcoat={1}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Scene 3 centerpiece: 360° curved cylindrical glass command arena —
 *  refractive panels (MeshPhysicalMaterial transmission) each showing a
 *  live-looking preview of an automated Excel model or email campaign,
 *  with a small floating glass tile drifting in front of each one. */
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
        const panelRotation: [number, number, number] = [0, -angle + Math.PI / 2, 0];

        const projectId = PANEL_PROJECTS[i % PANEL_PROJECTS.length];
        const previewKind = i % 2 === 0 ? "excel" : "mailchimp";
        const handleClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          openProject(projectId, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
        };

        const tileOffset = new THREE.Vector3(
          x + Math.cos(angle) * 0.25,
          0.6,
          z + Math.sin(angle) * 0.25
        );

        return (
          <group key={i}>
            <mesh position={[x, 0, z]} rotation={panelRotation} onClick={handleClick}>
              <planeGeometry args={[1.4, 0.9]} />
              <meshPhysicalMaterial
                color="#0a1420"
                emissive="#00F0FF"
                emissiveIntensity={0.1}
                roughness={0.08}
                metalness={0.2}
                transmission={0.6}
                thickness={0.4}
                ior={1.45}
                clearcoat={0.8}
                transparent
                opacity={0.92}
                side={THREE.DoubleSide}
              />
              <PanelPreview kind={previewKind} />
            </mesh>
            <FloatingTile basePosition={tileOffset} rotation={panelRotation} index={i} />
          </group>
        );
      })}
    </group>
  );
}
