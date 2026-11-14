"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BackgroundVertexShader, BackgroundFragmentShader } from "@/shaders/BackgroundShader";

/**
 * Layer 1 — cursor-illuminated schematic/atmospheric background.
 * Clip-space full-screen quad (vertex shader bypasses camera matrices),
 * folded into the main SceneRoot canvas rather than a second Canvas/Lenis
 * instance, to avoid duplicate WebGL contexts and competing scroll
 * smoothing.
 */
export default function SchematicLayer() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      uniforms.current.uMouse.value.set(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.getElapsedTime();
    uniforms.current.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh ref={meshRef} renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={BackgroundVertexShader}
        fragmentShader={BackgroundFragmentShader}
        uniforms={uniforms.current}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
