import Field from "@/components/Field";
import Motion from "@/components/Motion";
import Clock from "@/components/Clock";
import { Timeline, Impact, Industries } from "@/components/Charts";
import Intro from "@/components/Intro";
import Ocean from "@/components/Ocean";
import AsciiName from "@/components/AsciiName";
import Clouds from "@/components/Clouds";
import { PERSON } from "@/lib/site";
import {
  HERO_LEAD,
  STATUS,
  STATS,
  STACK_LINES,
  SUMMARY,
  EXPERIENCE,
  PROJECTS,
  PROJECT_LINKS,
  RECOGNITION,
  SKILLS,
  EDUCATION,
  type Entry,
  type Point,
} from "@/lib/content";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec",
];

function Dates({ from, to }: { from: string; to?: string }) {
  const label = (iso: string) => {
    const [y, m] = iso.split("-");
    return `${MONTHS[Number(m) - 1]} ${y}`;
  };

  // A single-month engagement is one date, not "Aug 2022 – Aug 2022".
  if (to === from) return <time dateTime={from}>{label(from)}</time>;

  return (
    <>
      <time dateTime={from}>{label(from)}</time>
      {to ? (
        <>
          {" – "}
          <time dateTime={to}>{label(to)}</time>
        </>
      ) : (
        " – Present"
      )}
    </>
  );
}

/** Renders a bullet, splicing in an inline link where the copy has {link}. */
function Bullet({ point }: { point: Point }) {
  const [before, after] = point.href ? point.text.split("{link}") : [point.text, ""];
  return (
    <li>
      {point.lead ? (
        <>
          <strong>{point.lead}</strong>
          {" — "}
        </>
      ) : null}
      {before}
      {point.href ? (
        <>
          <a className="link" href={point.href}>
            {point.linkText}
          </a>
          {after}
        </>
      ) : null}
    </li>
  );
}

