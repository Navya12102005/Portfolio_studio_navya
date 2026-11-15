"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { soundFX } from "@/utils/soundManager";

const SESSION_KEY = "studio-navya-summoned";
const AMBER = "#FF5E00";
const CYAN = "#00F0FF";
const EMBERS = 260;
const ARCS = 5;
const ARC_POINTS = 16;
const TARGET = new THREE.Vector3(0, 0.3, -2);

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Tapered blade outline, extruded thin: a sleek plasma-blade silhouette. */
function makeBladeGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.09, 0);
  s.lineTo(-0.15, 1.7);
  s.lineTo(0, 2.55);
  s.lineTo(0.15, 1.7);
  s.lineTo(0.09, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
}

/**
 * One-time cinematic entrance: a Stark-tech plasma blade (no characters)
 * flies in from off-screen over a dark ground plane with rising ember
 * particles, crackling electric arcs, motion-stretch and energy trails,
 * snaps into the centre with a camera recoil and energy pulse, then
 * everything dissolves into the clean minimalist void/domain hub.
 * Plays once per session; Escape or a click skips it.
 */
export default function HeroSummon() {
  const [active, setActive] = useState(false);
  const { camera } = useThree();

  // s is mutated by the GSAP timeline and read every frame
  const s = useRef({ fly: 0, pulse: 0, arc: 0, guard: 0, fade: 1, glow: 0 });
  const prevFly = useRef(0);
  const bladeRef = useRef<THREE.Group>(null);
  const guardL = useRef<THREE.Mesh>(null);
  const guardR = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const trailRefs = useRef<(THREE.Mesh | null)[]>([]);
  const arcClock = useRef(0);
  const emberRef = useRef<THREE.Points>(null);
  const groundMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const bladeGeo = useMemo(() => makeBladeGeometry(), []);
  const emberData = useMemo(() => {
    const pos = new Float32Array(EMBERS * 3);
    const col = new Float32Array(EMBERS * 3);
    const seed = new Float32Array(EMBERS);
    const a = new THREE.Color(AMBER);
    const c = new THREE.Color(CYAN);
    for (let i = 0; i < EMBERS; i++) {
      pos[i * 3] = (hash(i + 1) - 0.5) * 18;
      pos[i * 3 + 1] = -1.5 + hash(i + 7) * 7;
      pos[i * 3 + 2] = -9 + hash(i + 13) * 8;
      seed[i] = hash(i + 29);
      const k = hash(i + 41) > 0.35 ? a : c;
      col.set([k.r, k.g, k.b], i * 3);
    }
    return { pos, col, seed };
  }, []);
  const arcLines = useMemo(
    () => Array.from({ length: ARCS }, (_, i) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ARC_POINTS * 3), 3));
      const m = new THREE.LineBasicMaterial({ color: i % 2 ? CYAN : "#ffffff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const l = new THREE.Line(g, m);
      l.frustumCulled = false;
      return l;
    }),
    []
  );

  // decide whether to play (client-only, once per session)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage blocked: just play it */
    }
    setActive(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!active) return;
    const st = s.current;
    const tl = gsap.timeline({ onComplete: () => setActive(false) });
    tlRef.current = tl;
    const home = camera.position.clone();

    tl.to(st, { glow: 1, duration: 0.5, ease: "power2.out" })
      .to(st, { arc: 1, duration: 0.08, yoyo: true, repeat: 3 }, 0.2)
      .to(st, { fly: 1, duration: 1.15, ease: "expo.in" }, 0.5)
      .add(() => {
        soundFX.playClickLock();
        st.arc = 1;
      }, 1.65)
      // impact: pulse ring, guard plates unfold, arc surge
      .to(st, { arc: 0, duration: 0.7, ease: "power2.out" }, 1.68)
      .to(st, { pulse: 1, duration: 1.0, ease: "power2.out" }, 1.65)
      .to(st, { guard: 1, duration: 0.5, ease: "back.out(2)" }, 1.65)
      // camera recoil, then settle back to the home framing
      .to(camera.position, { z: home.z + 0.7, y: home.y + 0.12, duration: 0.14, ease: "power3.out" }, 1.65)
      .to(camera.position, { z: home.z, y: home.y, duration: 1.1, ease: "elastic.out(1,0.5)" }, 1.79)
      // dissolve into the clean hub
      .to(st, { fade: 0, duration: 1.3, ease: "power2.inOut" }, 3.3);

    const skip = () => tl.progress(1);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", skip);
      tl.kill();
      camera.position.copy(home);
    };
  }, [active, camera]);

  useFrame((state, dt) => {
    if (!active) return;
    const st = s.current;
    const t = state.clock.getElapsedTime();
    const blade = bladeRef.current;

    // flight path: off-screen top-left, curving down into the centre
    if (blade) {
      const f = st.fly;
      const speed = Math.max((f - prevFly.current) / Math.max(dt, 0.001), 0);
      prevFly.current = f;
      const e = f * f;
      blade.position.set(
        THREE.MathUtils.lerp(-16, TARGET.x, f),
        THREE.MathUtils.lerp(9, TARGET.y, f) + Math.sin(f * Math.PI) * 1.2,
        THREE.MathUtils.lerp(4, TARGET.z, f)
      );
      blade.rotation.set(0, (1 - f) * 9, THREE.MathUtils.lerp(-2.4, 0.18, f) + (1 - e) * 0.6);
      const stretch = 1 + Math.min(speed * 0.35, 2.2) * (f < 0.99 ? 1 : 0);
      blade.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
      const vis = f > 0.001 ? 1 : 0;
      blade.visible = vis === 1;
      const fadeScale = st.fade;
      blade.scale.multiplyScalar(fadeScale);
      blade.position.y += (1 - fadeScale) * 1.5;
      // idle hover once locked
      if (f >= 1) blade.position.y += Math.sin(t * 2.2) * 0.04 * fadeScale;
    }
    if (guardL.current && guardR.current) {
      guardL.current.rotation.z = -0.15 - st.guard * 0.7;
      guardR.current.rotation.z = 0.15 + st.guard * 0.7;
    }
    // energy trails: stretched additive streaks behind the blade while it flies
    trailRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, Math.min(1, Math.sin(st.fly * Math.PI) * 1.4)) * 0.55 * st.fade * (1 - i * 0.2);
    });
    if (pulseRef.current) {
      const m = pulseRef.current.material as THREE.MeshBasicMaterial;
      const p = st.pulse;
      pulseRef.current.scale.setScalar(0.2 + p * 7);
      m.opacity = p > 0 && p < 1 ? (1 - p) * 0.9 : 0;
    }
    // lightning: re-roll jagged paths ~25x/sec while arc intensity is up
    arcClock.current += dt;
    const reroll = arcClock.current > 0.04;
    if (reroll) arcClock.current = 0;
    arcLines.forEach((line, i) => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = st.arc * st.fade * (0.6 + 0.4 * hash(i + Math.floor(t * 25)));
      if (!reroll || st.arc < 0.02) return;
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      const from = new THREE.Vector3((Math.random() - 0.5) * 14, 4 + Math.random() * 2, -3 - Math.random() * 3);
      const to = blade ? blade.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2, 0)) : TARGET.clone();
      for (let k = 0; k < ARC_POINTS; k++) {
        const u = k / (ARC_POINTS - 1);
        const j = k === 0 || k === ARC_POINTS - 1 ? 0 : 0.5;
        attr.setXYZ(
          k,
          THREE.MathUtils.lerp(from.x, to.x, u) + (Math.random() - 0.5) * j,
          THREE.MathUtils.lerp(from.y, to.y, u) + (Math.random() - 0.5) * j,
          THREE.MathUtils.lerp(from.z, to.z, u) + (Math.random() - 0.5) * j
        );
      }
      attr.needsUpdate = true;
    });
    // embers drift upward, wrap around
    if (emberRef.current) {
      const attr = emberRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < EMBERS; i++) {
        let y = attr.getY(i) + dt * (0.5 + emberData.seed[i] * 1.2);
        if (y > 5.5) y = -1.5;
        attr.setY(i, y);
        attr.setX(i, attr.getX(i) + Math.sin(t * 0.8 + emberData.seed[i] * 20) * 0.002);
      }
      attr.needsUpdate = true;
      (emberRef.current.material as THREE.PointsMaterial).opacity = 0.9 * st.fade * Math.min(st.glow, 1);
    }
    if (groundMat.current) groundMat.current.opacity = st.fade * st.glow;
    if (ringMat.current) ringMat.current.opacity = 0.5 * st.fade * st.glow;
  });

  if (!active) return null;

  return (
    <group>
      {/* dark carbon ground plane + faint molten ring (entrance only) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, -4]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial ref={groundMat} color="#05080d" metalness={0.85} roughness={0.35} transparent opacity={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.59, -2]}>
        <ringGeometry args={[2.3, 2.38, 96]} />
        <meshBasicMaterial ref={ringMat} color={AMBER} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <points ref={emberRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[emberData.col, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} vertexColors transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {arcLines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      <pointLight position={[0, 0.3, -1]} color={AMBER} intensity={3} distance={9} />

      {/* the weapon: tapered plasma blade, glowing core, split guard plates, hilt */}
      <group ref={bladeRef} visible={false}>
        <mesh geometry={bladeGeo} position={[0, 0, -0.025]}>
          <meshStandardMaterial color="#10161d" metalness={0.95} roughness={0.2} emissive={AMBER} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[0.035, 2.5, 0.07]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh ref={guardL} position={[-0.22, -0.05, 0]} rotation-z={-0.15}>
          <boxGeometry args={[0.38, 0.09, 0.14]} />
          <meshStandardMaterial color="#1a222b" metalness={0.9} roughness={0.25} emissive={CYAN} emissiveIntensity={0.4} />
        </mesh>
        <mesh ref={guardR} position={[0.22, -0.05, 0]} rotation-z={0.15}>
          <boxGeometry args={[0.38, 0.09, 0.14]} />
          <meshStandardMaterial color="#1a222b" metalness={0.9} roughness={0.25} emissive={CYAN} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.8, 16]} />
          <meshStandardMaterial color="#0c1117" metalness={0.9} roughness={0.4} />
        </mesh>
        {[-0.25, -0.5, -0.75].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.075, 0.012, 8, 20]} />
            <meshBasicMaterial color={AMBER} toneMapped={false} />
          </mesh>
        ))}
        {/* energy trails behind the blade while it flies */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(m) => { trailRefs.current[i] = m; }} position={[(i - 1) * 0.12, -2.2 - i * 0.5, 0]}>
            <planeGeometry args={[0.1 - i * 0.02, 4 + i]} />
            <meshBasicMaterial color={i === 1 ? CYAN : AMBER} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* energy pulse ring at the lock point */}
      <mesh ref={pulseRef} position={TARGET}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}
