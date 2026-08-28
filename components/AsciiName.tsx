/**
 * The hero name rendered as ASCII block letters.
 *
 * The real text stays in the <h1> as visually-hidden content: replacing it with
 * art would remove the one string this whole site exists to rank for, and
 * screen readers would announce nothing. The art is aria-hidden decoration on
 * top of it.
 *
 * A five-row, variable-width font — only the ten letters in the name are
 * defined. M and W get an extra column because they do not read at four.
 */

const FONT: Record<string, string[]> = {
  S: [" ███", "█   ", " ██ ", "   █", "███ "],
  H: ["█  █", "█  █", "████", "█  █", "█  █"],
  U: ["█  █", "█  █", "█  █", "█  █", " ██ "],
  B: ["███ ", "█  █", "███ ", "█  █", "███ "],
  A: [" ██ ", "█  █", "████", "█  █", "█  █"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  G: [" ███", "█   ", "█ ██", "█  █", " ███"],
  R: ["███ ", "█  █", "███ ", "█ █ ", "█  █"],
  W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  L: ["█   ", "█   ", "█   ", "█   ", "████"],
};

function word(text: string): string {
  const rows = ["", "", "", "", ""];
  const letters = [...text];
  letters.forEach((ch, i) => {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let r = 0; r < 5; r++) {
      rows[r] += glyph[r] + (i === letters.length - 1 ? "" : " ");
    }
  });
  return rows.join("\n");
}

export default function AsciiName({ lines }: { lines: string[] }) {
  return (
    <span className="ascii-name" aria-hidden="true">
      {lines.map((l) => (
        <span className="ascii-name__line" key={l}>
          {word(l)}
        </span>
      ))}
    </span>
  );
}