function EntryBlock({ entry, href, card }: { entry: Entry; href?: string; card?: boolean }) {
  return (
    <article className={card ? "entry entry--card glass-flat" : "entry"} data-reveal>
      {entry.version ? (
        <p className="entry__version">
          <span>{entry.version}</span>
        </p>
      ) : null}
      <h3 className="entry__role">{entry.role}</h3>
      <p className="entry__org">
        {entry.orgHref ? (
          <a className="link" href={entry.orgHref}>
            {entry.org}
          </a>
        ) : (
          entry.org
        )}
      </p>
      <p className="entry__meta">
        {href ? (
          <a className="link" href={href}>
            {entry.meta}
          </a>
        ) : (
          entry.meta
        )}
        {entry.meta && entry.dates ? " · " : null}
        {entry.dates ? <Dates {...entry.dates} /> : null}
      </p>
      {entry.points?.length ? (
        <>
          {entry.version ? <p className="entry__changelog">Added</p> : null}
          <ul className="entry__points">
            {entry.points.map((p, i) => (
              <Bullet key={i} point={p} />
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

function Band({
  id,
  label,
  children,
  className = "",
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`band ${className}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="shell band__grid">
        <div className="band__label">
          <h2 id={`${id}-h`} className="eyebrow">
            {label}
          </h2>
        </div>
        <div className="band__body">{children}</div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Intro />
      <Field />
      <div className="grain" aria-hidden="true" />
      <Motion />

      <header className="nav" id="top">
        <div className="shell nav__inner">
          <a className="nav__brand" href="#top">
            <span>SA</span>
          </a>
          <nav aria-label="Sections">
            <ul className="nav__list">
              <li><a href="#about">About</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#recognition">Recognition</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <a className="nav__resume glass" href={PERSON.resume} download>
            <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8" />
              <path d="M4.5 7 8 10.5 11.5 7" />
              <path d="M2.5 12.5v1h11v-1" />
            </svg>
            <span>Résumé</span>
          </a>
        </div>
        <div className="nav__progress" aria-hidden="true">
          <i />
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="name">
          <Clouds />
          <div className="shell hero__grid">
            <div className="hero__main">
              <p className="pill glass" data-rise>
                <span className="pill__dot" aria-hidden="true" />
                {STATUS}
              </p>
              <p className="hero__kicker" data-rise>
                {PERSON.location} <span aria-hidden="true">·</span> Backend{" "}
                <span aria-hidden="true">·</span> Cloud
              </p>
              <h1 id="name" className="hero__name" data-rise>
                {/* Real text kept for crawlers and screen readers — the art is
                    decoration and must not replace the name itself. */}
                <span className="sr-only">Shubham Aggarwal</span>
                <AsciiName lines={["SHUBHAM"]} />
              </h1>
              <p className="hero__role" data-rise>
                Backend-focused <em>Full-Stack</em> Engineer
              </p>
              <p className="hero__lead" data-rise>{HERO_LEAD}</p>
              <ul className="inline-links" data-rise>
                <li><a className="link" href={`mailto:${PERSON.email}`}>Email</a></li>
                <li><a className="link" href={PERSON.github}>GitHub</a></li>
                <li><a className="link" href={PERSON.linkedin}>LinkedIn</a></li>
                <li><a className="link" href={PERSON.resume} download>Résumé</a></li>
              </ul>
            </div>

            <aside className="hero__now glass" data-rise>
              <p className="hero__now-label">Now</p>
              <Clock />
              <p className="hero__now-role">{STATUS}</p>
            </aside>
          </div>

          <div className="shell">
            <ul className="stats glass-flat" data-rise>
              {STATS.map((s) => (
                <li key={s.label}>
                  <span className="stats__value">{s.value}</span>
                  <span className="stats__label">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        <Band id="about" label="About">
          <p className="lede" data-reveal>{SUMMARY}</p>
          <div data-reveal>
            <Industries />
          </div>
        </Band>

        <Band id="impact" label="Impact">
          <div data-reveal>
            <Impact />
          </div>
        </Band>

        <Band id="experience" label="Experience">
          <div data-reveal>
            <Timeline />
          </div>
          {EXPERIENCE.map((e) => (
            <EntryBlock key={e.role + e.org} entry={e} />
          ))}
        </Band>

        <Band id="projects" label="Projects">
          {PROJECTS.map((p) => (
            <EntryBlock key={p.role} entry={p} href={PROJECT_LINKS[p.role]} card />
          ))}
        </Band>

        <Band id="recognition" label="Recognition">
          <ul className="awards">
            {RECOGNITION.map((r) => (
              <li key={r.title} className="glass-flat" data-reveal>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </li>
            ))}
          </ul>
        </Band>

        <Band id="skills" label="Skills">
          <div className="term glass" data-reveal>
            <p className="term__bar" aria-hidden="true">
              <i /><i /><i />
              <span>~/shubham — stack</span>
            </p>
            <pre className="term__body">
              <code>
                <span className="term__cmd">
                  <span className="term__prompt">$</span> stack --list
                </span>
                {"\n"}
                {STACK_LINES.map((l) => (
                  <span key={l.ok}>
                    {"\n"}
                    <span className="term__ok">✔</span> {l.ok}
                    <span className="term__dim"> — {l.text}</span>
                  </span>
                ))}
              </code>
            </pre>
          </div>

          <dl className="skills">
            {SKILLS.map((s) => (
              <div key={s.label} data-reveal>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </Band>

        <Band id="education" label="Education">
          <EntryBlock entry={EDUCATION} />
        </Band>

        <Band id="contact" label="Contact" className="band--contact">
          <p className="contact__lede" data-reveal>{PERSON.location}</p>
          <p className="contact__mail" data-reveal>
            <a className="link" href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
          </p>
          <ul className="inline-links" data-reveal>
            <li><a className="link" href={PERSON.github}>GitHub</a></li>
            <li><a className="link" href={PERSON.linkedin}>LinkedIn</a></li>
            <li><a className="link" href={PERSON.resume} download>Résumé</a></li>
          </ul>
        </Band>
      </main>

      <Ocean />
    </>
  );
}
