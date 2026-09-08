"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PERSON } from "@/lib/site";
import {
  STACK_LINES,
  SKILLS,
  EXPERIENCE,
  PROJECTS,
  PROJECT_LINKS,
  RECOGNITION,
  EDUCATION,
  INDUSTRIES,
  IMPACT,
  STATS,
  SUMMARY,
  STATUS,
} from "@/lib/content";

/**
 * The skills terminal, expandable into an interactive console.
 *
 * Every command reads from lib/content.ts — the same source the rest of the
 * page renders from — so the console can never drift from the site or answer
 * with anything that is not already published here. There is no free-text
 * fallback and nothing is generated: an unknown command says so.
 *
 * The static block passed as children stays exactly as it was and is what the
 * server renders, so the stack list remains crawlable text. The expand button
 * is only added after mount, so with scripting off there is no dead control.
 *
 * Uses a native <dialog> with showModal(), which brings focus trapping, Esc to
 * close, inertness of the page behind it, and return focus for free — all of
 * which are easy to get subtly wrong by hand.
 */

type Tone = "ok" | "dim" | "err" | "head" | "cmd";
type Line = { text: string; tone?: Tone; href?: string };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec",
];

const when = (d?: { from: string; to?: string }) => {
  if (!d) return "";
  const fmt = (iso: string) => {
    const [y, m] = iso.split("-");
    return `${MONTHS[Number(m) - 1]} ${y}`;
  };
  if (d.to === d.from) return fmt(d.from);
  return `${fmt(d.from)} – ${d.to ? fmt(d.to) : "Present"}`;
};

/** Strips the {link} placeholder so bullet copy reads cleanly as plain text. */
const flat = (text: string, linkText?: string) =>
  text.replace("{link}", linkText ?? "").replace(/\s+/g, " ").trim();

const COMMANDS: Record<string, { blurb: string; run: () => Line[] }> = {
  help: {
    blurb: "list everything you can type",
    run: () => [
      { text: "Available commands", tone: "head" },
      ...Object.entries(COMMANDS).map(([name, c]) => ({
        text: `  ${name.padEnd(12)}${c.blurb}`,
        tone: "dim" as Tone,
      })),
      { text: "" },
      { text: "  Tab completes · ↑ ↓ history · Esc closes", tone: "dim" },
    ],
  },

  whoami: {
    blurb: "the short version",
    run: () => [
      { text: PERSON.name, tone: "head" },
      { text: PERSON.title },
      { text: `${PERSON.location} · ${STATUS}`, tone: "dim" },
      { text: "" },
      { text: SUMMARY, tone: "dim" },
    ],
  },

  stack: {
    blurb: "the runtime stack I build on",
    run: () => [
      { text: "Stack", tone: "head" },
      ...STACK_LINES.flatMap((l) => [
        { text: `✔ ${l.ok}`, tone: "ok" as Tone },
        { text: `    ${l.text}`, tone: "dim" as Tone },
      ]),
    ],
  },

  skills: {
    blurb: "languages, frameworks, data and cloud",
    run: () =>
      SKILLS.flatMap((s) => [
        { text: s.label, tone: "head" as Tone },
        { text: `  ${s.value}`, tone: "dim" as Tone },
      ]),
  },

  experience: {
    blurb: "roles, newest first",
    run: () =>
      EXPERIENCE.flatMap((e) => [
        { text: e.role, tone: "head" as Tone },
        { text: `  ${e.org}`, tone: "ok" as Tone },
        { text: `  ${[e.meta, when(e.dates)].filter(Boolean).join(" · ")}`, tone: "dim" as Tone },
        ...(e.points ?? []).map((p) => ({
          text: `  · ${p.lead ? `${p.lead} — ` : ""}${flat(p.text, p.linkText)}`,
          tone: "dim" as Tone,
        })),
        { text: "" },
      ]),
  },

  projects: {
    blurb: "things I have shipped",
    run: () =>
      PROJECTS.flatMap((p) => [
        { text: p.role, tone: "head" as Tone },
        { text: `  ${p.meta}`, tone: "dim" as Tone },
        ...(p.points ?? []).map((b) => ({
          text: `  · ${flat(b.text, b.linkText)}`,
          tone: "dim" as Tone,
        })),
        ...(PROJECT_LINKS[p.role] || p.orgHref
          ? [{ text: `  ${PROJECT_LINKS[p.role] ?? p.orgHref}`, href: PROJECT_LINKS[p.role] ?? p.orgHref }]
          : []),
        { text: "" },
      ]),
  },

  impact: {
    blurb: "measured reductions, with their context",
    run: () => [
      { text: "Each from a different project — same unit, not one series.", tone: "dim" },
      { text: "" },
      ...IMPACT.flatMap((d) => [
        { text: `${String(d.value).padStart(3)}%  ${d.metric}`, tone: "ok" as Tone },
        { text: `      ${d.context}`, tone: "dim" as Tone },
      ]),
    ],
  },

  stats: {
    blurb: "the headline numbers",
    run: () =>
      STATS.map((s) => ({ text: `${s.value.padEnd(10)}${s.label}`, tone: "ok" as Tone })),
  },

  industries: {
    blurb: "domains I have delivered in",
    run: () => INDUSTRIES.map((n) => ({ text: `· ${n}`, tone: "dim" as Tone })),
  },

  awards: {
    blurb: "recognition",
    run: () =>
      RECOGNITION.flatMap((r) => [
        { text: r.title, tone: "head" as Tone },
        { text: `  ${r.body}`, tone: "dim" as Tone },
      ]),
  },

  education: {
    blurb: "degree",
    run: () => [
      { text: EDUCATION.role, tone: "head" },
      { text: `  ${EDUCATION.org}`, tone: "ok" },
      { text: `  ${when(EDUCATION.dates)}`, tone: "dim" },
    ],
  },

  contact: {
    blurb: "how to reach me",
    run: () => [
      { text: PERSON.email, href: `mailto:${PERSON.email}` },
      { text: PERSON.github, href: PERSON.github },
      { text: PERSON.linkedin, href: PERSON.linkedin },
    ],
  },

  resume: {
    blurb: "download the PDF",
    run: () => [{ text: `Download ${PERSON.resume}`, href: PERSON.resume }],
  },

  clear: { blurb: "clear the screen", run: () => [] },
};

