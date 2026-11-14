"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NODES, type GraphCluster } from "@/data/knowledgeGraph";
import { useSecondBrainStore } from "@/lib/secondBrainStore";

const OVERVIEW_POS = new THREE.Vector3(0, -1, 9);
const OVERVIEW_LOOK = new THREE.Vector3(0, -1, 0);

function clusterCentroid(cluster: GraphCluster): THREE.Vector3 {
  const members = NODES.filter((n) => n.cluster === cluster);
  const sum = members.reduce((acc, n) => acc.add(new THREE.Vector3(...n.position)), new THREE.Vector3());
  return sum.divideScalar(members.length || 1);
}

/** Smoothly lerps the Second Brain's own camera toward the focused
 *  cluster's centroid (zoomed in), or back to the full-graph overview
 *  when nothing is focused. Plain per-frame lerp — this is a small,
 *  self-contained view, so GSAP isn't needed here. */
export default function SecondBrainCamera() {
  const { camera } = useThree();
  const cluster = useSecondBrainStore((s) => s.focusedCluster);
  const lookAt = useRef(OVERVIEW_LOOK.clone());

  useFrame(() => {
    let targetPos = OVERVIEW_POS;
    let targetLook = OVERVIEW_LOOK;
    if (cluster) {
      const centroid = clusterCentroid(cluster);
      targetPos = centroid.clone().add(new THREE.Vector3(0, 0.3, 3.2));
      targetLook = centroid;
    }
    camera.position.lerp(targetPos, 0.06);
    lookAt.current.lerp(targetLook, 0.06);
    camera.lookAt(lookAt.current);
  });

  return null;
}
