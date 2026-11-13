import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  title: string;
}

/** "Index" list in the right margin; highlights the section being read. */
export default function IndexNav() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("section[data-index]")];
    setEntries(sections.map((s) => ({ id: s.id, title: s.dataset.index! })));
    setActive(sections[0]?.id ?? "");

    // A section counts as current once its top passes 35% down the viewport.
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) if (r.isIntersecting) setActive(r.target.id);
      },
      { rootMargin: "-35% 0px -64% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Sections above the one being read count as "read": their ticks fill in.
  const activeAt = entries.findIndex((e) => e.id === active);

  return (
    <aside className="index" aria-label="Index">
      <div className="index__inner">
        <ul>
          {entries.map((e, i) => (
            <li key={e.id} className={cn(i < activeAt && "is-past")}>
              <a href={`#${e.id}`} data-sec={e.id} className={cn(active === e.id && "is-active")} aria-current={active === e.id ? "location" : undefined}>
                {e.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
