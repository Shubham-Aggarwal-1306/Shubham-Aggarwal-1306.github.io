"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ASCII closer: a surfer riding the swell past a palm island.
 *
 * Generated procedurally — the swell is two summed sines, and everything in the
 * water (surfer, fish, island) sits on the height actually computed for its own
 * column, so nothing is animated independently of the sea.
 *
 * The grid is sized to the viewport rather than fixed. Character advance is
 * measured from the rendered font instead of assumed, then the column count is
 * chosen so the type never drops below ~12px: a fixed 150-column scene squeezed
 * onto a phone falls to 5px, which fails Lighthouse's legibility audit and is
 * genuinely unreadable. Wide screens get the detailed island, narrow ones a
 * compact variant that still fits the whole scene.
 *
 * First frame renders on the server, so with JavaScript off the scene is there,
 * just still. Under prefers-reduced-motion it stays on that frame, and the loop
 * pauses whenever the tab is hidden or the scene is off screen.
 */

const H = 16;
const WATERLINE = 8;

const ISLAND_WIDE = [
  "       \\ \\|/ /                    \\ | /       ",
  "    ---_\\\\|//_---              ___\\\\|//___    ",
  "         |||                       |||        ",
  "         |||           _/\\_        |||        ",
  "        /|||\\         /____\\      /|||\\       ",
  "       //|||\\\\       |  []  |    //|||\\\\      ",
  " ____.-''''''-.______|______|__.-''''''-.____ ",
  "/                                            \\",
];

const ISLAND_COMPACT = [
  "    \\ | /     ",
  "  __\\\\|//__   ",
  "     |||      ",
  "    /|||\\     ",
  " _.-'''''-._  ",
  "/           \\ ",
];

const SURFER = [
  "   o   ",
  "  /|\\  ",
  "  / \\  ",
  "_/___\\_",
];

const FISH = [
  { y: 3, speed: 5.5, right: true, phase: 0 },
  { y: 5, speed: -3.8, right: false, phase: 40 },
  { y: 7, speed: 4.2, right: true, phase: 75 },
  { y: 4, speed: -6.1, right: false, phase: 110 },
  { y: 9, speed: 3.1, right: true, phase: 20 },
];

function blit(g: string[][], art: string[], x0: number, y0: number, W: number) {
  for (let r = 0; r < art.length; r++) {
    const y = y0 + r;
    if (y < 0 || y >= H) continue;
    for (let c = 0; c < art[r].length; c++) {
      const x = x0 + c;
      if (x < 0 || x >= W) continue;
      const ch = art[r][c];
      if (ch !== " ") g[y][x] = ch;
    }
  }
}

