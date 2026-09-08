"use client";

import { useEffect, useRef } from "react";

/**
 * Green dust drifting behind every section below the hero.
 *
 * Particles feel a pull toward the pointer, and any that reach it are captured
 * into a slow orbit — so a cluster accumulates the longer the pointer rests in
 * one place, and thins out again once it goes idle.
 *
 * Deliberately canvas 2D rather than WebGL: a few hundred alpha-blended dots
 * is nowhere near needing a GPU pipeline, and this keeps three.js out of the
 * bundle now that the WebGL field is gone.
 *
 * It runs only while the hero is off screen (the hero has its own ASCII rain,
 * and two moving backdrops at once was the problem we just removed), only when
 * the tab is visible, and not at all under prefers-reduced-motion.
 */

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius in CSS pixels. */
  r: number;
  /** Base alpha, scaled up slightly once captured. */
  a: number;
  /** Ambient heading, wandering slowly so the drift never looks like a field. */
  drift: number;
  /** Captured into orbit around the pointer. */
  held: boolean;
  /** Orbit angle and radius, used only while held. */
  oa: number;
  or: number;
  spin: number;
};

/** Pointer pull reaches this far, in CSS pixels. */
const INFLUENCE = 260;
/** Inside this, a particle is collected. */
const CAPTURE = 30;
/** Peak acceleration from the pull, at zero distance. */
const ATTRACT = 0.06;
/** Pointer must move again within this long, or the cluster starts releasing. */
const IDLE_MS = 1500;

export default function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Read the accent from the stylesheet so the dust cannot drift out of step
    // with the palette.
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#4ade80";

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: P[] = [];

    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

    const build = () => {
      // Density by area, hard-capped so a large desktop display does not end
      // up doing meaningfully more work than a laptop.
      const target = Math.round(Math.min(150, (w * h) / 13000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.08, 0.08),
        vy: rand(-0.08, 0.08),
        r: rand(0.5, 1.9),
        a: rand(0.14, 0.46),
        drift: Math.random() * Math.PI * 2,
        held: false,
        oa: Math.random() * Math.PI * 2,
        or: rand(7, 30),
        spin: rand(0.006, 0.02) * (Math.random() < 0.5 ? -1 : 1),
      }));
    };

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();

    let px = -9999;
    let py = -9999;
    let lastMove = -Infinity;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
    };
    const onLeave = () => {
      lastMove = -Infinity;
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    addEventListener("resize", resize, { passive: true });

    // Visibility is owned by --dust-o, which Motion.tsx drives from scroll so
    // the dust cross-fades with the hero's rain. Reading it back off the inline
    // style is a plain string lookup — no getComputedStyle, so no layout cost
    // per frame. Missing (scripting-driven value not set yet) reads as 0.
    const root = document.documentElement;
    const visible = () => parseFloat(root.style.getPropertyValue("--dust-o")) || 0;

    let raf = 0;
    let prev = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      // Clamp so returning to a backgrounded tab does not integrate one huge
      // step and fling every particle off screen.
      const k = Math.min(3, (now - prev) / 16.667);
      prev = now;

      // Fully transparent means there is nothing to see, so skip the whole
      // simulation rather than integrating physics nobody is looking at.
      if (visible() < 0.01 || document.hidden) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      const active = now - lastMove < IDLE_MS;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (p.held && active) {
          // Settle into a slow orbit: this is the "collected" state, and what
          // makes the cluster read as accumulating rather than just crowding.
          p.oa += p.spin * k;
          const tx = px + Math.cos(p.oa) * p.or;
          const ty = py + Math.sin(p.oa) * p.or;
          p.vx += (tx - p.x) * 0.11 * k;
          p.vy += (ty - p.y) * 0.11 * k;
          p.vx *= 0.72;
          p.vy *= 0.72;
        } else {
          if (p.held) {
            // Pointer went idle — let the cluster come apart gradually, a few
            // grains at a time, instead of the whole thing bursting at once.
            if (Math.random() < 0.012 * k) {
              p.held = false;
              p.vx += rand(-0.35, 0.35);
              p.vy += rand(-0.35, 0.35);
            }
          }

          // Ambient wander, with a slight upward bias so it reads as dust
          // hanging in air rather than falling.
          p.drift += rand(-0.06, 0.06) * k;
          p.vx += Math.cos(p.drift) * 0.005 * k;
          p.vy += (Math.sin(p.drift) * 0.005 - 0.0016) * k;

          if (active) {
            const dx = px - p.x;
            const dy = py - p.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < INFLUENCE) {
              const pull = (1 - d / INFLUENCE) * ATTRACT;
              p.vx += (dx / d) * pull * k;
              p.vy += (dy / d) * pull * k;
              if (d < CAPTURE) p.held = true;
            }
          }

          p.vx *= 0.965;
          p.vy *= 0.965;
        }

        p.x += p.vx * k;
        p.y += p.vy * k;

        // Wrap, so the field never depletes at an edge.
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;

        ctx.globalAlpha = p.held ? Math.min(0.72, p.a * 1.6) : p.a;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", resize);
    };
  }, []);

  return <canvas id="dust" ref={ref} aria-hidden="true" />;
}
