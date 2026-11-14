"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectModalStore, type ProjectId } from "@/lib/projectModalStore";

const PANEL_PROJECTS: ProjectId[] = ["ops-mailchimp", "ops-excel"];

/** Draws a preview (KPI bar chart or campaign stats) onto an offscreen 2D
 *  canvas and returns it as a texture. A pure-WebGL canvas texture, not a
 *  drei <Html> DOM portal: this scene (SceneRoot) can be unmounted at any
 *  time the Second Brain graph opens, and an Html portal's imperative
 *  per-frame DOM work raced with that unmount (confirmed via a
 *  removeChild DOMException + "synchronously unmount a root while
 *  rendering" warnings) regardless of prop tuning (occlude on/off) or
 *  staggering the unmount by a frame — baking the preview into a texture
 *  sidesteps the whole class of bug. */
function createPreviewTexture(kind: "mailchimp" | "excel"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#061018";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#9fe8ff";
  ctx.font = "12px monospace";

  if (kind === "excel") {
    ctx.fillText("KPI DASHBOARD // LIVE", 12, 20);
    const bars = [60, 85, 40, 95, 70];
    const barWidth = 28;
    bars.forEach((h, i) => {
      const barHeight = (h / 100) * 90;
      ctx.fillStyle = "#00F0FF";
      ctx.fillRect(16 + i * (barWidth + 8), 140 - barHeight, barWidth, barHeight);
    });
  } else {
    ctx.fillText("CAMPAIGN // AUTOMATED", 12, 20);
    ctx.font = "14px monospace";
    ctx.fillText("Open rate: 42.8%", 12, 60);
    ctx.fillText("Click rate: 11.3%", 12, 86);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function PanelPreview({ kind }: { kind: "mailchimp" | "excel" }) {
  const texture = useMemo(() => createPreviewTexture(kind), [kind]);
  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[1.2, 0.75]} />
      <meshBasicMaterial map={texture} transparent opacity={0.95} toneMapped={false} />
    </mesh>
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
