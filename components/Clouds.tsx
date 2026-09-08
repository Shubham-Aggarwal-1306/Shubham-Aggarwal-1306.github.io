/**
 * ASCII clouds drifting behind the top-right of the hero, passing under the
 * translucent sticky header so they bleed into it.
 *
 * A server component on purpose: pure markup plus CSS keyframes, no JS and no
 * per-frame re-render. The ocean already runs a rAF loop; a second one for
 * decoration would cost more than the clouds are worth.
 *
 * aria-hidden throughout — these carry no information.
 */

const CLOUDS: { art: string; top: string; right: string; dur: string; delay: string; dim: number }[] = [
  {
    art: [
      "      .--.      ",
      "   .-(    ).    ",
      "  (___.__)__)   ",
    ].join("\n"),
    top: "-3.5rem",
    right: "2rem",
    dur: "34s",
    delay: "0s",
    dim: 0.5,
  },
  {
    art: [
      "    .-~-.    ",
      "  .(     ).  ",
      " (__.__)__)  ",
    ].join("\n"),
    top: "1.5rem",
    right: "13rem",
    dur: "47s",
    delay: "-8s",
    dim: 0.34,
  },
  {
    art: [
      "   .--.   ",
      "  (    )  ",
      " (__)__)  ",
    ].join("\n"),
    top: "7rem",
    right: "-1rem",
    dur: "41s",
    delay: "-19s",
    dim: 0.26,
  },
  {
    art: [
      "     .-.     ",
      "  .-(   ).-. ",
      " (___.__)__) ",
    ].join("\n"),
    top: "13.5rem",
    right: "9rem",
    dur: "56s",
    delay: "-31s",
    dim: 0.18,
  },
  // The bank below extends the drift further left and further down, so the
  // clouds thin out gradually into the hero instead of stopping on a line.
  {
    art: [
      "   .-~~-.   ",
      " .(      ). ",
      "(___.__)__) ",
    ].join("\n"),
    top: "-1rem",
    right: "24rem",
    dur: "62s",
    delay: "-14s",
    dim: 0.3,
  },
  {
    art: [
      "  .--.  ",
      " (    ) ",
      "(__)__) ",
    ].join("\n"),
    top: "5.5rem",
    right: "31rem",
    dur: "51s",
    delay: "-26s",
    dim: 0.16,
  },
  {
    art: [
      "    .-.    ",
      " .-(   ).  ",
      "(__.__)__) ",
    ].join("\n"),
    top: "18.5rem",
    right: "20rem",
    dur: "68s",
    delay: "-41s",
    dim: 0.12,
  },
  {
    art: [
      "   .-.   ",
      "  (   )  ",
      " (__)__) ",
    ].join("\n"),
    top: "10.5rem",
    right: "5rem",
    dur: "44s",
    delay: "-5s",
    dim: 0.22,
  },
];

export default function Clouds() {
  return (
    <div className="clouds" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="clouds__c"
          // --dim rather than `opacity`: the sprite carries an opaque backing
          // so the rain does not show through it, and element opacity would
          // fade that backing along with the glyphs.
          style={
            {
              top: c.top,
              right: c.right,
              animationDuration: c.dur,
              animationDelay: c.delay,
              "--dim": String(c.dim),
            } as React.CSSProperties
          }
        >
          {c.art}
        </span>
      ))}
    </div>
  );
}
