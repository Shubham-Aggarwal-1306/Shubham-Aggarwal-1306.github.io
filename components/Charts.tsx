import { RAMP, TIMELINE, TIMELINE_START, IMPACT, INDUSTRIES } from "@/lib/content";

/**
 * Infographics, built in HTML/CSS rather than SVG on purpose.
 *
 * Every number and label stays real DOM text, so the data is selectable,
 * crawlable, and readable by a screen reader in document order — no separate
 * table view needed, and nothing depends on JavaScript. The bars are the
 * decoration layered on top, marked aria-hidden.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec",
];

const toIndex = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return y * 12 + (m - 1);
};

const label = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};

export function Timeline() {
  // Resolved when the page is prerendered, so the span keeps up with each
  // deploy. A server component, so the client never recomputes it — no
  // hydration mismatch.
  const now = new Date();
  const end = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const start = toIndex(TIMELINE_START);
  const span = Math.max(1, end - start + 1);

  return (
    <figure className="fig">
      <figcaption className="fig__cap">
        Roles held, {label(TIMELINE_START)} to present
      </figcaption>

      <ol className="tl">
        {TIMELINE.map((t, i) => {
          const from = toIndex(t.from);
          const to = t.to ? toIndex(t.to) : end;
          const left = ((from - start) / span) * 100;
          const width = Math.max(1.5, ((to - from + 1) / span) * 100);
          const months = to - from + 1;

          return (
            <li className="tl__row" key={t.org}>
              <div className="tl__meta">
                <p className="tl__org">{t.org}</p>
                <p className="tl__role">{t.role}</p>
              </div>

              <div className="tl__track">
                <span
                  className="tl__bar"
                  aria-hidden="true"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: RAMP[i],
                  }}
                />
              </div>

              <p className="tl__when">
                <time dateTime={t.from}>{label(t.from)}</time>
                {" – "}
                {t.to ? <time dateTime={t.to}>{label(t.to)}</time> : "Present"}
                <span className="tl__dur">
                  {months} {months === 1 ? "month" : "months"}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

export function Impact() {
  return (
    <figure className="fig">
      <figcaption className="fig__cap">
        Measured reductions. Each from a different project, so they share a scale
        but not a context.
      </figcaption>

      <ul className="bars">
        {IMPACT.map((d, i) => (
          <li className="bars__row" key={d.metric}>
            <p className="bars__head">
              <span className="bars__value">{d.value}%</span>
              <span className="bars__metric">{d.metric}</span>
            </p>
            <div className="bars__track" aria-hidden="true">
              <span
                className="bars__fill"
                style={{ width: `${d.value}%`, background: RAMP[i] }}
              />
            </div>
            <p className="bars__ctx">{d.context}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function Industries() {
  return (
    <figure className="fig">
      <figcaption className="fig__cap">Domains shipped in</figcaption>
      <ul className="chips">
        {INDUSTRIES.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </figure>
  );
}
