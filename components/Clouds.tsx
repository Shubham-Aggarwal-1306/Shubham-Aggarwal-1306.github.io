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
];

export default function Clouds() {
  return (
    <div className="clouds" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="clouds__c"
          style={{
            top: c.top,
            right: c.right,
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
