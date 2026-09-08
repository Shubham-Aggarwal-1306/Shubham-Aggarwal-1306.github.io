"use client";

import { useEffect, useRef } from "react";

/**
 * Project cards as a stacked deck, swiped through by vertical scroll.
 *
 * The wrapper is tall and the stage inside it is sticky, so the section pins
 * while the page keeps scrolling. That pinned distance maps onto a continuous
 * index: the front card swipes off to the left as its share of the scroll is
 * consumed, and the card behind rises to take its place.
 *
 * Two layouts, and only the first needs JavaScript:
 *   • scripting on, motion allowed → this pinned deck
 *   • otherwise                    → the plain vertical list it was before
 *
 * CSS decides which is active. This component only writes transforms, and
 * clears them whenever the deck layout is not the one in play — so a card can
 * never be stranded off screen by a stale transform.
 */

/** How many cards stay visible behind the front one. */
const DEPTH = 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function Deck({
  count,
  title,
  headingId,
  children,
}: {
  count: number;
  title: string;
  headingId: string;
  children: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const s = stage.current;
    const c = cards.current;
    if (!w || !s || !c) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(c.children) as HTMLElement[];

    let raf = 0;
    let queued = false;

    const reset = () => {
      for (const el of items) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.zIndex = "";
        el.style.pointerEvents = "";
      }
    };

    const apply = () => {
      queued = false;

      if (still.matches) {
        reset();
        return;
      }

      const rect = w.getBoundingClientRect();
      const travel = w.offsetHeight - s.offsetHeight;
      if (travel <= 0) {
        reset();
        return;
      }

      const stickyTop = parseFloat(getComputedStyle(s).top) || 0;
      const p = clamp01((stickyTop - rect.top) / travel);

      // Continuous index. At p = 1 this lands on the last card, so the deck
      // finishes showing it rather than emptying out.
      const t = p * (count - 1);

      items.forEach((el, i) => {
        const d = t - i;
        let x = 0;
        let y = 0;
        let rot = 0;
        let scale = 1;
        let op = 1;

        if (d >= 0) {
          // Front card being swiped away.
          const k = Math.min(1, d);
          x = -125 * Math.pow(k, 1.5);
          rot = -11 * k;
          scale = 1 - 0.04 * k;
          op = Math.max(0, 1 - k * 1.15);
        } else {
          // Waiting behind: stepped back and down so the stack is legible.
          const k = Math.min(DEPTH, -d);
          scale = 1 - 0.05 * k;
          y = 20 * k;
          op = -d > DEPTH + 0.35 ? 0 : 1;
        }

        el.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = op.toFixed(3);
        el.style.zIndex = String(count - i);
        // Only the front card should be clickable; the ones behind it are
        // stacked underneath and must not swallow the pointer.
        el.style.pointerEvents = d > -1 && d < 0.5 ? "auto" : "none";
      });
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    still.addEventListener("change", onScroll);
    apply();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      still.removeEventListener("change", onScroll);
      reset();
    };
  }, [count]);

  return (
    <div
      className="deck"
      ref={wrap}
      style={{ "--deck-n": count } as React.CSSProperties}
    >
      <div className="deck__stage" ref={stage}>
        <div className="shell">
          <h2 id={headingId} className="eyebrow deck__title">
            {title}
          </h2>
          <div className="deck__cards" ref={cards}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
