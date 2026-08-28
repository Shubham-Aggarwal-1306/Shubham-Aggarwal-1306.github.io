"use client";

import { useEffect } from "react";
import { PERSON } from "@/lib/site";

/**
 * Newspaper-masthead intro that tears open to reveal the page.
 *
 * Deliberately CSS-driven. The whole sequence — bounce in, hold, tear, dismiss —
 * runs as keyframes with `animation-fill-mode: forwards`, so it completes and
 * gets out of the way even if this component's JavaScript never executes. A
 * loader that depends on JS to dismiss itself will strand visitors behind it the
 * first time a script fails.
 *
 * JS only adds the nice-to-haves: skipping it on repeat visits within a session,
 * and letting Escape or a click cut it short.
 *
 * It is aria-hidden and the real page sits beneath it in the DOM the whole time,
 * so screen readers and crawlers are unaffected. Under prefers-reduced-motion
 * the CSS removes it entirely.
 */

const MASTHEAD = "Shubham Aggarwal";

export default function Intro() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".tear");
    if (!el) return;

    // Plays on every load, by request. The full sequence is a fixed CSS
    // timeline, so a fast connection cannot cut it short — the page being ready
    // early just means it is already painted behind the sheet when it tears.
    //
    // Escape or a click still skips it: forcing someone to sit through an
    // intro with no way out is the part that actually annoys people.
    const cut = () => el.classList.add("is-skipped");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cut();
    };

    el.addEventListener("click", cut);
    addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("click", cut);
      removeEventListener("keydown", onKey);
    };
  }, []);

  const half = (side: "l" | "r") => (
    <div className={`tear__half tear__half--${side}`}>
      <div className="tear__sheet">
        <p className="tear__rule tear__rule--top">
          <span>Portfolio Edition</span>
        </p>
        <h2 className="tear__name" aria-hidden="true">
          {MASTHEAD.split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${0.04 * i}s` }}>
              {c === " " ? " " : c}
            </span>
          ))}
        </h2>
        <p className="tear__rule tear__rule--bottom">
          <span>{PERSON.title}</span>
          <span>{PERSON.location}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="tear" aria-hidden="true">
      {half("l")}
      {half("r")}
    </div>
  );
}