export function renderFrame(t: number, W: number): string {
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill(" "));

  const surf = (x: number) =>
    WATERLINE +
    Math.sin(x * 0.16 + t * 1.5) * 1.4 +
    Math.sin(x * 0.055 - t * 0.85) * 1.1;

  // Deterministic hash, not a modulo: `(x + y) % 2` lays down a regular lattice
  // that reads as diagonal moiré rather than water.
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  // Water first, so everything standing in it draws on top.
  for (let x = 0; x < W; x++) {
    const s = Math.round(surf(x));
    for (let y = Math.max(0, s); y < H; y++) {
      const d = y - s;
      let ch = " ";
      if (d === 0) ch = Math.sin(x * 0.5 + t * 2.6) > 0.35 ? "≈" : "~";
      else if (d === 1) ch = hash(x, y) < 0.85 ? "~" : "≈";
      else {
        const density = Math.max(0, 1 - (d - 1) / 6);
        if (hash(x, y) < density) ch = d <= 3 ? "~" : d <= 5 ? "-" : ".";
      }
      if (ch !== " ") g[y][x] = ch;
    }
  }

  // Fish, wrapping through the swell. Drawn only where there is actually water
  // above them, so none appear in mid-air over a trough.
  for (const f of FISH) {
    const span = W + 8;
    const x = Math.round((((f.phase + t * f.speed) % span) + span) % span) - 4;
    const y = Math.round(surf(x)) + f.y;
    if (y >= H) continue;
    blit(g, [f.right ? "><>" : "<><"], x, y, W);
  }

  // The island is land: its base is pinned to the mean waterline, NOT to
  // surf(), which is time-varying. Deriving it from surf() made the whole
  // island bob up and down on the swell.
  const wide = W >= 96;
  const island = wide ? ISLAND_WIDE : ISLAND_COMPACT;
  const islandBase = WATERLINE + 1;
  // Flush to the right edge, so the landmass runs off the side of the frame.
  const islandX = Math.max(0, W - island[0].length);

  // Carve the landmass out of the sea: everything below the shoreline and
  // right of the sloping shore edge is land, so no water (and no fish) is
  // drawn under the island.
  for (let y = islandBase; y < H; y++) {
    const inset = Math.round((y - islandBase) * 2.2);
    const edge = Math.max(0, islandX - inset);
    for (let x = edge; x < W; x++) g[y][x] = " ";
    if (edge > 0) g[y][edge] = "\\";
  }

  // Also clear the island's bounding box *above* the shoreline. A wave crest
  // can rise past that row, and the art's blank cells do not overwrite, so
  // without this the sea shows through the gaps in the fronds and inside the
  // hut.
  const islandTop = islandBase - island.length + 1;
  for (let y = Math.max(0, islandTop); y < islandBase; y++) {
    for (let x = islandX; x < W; x++) g[y][x] = " ";
  }

  blit(g, island, islandX, islandTop, W);

  const sx = Math.round(W * 0.14);
  const sy = Math.round(surf(sx + 3));
  blit(g, SURFER, sx, sy - SURFER.length + 1, W);

  // Only when fully on frame — a half-clipped gull leaves a stray slash
  // hanging at the edge.
  const gullX = Math.round(((t * 4) % (W + 14)) - 7);
  if (gullX >= 0 && gullX + 2 <= islandX) blit(g, ["\\/"], gullX, 1, W);
  if (gullX + 11 >= 0 && gullX + 13 <= islandX) blit(g, ["\\/"], gullX + 11, 3, W);

  return g.map((r) => r.join("")).join("\n");
}

const DEFAULT_COLS = 120;

export default function Ocean() {
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [frame, setFrame] = useState(() => renderFrame(0, DEFAULT_COLS));
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Fit the grid to the viewport. Runs after hydration, so the server and the
  // first client render stay identical.
  useEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current;
      const pre = preRef.current;
      if (!wrap || !pre) return;

      // Measure the real advance width rather than assuming 0.6em — it varies
      // by platform (Menlo ≈ .602, Consolas ≈ .55) and guessing overflows.
      const probe = document.createElement("span");
      probe.textContent = "0".repeat(100);
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:pre;font:inherit";
      pre.appendChild(probe);
      const perChar = probe.getBoundingClientRect().width / 100;
      probe.remove();
      if (!perChar) return;

      const em = perChar / parseFloat(getComputedStyle(pre).fontSize);
      const w = wrap.clientWidth;

      // Pick columns so the resulting size stays at or above 12px.
      const next = Math.max(46, Math.min(170, Math.floor(w / (12.5 * em))));
      pre.style.fontSize = `${Math.min(22, w / (next * em))}px`;
      setCols(next);
    };

    fit();
    addEventListener("resize", fit, { passive: true });
    return () => removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(renderFrame(0, cols));
      return;
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    const STEP = 1000 / 12; // ASCII reads better chunky than smooth

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (now - last < STEP) return;
      last = now;
      setFrame(renderFrame((now - start) / 1000, cols));
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, {
      rootMargin: "150px",
    });
    if (wrapRef.current) io.observe(wrapRef.current);

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [cols]);

  return (
    <div className="ocean" ref={wrapRef}>
      {/* role=img belongs on a generic element — it is not permitted on
          <section>, which is what the a11y audit flagged. */}
      <pre
        className="ocean__art"
        ref={preRef}
        role="img"
        aria-label="ASCII animation: a surfer riding waves past a palm island, fish swimming below"
      >
        {frame}
      </pre>
    </div>
  );
}
