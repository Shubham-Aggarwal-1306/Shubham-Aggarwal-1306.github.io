/**
 * ASCII rain falling behind the hero, in the site's green.
 *
 * A server component, like Clouds: pure markup plus one CSS keyframe. No rAF
 * loop and no client bundle — the ocean is the only animation on the page that
 * earns a JS loop, and decoration does not.
 *
 * The columns are generated from a seeded PRNG rather than Math.random so the
 * prerendered HTML is byte-stable across builds, and so a column's shape never
 * shifts between two deploys for no reason.
 *
 * aria-hidden: this carries no information.
 */

/** Small LCG. Deterministic, and enough randomness for glyph placement. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ROWS = 56;
const COLUMNS = 12;

/** Punctuation between streaks. Picked to read unmistakably as typed ASCII at
 *  the rendered size, rather than as anonymous specks. */
const DROPS = [":", ".", "'", "*", "+", "-", ";", "\""];

/**
 * One column of drizzle. Runs of "|" read as a falling streak; the scattered
 * glyphs break up the rhythm so the column does not look like a dashed border.
 * Most rows are blank on purpose — the gaps are what keep this rain rather
 * than a curtain.
 */
function column(seed: number) {
  const rand = rng(seed);
  const rows: string[] = [];
  let streak = 0;

  for (let i = 0; i < ROWS; i++) {
    if (streak > 0) {
      rows.push("|");
      streak--;
      continue;
    }
    const r = rand();
    if (r < 0.18) {
      streak = 2 + Math.floor(rand() * 5);
      rows.push("|");
    } else if (r < 0.38) {
      rows.push(DROPS[Math.floor(rand() * DROPS.length)]);
    } else {
      rows.push(" ");
    }
  }

  return rows.join("\n");
}

const RAIN = Array.from({ length: COLUMNS }, (_, i) => {
  const rand = rng(9001 + i * 77);
  const art = column(1237 + i * 101);

  return {
    // Doubled, so translating the span by exactly half its height loops with
    // no visible seam.
    art: `${art}\n${art}`,
    left: `${(i + 0.5) * (100 / COLUMNS) + (rand() - 0.5) * 4.5}%`,
    dur: `${(9 + rand() * 9).toFixed(2)}s`,
    delay: `-${(rand() * 14).toFixed(2)}s`,
    // Ceiling is .42. The densest possible blend — accent over the page black
    // at that alpha — still leaves white type above 7:1, so the headline in
    // front of it stays well clear of AA.
    dim: (0.2 + rand() * 0.22).toFixed(3),
    // Large enough that a ":" or "*" is legible as that character, small
    // enough that the column still reads as weather rather than as text.
    size: `${(15 + rand() * 4).toFixed(1)}px`,
  };
});

export default function Rain() {
  return (
    <div className="rain" aria-hidden="true">
      {RAIN.map((c, i) => (
        <span
          key={i}
          className="rain__c"
          style={{
            left: c.left,
            fontSize: c.size,
            animationDuration: c.dur,
            animationDelay: c.delay,
            opacity: c.dim,
          }}
        >
          {c.art}
        </span>
      ))}
    </div>
  );
}
