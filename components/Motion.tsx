"use client";

import { useEffect } from "react";

/**
 * Scroll reveals, sticky-nav state, section spy and the progress bar.
 *
 * Renders nothing. Every element it touches is already present in the server
 * HTML; the rules that hide them live behind `@media (scripting: enabled)` in
 * globals.css, so with scripting off the page simply reads as static.
 */
export default function Motion() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealables: Element[] = [
      ...document.querySelectorAll("[data-reveal]"),
      ...document.querySelectorAll(".hero [data-rise]"),
      ...document.querySelectorAll(".hero__name .line > span"),
    ];

    const revealAll = () => {
      for (const el of revealables) el.classList.add("is-in");
      revealables.length = 0;
    };

    // A bare IntersectionObserver is not enough: an anchor jump, or the browser
    // restoring scroll position on reload, can move an element from below the
    // viewport to above it without a single intersecting frame being sampled,
    // leaving it stuck at opacity 0 forever. Sweep for anything in view *or
    // already passed*, and force everything visible after a few seconds.
    const sweep = () => {
      for (let i = revealables.length - 1; i >= 0; i--) {
        if (revealables[i].getBoundingClientRect().top < innerHeight * 0.9) {
          revealables[i].classList.add("is-in");
          revealables.splice(i, 1);
        }
      }
    };

    let failsafe: number | undefined;
    if (reduced) {
      revealAll();
    } else {
      failsafe = window.setTimeout(revealAll, 4000);
      requestAnimationFrame(sweep);
    }

    const nav = document.querySelector(".nav");
    const bar = document.querySelector<HTMLElement>(".nav__progress i");

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      window.__scrollProgress = p;

      // Cross-fade the two backdrops. The ranges overlap for about a full
      // viewport — the stretch where About sits — so the rain thins while the
      // dust builds and both are visible together through it, rather than one
      // cutting over to the other at the hero boundary.
      const v = Math.max(1, innerHeight);
      const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
      const rainO = clamp01(1 - (scrollY - v * 0.35) / (v * 1.25));
      const dustO = clamp01((scrollY - v * 0.5) / v);
      const root = document.documentElement;
      root.style.setProperty("--rain-o", rainO.toFixed(3));
      root.style.setProperty("--dust-o", dustO.toFixed(3));

      nav?.classList.toggle("is-stuck", scrollY > 8);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (revealables.length) sweep();
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    onScroll();

    // Track the pointer over glass cards so the specular highlight follows it.
    const onCardMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>(".glass-flat");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--gx", `${e.clientX - r.left}px`);
      card.style.setProperty("--gy", `${e.clientY - r.top}px`);
    };
    if (!reduced) addEventListener("pointermove", onCardMove, { passive: true });

    const links = [...document.querySelectorAll<HTMLAnchorElement>(".nav__list a")];
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const a of links) {
            a.setAttribute("aria-current", String(a.getAttribute("href") === `#${e.target.id}`));
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    for (const id of ["about", "experience", "projects", "recognition", "contact"]) {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    }

    return () => {
      if (failsafe) clearTimeout(failsafe);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("pointermove", onCardMove);
      spy.disconnect();
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    __scrollProgress?: number;
  }
}
