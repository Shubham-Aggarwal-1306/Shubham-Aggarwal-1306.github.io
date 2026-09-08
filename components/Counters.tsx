"use client";

import { useEffect } from "react";

/**
 * Counts the figures up from zero the first time each scrolls into view.
 *
 * The final value is already real text in the server HTML — this only replaces
 * it while the animation runs, and writes the original string back verbatim at
 * the end. So the crawlable value never depends on this component, on the
 * parser below being right, or on the animation finishing.
 *
 * Anything that does not parse as "optional prefix, number, optional suffix"
 * is left completely alone rather than guessed at.
 */

/** "20,000+" -> ["", "20,000", "+"] · "25 months" -> ["", "25", " months"] */
const SHAPE = /^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/s;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Counters() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-count]"),
    );
    if (!els.length) return;

    const timers = new Set<number>();

    const run = (el: HTMLElement) => {
      const final = el.textContent ?? "";
      const m = SHAPE.exec(final);
      if (!m) return;

      const [, prefix, digits, suffix] = m;
      const target = Number(digits.replace(/,/g, ""));
      if (!Number.isFinite(target)) return;

      const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
      const grouped = digits.includes(",");

      // A screen reader that lands mid-animation would otherwise read a
      // half-counted number. The label stays at the true value throughout.
      el.setAttribute("aria-label", final.trim());

      const dur = 1100;
      const t0 = performance.now();

      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const n = easeOut(p) * target;
        el.textContent =
          prefix +
          (grouped
            ? Math.round(n).toLocaleString("en-US")
            : n.toFixed(decimals)) +
          suffix;

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          // Restore the exact original string — never a reformatted version of
          // it — then drop the label so the text speaks for itself again.
          el.textContent = final;
          el.removeAttribute("aria-label");
        }
      };

      requestAnimationFrame(step);
    };

    const seen = new WeakSet<HTMLElement>();
    const start = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      run(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            start(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 },
    );

    for (const el of els) io.observe(el);

    // Same failsafe the reveals use: an anchor jump or a restored scroll
    // position can carry an element past the viewport without one intersecting
    // frame ever being sampled. Nothing may be left showing a stale zero.
    const failsafe = window.setTimeout(() => {
      for (const el of els) start(el);
      io.disconnect();
    }, 5000);
    timers.add(failsafe);

    return () => {
      io.disconnect();
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  return null;
}
