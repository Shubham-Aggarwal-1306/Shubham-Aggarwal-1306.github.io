"use client";

import { useEffect, useRef } from "react";

/**
 * The hero name as a checkerboard of pixels inside a rectangle.
 *
 * The real text stays in the <h1> as visually-hidden content — replacing it
 * with art would remove the one string this whole site exists to rank for, and
 * a screen reader would announce nothing. This grid is aria-hidden decoration
 * laid over it.
 *
 * The markup is rendered fully resolved: every cell carries its true on/off
 * state from the server, so with scripting off (or under reduced motion) the
 * name simply reads as a finished pixel sign. The animation is a single
 * client-side pass on mount that temporarily overrides cells via `data-lit`,
 * then removes the attribute so each cell falls back to the truth already in
 * the DOM. Nothing about the final image depends on it running or finishing,
 * and once the name has formed no timer remains alive.
 */

/** Five-row variable-width font. Only the letters in the name are defined;
 *  M needs a fifth column because it does not read at four. */
const FONT: Record<string, string[]> = {
  S: [" ███", "█   ", " ██ ", "   █", "███ "],
  H: ["█  █", "█  █", "████", "█  █", "█  █"],
  U: ["█  █", "█  █", "█  █", "█  █", " ██ "],
  B: ["███ ", "█  █", "███ ", "█  █", "███ "],
  A: [" ██ ", "█  █", "████", "█  █", "█  █"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
};

/** Blank cells of margin between the letterforms and the rectangle's edge. */
const PAD = 1;
const GLYPH_ROWS = 5;

/** Lays the word out into a rectangular boolean grid, padded all round. */
function build(text: string) {
  const letters = [...text].filter((ch) => FONT[ch]);

  const rows: boolean[][] = Array.from({ length: GLYPH_ROWS }, () => []);
  letters.forEach((ch, i) => {
    const glyph = FONT[ch];
    for (let r = 0; r < GLYPH_ROWS; r++) {
      for (const c of glyph[r]) rows[r].push(c !== " ");
      // One blank column between letters, none after the last.
      if (i < letters.length - 1) rows[r].push(false);
    }
  });

  const inner = rows[0]?.length ?? 0;
  const cols = inner + PAD * 2;
  const blank = () => Array.from({ length: cols }, () => false);

  const grid: boolean[][] = [];
  for (let p = 0; p < PAD; p++) grid.push(blank());
  for (const r of rows) grid.push([...Array(PAD).fill(false), ...r, ...Array(PAD).fill(false)]);
  for (let p = 0; p < PAD; p++) grid.push(blank());

  return { grid, cols };
}

export default function PixelName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { grid, cols } = build(text);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cells = Array.from(host.querySelectorAll<HTMLElement>(".px"));
    if (!cells.length) return;

    let stopped = false;

    // One pass, then done. Static sweeps left to right: columns ahead of the
    // front re-randomise each tick, columns behind it drop `data-lit` and
    // settle onto the true value already in the DOM. When the front clears the
    // last column the interval is cleared and nothing runs again — no idle
    // timer for the rest of the visit.
    const TICKS = 22;
    let tick = 0;

    const scramble = window.setInterval(() => {
      if (stopped) return;
      const front = (tick / TICKS) * cols;

      for (const el of cells) {
        if (Number(el.dataset.c) < front) {
          el.removeAttribute("data-lit");
        } else {
          el.dataset.lit = Math.random() < 0.5 ? "1" : "0";
        }
      }

      if (++tick > TICKS) {
        clearInterval(scramble);
        for (const el of cells) el.removeAttribute("data-lit");
      }
    }, 45);

    return () => {
      stopped = true;
      clearInterval(scramble);
      // Leave the grid in its true state, whenever we were interrupted.
      for (const el of cells) el.removeAttribute("data-lit");
    };
  }, [cols]);

  return (
    <span
      ref={ref}
      className="px-name"
      aria-hidden="true"
      style={{ "--px-cols": cols } as React.CSSProperties}
    >
      {grid.map((row, r) =>
        row.map((on, c) => (
          <i
            key={`${r}-${c}`}
            className="px"
            data-on={on ? "1" : "0"}
            data-alt={(r + c) % 2 === 0 ? "1" : "0"}
            data-c={c}
          />
        )),
      )}
    </span>
  );
}
