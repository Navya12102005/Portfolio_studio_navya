"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { NODES, EDGES, CLUSTER_COLOR, type GraphCluster } from "@/data/knowledgeGraph";
import { useSecondBrainStore } from "@/lib/secondBrainStore";

const nodeById = new Map(NODES.map((n) => [n.id, n]));

function buildAdjacency() {
  const map = new Map<string, Set<string>>();
  for (const id of nodeById.keys()) map.set(id, new Set());
  for (const [a, b] of EDGES) {
    map.get(a)?.add(b);
    map.get(b)?.add(a);
  }
  return map;
}
const ADJACENCY = buildAdjacency();

function matchesSearch(id: string, q: string): boolean {
  const n = nodeById.get(id);
  if (!n) return false;
  return [n.label, n.methodology, n.cluster, ...n.techStack, ...n.outcomes].join(" ").toLowerCase().includes(q);
}

function isHighlighted(id: string, hovered: string | null, selected: string | null, cluster: GraphCluster | null, search = ""): boolean {
  const q = search.trim().toLowerCase();
  if (q) return matchesSearch(id, q) && (!cluster || nodeById.get(id)?.cluster === cluster);
  const focus = hovered ?? selected;
  if (focus) return focus === id || !!ADJACENCY.get(focus)?.has(id);
  if (cluster) return nodeById.get(id)?.cluster === cluster;
  return true; // nothing focused — everything at full brightness
}

/** Node spheres. Dimming is applied every frame via material opacity lerp
 *  (not React state) so hovering doesn't thrash re-renders. */
function Nodes() {
  const hovered = useSecondBrainStore((s) => s.hoveredNodeId);
  const selected = useSecondBrainStore((s) => s.selectedNodeId);
  const cluster = useSecondBrainStore((s) => s.focusedCluster);
  const search = useSecondBrainStore((s) => s.search);
  const hoverNode = useSecondBrainStore((s) => s.hoverNode);
  const selectNode = useSecondBrainStore((s) => s.selectNode);
  const matRefs = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());

  useFrame(() => {
    for (const n of NODES) {
      const mat = matRefs.current.get(n.id);
      if (!mat) continue;
      const target = isHighlighted(n.id, hovered, selected, cluster, search) ? 1 : 0.12;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.15);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target * 0.9, 0.15);
    }
  });

  return (
    <>
      {NODES.map((n) => (
        <mesh
          key={n.id}
          position={n.position}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            hoverNode(n.id);
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            hoverNode(null);
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            selectNode(selected === n.id ? null : n.id);
          }}
        >
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) matRefs.current.set(n.id, m);
            }}
            color={CLUSTER_COLOR[n.cluster]}
            emissive={CLUSTER_COLOR[n.cluster]}
            emissiveIntensity={0.9}
            roughness={0.25}
            metalness={0.6}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </>
  );
}

/** One synaptic line + a pulse particle travelling along it. */
function Edge({ a, b, index }: { a: string; b: string; index: number }) {
  const nodeA = nodeById.get(a)!;
  const nodeB = nodeById.get(b)!;
  const hovered = useSecondBrainStore((s) => s.hoveredNodeId);
  const selected = useSecondBrainStore((s) => s.selectedNodeId);
  const cluster = useSecondBrainStore((s) => s.focusedCluster);
  const search = useSecondBrainStore((s) => s.search);

  const positions = useMemo(
    () => new Float32Array([...nodeA.position, ...nodeB.position]),
    [nodeA, nodeB]
  );
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulseMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const crossCluster = nodeA.cluster !== nodeB.cluster;

  useFrame((state) => {
    const active = isHighlighted(a, hovered, selected, cluster, search) && isHighlighted(b, hovered, selected, cluster, search);
    const targetOpacity = active ? (crossCluster ? 0.55 : 0.3) : 0.03;
    if (lineMatRef.current) lineMatRef.current.opacity = THREE.MathUtils.lerp(lineMatRef.current.opacity, targetOpacity, 0.15);
    if (pulseMatRef.current) pulseMatRef.current.opacity = THREE.MathUtils.lerp(pulseMatRef.current.opacity, active ? 0.9 : 0, 0.15);

    const t = (state.clock.getElapsedTime() * 0.25 + index * 0.17) % 1;
    if (pulseRef.current) {
      pulseRef.current.position.set(
        THREE.MathUtils.lerp(nodeA.position[0], nodeB.position[0], t),
        THREE.MathUtils.lerp(nodeA.position[1], nodeB.position[1], t),
        THREE.MathUtils.lerp(nodeA.position[2], nodeB.position[2], t)
      );
    }
  });

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMatRef} color={crossCluster ? "#ffffff" : CLUSTER_COLOR[nodeA.cluster]} transparent opacity={0.3} />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial ref={pulseMatRef} color={crossCluster ? "#ffffff" : CLUSTER_COLOR[nodeA.cluster]} transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function SecondBrainGraph() {
  return (
    <group>
      <Nodes />
      {EDGES.map(([a, b], i) => (
        <Edge key={`${a}-${b}`} a={a} b={b} index={i} />
      ))}
    </group>
  );
}
