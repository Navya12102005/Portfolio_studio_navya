"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/** Global smooth-scroll driver. Exposes current scroll velocity on a ref so
 * 3D layers (dust field, parallax) can react without re-rendering React. */
export function useLenis() {
  const velocity = useRef(0);
  const progress = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
    });

    lenis.on("scroll", (e: { velocity: number; progress: number }) => {
      velocity.current = e.velocity;
      progress.current = e.progress;
    });

    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return { velocity, progress };
}
