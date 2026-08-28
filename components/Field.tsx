"use client";

import { useEffect, useRef } from "react";
// Type-only: erased at compile time, so this adds nothing to the bundle. The
// runtime value still comes from the dynamic import inside the effect.
import type * as Three from "three";

/**
 * Decorative WebGL backdrop: a perspective grid receding to a fogged horizon.
 *
 * three.js is imported dynamically inside the effect, so it lands in its own
 * chunk and is never fetched by visitors on prefers-reduced-motion or without
 * WebGL. Nothing here carries content; any failure leaves the canvas at
 * opacity 0 and the page unaffected.
 */
export default function Field() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    } catch {
      return;
    }

    let dispose = () => {};
    let cancelled = false;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      // Fog must match the page surface or the grid fades to the wrong colour
      // instead of receding into the page.
      const BG = 0x0a0a0a;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(innerWidth, innerHeight, false);

      const scene = new THREE.Scene();
      // Fog is what sells the horizon — without it the grid reads as a flat
      // texture rather than receding space.
      scene.fog = new THREE.Fog(BG, 12, 46);

      const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 120);
      camera.position.set(0, 2.4, 10);
      camera.lookAt(0, 1.4, -16);

      const CELL = 2;
      const SIZE = 120;

      const makeGrid = (y: number, colour: number, opacity: number) => {
        const g = new THREE.GridHelper(SIZE, SIZE / CELL, colour, colour);
        const m = g.material as Three.LineBasicMaterial;
        m.transparent = true;
        m.opacity = opacity;
        m.fog = true;
        g.position.y = y;
        return g;
      };

      const floor = makeGrid(0, 0x22c55e, 0.34);
      const ceiling = makeGrid(7.5, 0xef4444, 0.12);
      scene.add(floor, ceiling);

      let px = 0, tx = 0;
      const onPointer = (e: PointerEvent) => {
        tx = (e.clientX / innerWidth - 0.5) * 2;
      };
      const onResize = () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(innerWidth, innerHeight, false);
      };

      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("resize", onResize, { passive: true });

      let running = true;
      let raf = 0;
      let eased = 0;
      let last = performance.now();

      const onLost = (e: Event) => {
        e.preventDefault();
        running = false;
        canvas.classList.remove("is-ready");
      };
      canvas.addEventListener("webglcontextlost", onLost);

      const frame = () => {
        if (!running) return;
        if (document.hidden) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
          return;
        }

        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        // Drift toward the camera and wrap on the cell size, so the motion is
        // seamless rather than resetting visibly.
        const speed = 2.2;
        floor.position.z = (floor.position.z + speed * dt) % CELL;
        ceiling.position.z = (ceiling.position.z + speed * dt * 0.6) % CELL;

        const target = window.__scrollProgress ?? 0;
        eased += (target - eased) * Math.min(1, dt * 3.2);

        px += (tx - px) * Math.min(1, dt * 2.2);

        camera.position.x = px * 1.1;
        camera.position.y = 2.4 + eased * 2.6;
        camera.lookAt(px * 0.4, 1.4 - eased * 0.8, -16);

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };

      canvas.classList.add("is-ready");
      raf = requestAnimationFrame(frame);

      dispose = () => {
        running = false;
        cancelAnimationFrame(raf);
        removeEventListener("pointermove", onPointer);
        removeEventListener("resize", onResize);
        canvas.removeEventListener("webglcontextlost", onLost);
        floor.geometry.dispose();
        ceiling.geometry.dispose();
        (floor.material as Three.Material).dispose();
        (ceiling.material as Three.Material).dispose();
        renderer.dispose();
      };
    };

    const kick = () => void start().catch(() => { /* decorative; ignore */ });

    // Safari only shipped requestIdleCallback recently, so fall back to a timer.
    let idle: number | null = null;
    let timer: number | null = null;

    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(kick, { timeout: 2000 });
    } else {
      timer = window.setTimeout(kick, 900);
    }

    return () => {
      cancelled = true;
      if (idle !== null) window.cancelIdleCallback(idle);
      if (timer !== null) clearTimeout(timer);
      dispose();
    };
  }, []);

  return <canvas id="gl" ref={ref} aria-hidden="true" />;
}
