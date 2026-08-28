"use client";

import { useEffect, useState } from "react";

/**
 * Local time in Delhi.
 *
 * Renders nothing until mounted. A server-rendered timestamp would differ from
 * the client's first paint by definition — that is the same class of hydration
 * mismatch that the injected `.js` class used to cause, so the initial render
 * must be empty on both sides.
 */
export default function Clock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date()),
      );

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="clock">
      <span className="clock__time" suppressHydrationWarning>
        {now ?? "--:--:--"}
      </span>
      <span className="clock__zone">IST · UTC+5:30</span>
    </span>
  );
}
