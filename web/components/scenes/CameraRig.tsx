"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { useCameraRigStore, CAMERA_TARGETS } from "@/lib/cameraRigStore";

/**
 * Drives the main camera to a preset domain framing (see CAMERA_TARGETS)
 * whenever useCameraRigStore.focus() is called — e.g. from the J.A.R.V.I.S.
 * boot sequence's quick-action pills ("whip-pan to Bioengineering").
 *
 * GSAP tweens the camera's own `position` (a plain mutable Vector3-like
 * object) and a separate lookAt target vector directly; a useFrame call
 * applies camera.lookAt() every frame so the tween and the look direction
 * stay in sync without fighting R3F's render loop.
 */
export default function CameraRig() {
  const { camera } = useThree();
  const requestId = useCameraRigStore((s) => s.requestId);
  const domain = useCameraRigStore((s) => s.domain);
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const target = CAMERA_TARGETS[domain];
    const tl = gsap.timeline();
    tl.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: 1.4,
      ease: "power3.inOut",
    });
    tl.to(lookAt.current, {
      x: target.lookAt[0],
      y: target.lookAt[1],
      z: target.lookAt[2],
      duration: 1.4,
      ease: "power3.inOut",
    }, 0);
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useFrame(() => {
    camera.lookAt(lookAt.current);
  });

  return null;
}
