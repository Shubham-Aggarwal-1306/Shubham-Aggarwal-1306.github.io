"use client";

import { useEffect, useRef } from "react";
import {
  siJavascript,
  siTypescript,
  siPython,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siExpress,
  siDjango,
  siMysql,
  siPostgresql,
  siMongodb,
  siFirebase,
  siGooglecloud,
} from "simple-icons";

/**
 * A slowly rotating sphere of the stack, beside the skills list.
 *
 * Icon paths come from the simple-icons package rather than being hand-written,
 * so every mark is the official one. Four entries — Java, SQL, AWS and React
 * Native — have no icon in that set (trademark removals, or no distinct mark),
 * so they ride as text labels instead of being drawn as something invented.
 *
 * Marks render in currentColor, not brand colours: several are near-black
 * (Next.js #000000, Express #0A0A0A) and would vanish against this page, and a
 * monochrome sphere keeps the site's palette intact.
 *
 * Decorative, so aria-hidden — every one of these technologies is already
 * listed as real text in the <dl> beside it.
 */

type Item = { label: string; path?: string };

// Mirrors SKILLS in lib/content.ts. Keep the two in step.
const ITEMS: Item[] = [
  { label: "JavaScript", path: siJavascript.path },
  { label: "TypeScript", path: siTypescript.path },
  { label: "Python", path: siPython.path },
  { label: "Java" },
  { label: "SQL" },
  { label: "React", path: siReact.path },
  { label: "Next.js", path: siNextdotjs.path },
  { label: "React Native" },
  { label: "Node.js", path: siNodedotjs.path },
  { label: "Express", path: siExpress.path },
  { label: "Django", path: siDjango.path },
  { label: "MySQL", path: siMysql.path },
  { label: "PostgreSQL", path: siPostgresql.path },
  { label: "MongoDB", path: siMongodb.path },
  { label: "Firebase", path: siFirebase.path },
  { label: "AWS" },
  { label: "GCP", path: siGooglecloud.path },
];

/** How far the camera sits from the sphere centre, in radii. */
const PERSPECTIVE = 2.3;

/**
 * Fibonacci sphere: spreads N points evenly over a sphere without the crowding
 * at the poles that naive lat/long stepping produces.
 */
const seeds = ITEMS.map((_, i) => {
  const n = ITEMS.length;
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  };
});

export default function SkillSphere() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const cells = Array.from(el.querySelectorAll<HTMLElement>(".orb__i"));
    if (!cells.length) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)");

    // Tilt the axis a little so the rotation reads as a sphere rather than a
    // flat ring.
    const TILT = 0.42;
    let angle = 0;

    const paint = () => {
      // 0.72 of the half-width, not the full half-width: perspective pushes the
      // near face out to ~1.11x the radius, and each item is drawn from its own
      // centre, so a full-radius sphere throws its widest labels well outside
      // the box and over the terminal beside it.
      const R = (el.clientWidth / 2) * 0.72;
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      seeds.forEach((p, i) => {
        // Yaw about Y, then a fixed pitch.
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;

        const s = PERSPECTIVE / (PERSPECTIVE - z2);
        const el2 = cells[i];
        el2.style.transform = `translate3d(${(x1 * R * s).toFixed(1)}px, ${(y2 * R * s).toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        // Back of the sphere recedes rather than disappearing.
        el2.style.opacity = (0.22 + ((z2 + 1) / 2) * 0.78).toFixed(3);
        el2.style.zIndex = String(Math.round((z2 + 1) * 100));
      });
    };

    paint();
    if (still.matches) return; // Static projection is a fine resting state.

    let raf = 0;
    let running = false;
    let prev = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      // Clamp so a backgrounded tab does not resume with one huge jump.
      const k = Math.min(3, (now - prev) / 16.667);
      prev = now;
      if (document.hidden) return;
      angle += 0.0022 * k;
      paint();
    };

    const start = () => {
      if (running) return;
      running = true;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only spin while it is actually on screen.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(el);

    const onResize = () => paint();
    addEventListener("resize", onResize, { passive: true });

    return () => {
      stop();
      io.disconnect();
      removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="orb" ref={host} aria-hidden="true">
      {ITEMS.map((it) => (
        <span className="orb__i" key={it.label} title={it.label}>
          {it.path ? (
            <svg viewBox="0 0 24 24" fill="currentColor" role="presentation">
              <path d={it.path} />
            </svg>
          ) : (
            <span className="orb__t">{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
