import { Eye } from "../lib/animated-icons";
import { useEffect, useState } from "react";

/** How often an open tab says "still here". The server forgets a tab after 45s of silence. */
const PING_MS = 20_000;

/** Local dev has no /api functions, so it shows this made-up count instead, to see the look. */
const DEV_COUNT = 3;

/** A random id per browser tab (kept for the tab's life, so reloads don't count twice). */
function tabId(): string {
  try {
    const k = "online-id";
    const have = sessionStorage.getItem(k);
    if (have) return have;
    const id = crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem(k, id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
  }
}

/**
 * "3 online": how many people have the page open right now. Pings
 * /api/online while the tab is visible, and says goodbye when it's hidden or
 * closed. Shows nothing until the first count arrives, or at all if the
 * count isn't set up. In local dev it shows a fixed DEV_COUNT instead.
 */
export default function OnlineNow() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setCount(DEV_COUNT);
      return;
    }
    const id = tabId();
    let timer = 0;
    let dead = false;

    const ping = async () => {
      try {
        const r = await fetch("/api/online", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        if (!r.ok) return;
        const { online } = await r.json();
        if (!dead && typeof online === "number") setCount(Math.max(1, online));
      } catch {
        /* offline or not set up: stay hidden */
      }
    };
    const leave = () => {
      try {
        navigator.sendBeacon?.("/api/online", new Blob([JSON.stringify({ id, leave: true })], { type: "application/json" }));
      } catch {
        /* ignore */
      }
    };
    const start = () => {
      window.clearInterval(timer);
      ping();
      timer = window.setInterval(ping, PING_MS);
    };
    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(timer);
        leave();
      } else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);
    return () => {
      dead = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  if (count === null) return null;
  return (
    <span className="online" title="People on this page right now">
      <Eye className="online__eye" size={14} strokeWidth={1.8} aria-hidden="true" />
      {count} online
    </span>
  );
}