const NAMES = Object.keys(COMMANDS);

const BANNER: Line[] = [
  { text: `${PERSON.name} — interactive console`, tone: "head" },
  { text: "Type help to see what this knows about me.", tone: "dim" },
  { text: "" },
];

export default function Console({ children }: { children: React.ReactNode }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const feed = useRef<HTMLDivElement>(null);

  // Rendered only after mount, so a scripting-off page never shows a control
  // that cannot do anything.
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);

  useEffect(() => setReady(true), []);

  const open = useCallback(() => {
    dlg.current?.showModal();
    // showModal() displays synchronously, so focus directly. Deferring this to
    // requestAnimationFrame would leave the caret unset whenever the frame loop
    // is throttled — a backgrounded tab, for one.
    input.current?.focus();
  }, []);

  const close = useCallback(() => {
    dlg.current?.close();
  }, []);

  // Note: background scroll is locked from CSS, keyed off dialog[open], rather
  // than by setting body.style.overflow here. The dialog can be dismissed three
  // ways — this button, Esc, and the backdrop — and only the first runs our
  // code, so any JS-held lock leaks the moment someone presses Esc. Letting the
  // [open] attribute drive it means there is no state to restore and nothing to
  // leak.

  // Keep the newest output in view.
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight });
  }, [lines]);

  const submit = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    history.current = [cmd, ...history.current.filter((h) => h !== cmd)].slice(0, 40);
    cursor.current = -1;

    // Accept flags like "stack --list" so what the static block shows is a
    // command the console genuinely answers.
    const name = cmd.split(/\s+/)[0].toLowerCase();
    const echo: Line = { text: `$ ${cmd}`, tone: "cmd" };

    if (name === "clear") {
      setLines([]);
      setValue("");
      return;
    }

    const entry = COMMANDS[name];
    setLines((prev) => [
      ...prev,
      echo,
      ...(entry
        ? entry.run()
        : [
            { text: `${name}: not found`, tone: "err" as Tone },
            { text: "Type help for the list.", tone: "dim" as Tone },
          ]),
      { text: "" },
    ]);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(value);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const head = value.trim().toLowerCase();
      if (!head) return;
      const hit = NAMES.filter((n) => n.startsWith(head));
      if (hit.length === 1) setValue(hit[0]);
      else if (hit.length > 1) {
        setLines((prev) => [...prev, { text: `$ ${value}`, tone: "cmd" }, { text: hit.join("  "), tone: "dim" }, { text: "" }]);
      }
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!history.current.length) return;
      e.preventDefault();
      const next =
        e.key === "ArrowUp"
          ? Math.min(cursor.current + 1, history.current.length - 1)
          : Math.max(cursor.current - 1, -1);
      cursor.current = next;
      setValue(next === -1 ? "" : history.current[next]);
    }
  };

  return (
    <>
      <div className="term-wrap">
        {children}
        {ready ? (
          <button type="button" className="term__expand" onClick={open}>
            Open console
          </button>
        ) : null}
      </div>

      <dialog ref={dlg} className="cons" aria-label="Interactive console">
        <div className="cons__bar">
          <i /><i /><i />
          <span>~/shubham — console</span>
          <button type="button" className="cons__x" onClick={close} aria-label="Close console">
            ✕
          </button>
        </div>

        <div className="cons__feed" ref={feed} role="log" aria-live="polite">
          {lines.map((l, i) => (
            <div key={i} className={l.tone ? `cons__l cons__l--${l.tone}` : "cons__l"}>
              {l.href ? (
                <a
                  className="link"
                  href={l.href}
                  {...(l.href === PERSON.resume ? { download: true } : {})}
                >
                  {l.text}
                </a>
              ) : (
                l.text || " "
              )}
            </div>
          ))}
        </div>

        {/* A form so Enter submits natively; method=dialog would close it, so
            the handler owns submission instead. */}
        <form
          className="cons__in"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <label htmlFor="cons-input" className="cons__prompt" aria-label="Command">
            $
          </label>
          <input
            id="cons-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="help"
          />
        </form>
      </dialog>
    </>
  );
}
