"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectModalStore } from "@/lib/projectModalStore";

const TITANIUM = new THREE.Color("#3a3f45");
const AMBER = new THREE.Color("#FFB800");

// Deterministic pseudo-random in [0,1) — pure (same output every call with
// the same seed), unlike Math.random(), so it's safe to call during render.
function hashRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

/** A benzene-ring-style molecular diagram: N "atoms" evenly spaced on a
 *  ring, each bonded to its neighbors. */
function MolecularRing({ position, radius = 0.35, count = 6, color = "#00F0FF" }: { position: [number, number, number]; radius?: number; count?: number; color?: string }) {
  const { atoms, bondPositions } = useMemo(() => {
    const pts = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    });
    const positions = new Float32Array(count * 2 * 3);
    for (let i = 0; i < count; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % count];
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    }
    return { atoms: pts, bondPositions: positions };
  }, [count, radius]);

  return (
    <group position={position}>
      {atoms.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.25} metalness={0.7} />
        </mesh>
      ))}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bondPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.45} />
      </lineSegments>
    </group>
  );
}

/** Point-cloud bust — a rough head/cortical-scan silhouette built from
 *  points sampled inside an ellipsoid with a little surface jitter, not a
 *  real scan: a stand-in for "neural/cortical scan" visual texture. */
function CorticalBust({ position }: { position: [number, number, number] }) {
  const COUNT = 900;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    let i = 0;
    let guard = 0;
    while (i < COUNT && guard < COUNT * 20) {
      guard++;
      // sample inside a unit sphere, then squash into a head-ish ellipsoid
      const v = new THREE.Vector3(
        hashRandom(guard * 3 + 0.17) * 2 - 1,
        hashRandom(guard * 3 + 1.31) * 2 - 1,
        hashRandom(guard * 3 + 2.59) * 2 - 1
      );
      if (v.lengthSq() > 1) continue;
      // keep only a shell (surface-ish) for a scan-line look
      if (v.length() < 0.82) continue;
      const x = v.x * 0.42;
      const y = v.y * 0.5 + 0.1;
      const z = v.z * 0.4;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
      i++;
    }
    return arr.slice(0, i * 3);
  }, []);

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00F0FF" size={0.018} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/** Scene 2 centerpiece: procedural double-helix DNA strand, thermal-
 *  morphing from a dark titanium backbone into molten-amber hydrogen
 *  bonds (a travelling heat pulse along the strand, not a real thermal
 *  simulation), paired with a point-cloud cortical bust and two
 *  molecular ring diagrams. */
export function BioEngineeringScene() {
  const helixRef = useRef<THREE.Group>(null);
  const bondMatRefs = useRef<Map<number, THREE.LineBasicMaterial>>(new Map());
  const openProject = useProjectModalStore((s) => s.openProject);

  const handleNodeClick = (id: "bio-biosensor" | "bio-docking") => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    openProject(id, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
    const t = state.clock.getElapsedTime();
    bondMatRefs.current.forEach((mat, i) => {
      // a thermal pulse travels along the strand over time
      const phase = 0.5 + 0.5 * Math.sin(t * 1.2 - i * 0.35);
      mat.color.copy(TITANIUM).lerp(AMBER, phase);
    });
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
    <group ref={helixRef} position={[8, 0.5, -8]}>
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
          {/* Hydrogen Bond Bridge — thermal-morphing titanium -> amber */}
          <line>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(m) => {
                if (m) bondMatRefs.current.set(i, m);
              }}
              color="#3a3f45"
              transparent
              opacity={0.7}
            />
          </line>
        </group>
      ))}

      <CorticalBust position={[1.6, 2.8, 0.4]} />
      <MolecularRing position={[-0.9, -3.2, 0.3]} color="#FF5E00" />
      <MolecularRing position={[-0.6, 3.6, -0.3]} radius={0.28} count={5} color="#00F0FF" />
    </group>
  );
}
