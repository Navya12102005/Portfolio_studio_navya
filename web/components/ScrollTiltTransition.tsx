"use client";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-driven 3D tilt: a tall track with a sticky viewport; the child tilts, zooms and drifts as you scroll
 * through it. Keep the child shorter than the viewport (the sticky frame clips overflow). Under
 * prefers-reduced-motion it renders the child flat, with no scroll runway.
 */
export default function ScrollTiltTransition({ children, bg = "#0A0A0A" }: { children: ReactNode; bg?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [18, 5, -5, -18]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [-12, 0, 12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.08, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);

  if (reduce) return <div className="w-full py-24 flex justify-center" style={{ background: bg }}><div className="w-[90vw] max-w-7xl">{children}</div></div>;

  return (
    <div ref={ref} className="relative w-full h-[250vh] overflow-clip" style={{ background: bg }}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden [perspective:1400px]">
        <motion.div style={{ rotateX, rotateY, scale, y, transformStyle: "preserve-3d" }} className="w-[90vw] max-w-7xl">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
