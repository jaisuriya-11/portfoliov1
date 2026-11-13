import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { profile } from "../data/profile";
import { toggleTheme, useTheme } from "../lib/theme";
import { Icon } from "./icons";

interface Command {
  label: string;
  icon: () => ReactNode;
  run: () => void;
}

/** ⌘K / Ctrl+K palette (shadcn Command): jump to a section, open a link, flip the theme. */
export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const theme = useTheme();

  const show = () => {
    setSections([...document.querySelectorAll<HTMLElement>("section[data-index]")].map((s) => ({ id: s.id, title: s.dataset.index! })));
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) setSections([...document.querySelectorAll<HTMLElement>("section[data-index]")].map((s) => ({ id: s.id, title: s.dataset.index! })));
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups: [string, Command[]][] = [
    ["Go to", sections.map((s) => ({ label: s.title, icon: Icon.hash, run: () => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }) }))],
    [
      "Links",
      profile.socials.map((s) => ({
        label: s.label,
        icon: Icon[s.icon],
        run: () => (s.icon === "mail" ? (location.href = s.href) : window.open(s.href, "_blank", "noreferrer")),
      })),
    ],
    [
      "Actions",
      [
        { label: "Copy email", icon: Icon.copy, run: () => navigator.clipboard?.writeText(profile.email) },
        { label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme", icon: Icon.sun, run: () => toggleTheme() },
      ],
    ],
  ];

  return (
    <>
      <Button variant="outline" size="sm" className="kbd h-7 gap-1 px-2 font-mono text-[11px] font-normal text-muted-foreground" aria-label="Open command menu" onClick={show}>
        <span aria-hidden="true">⌘</span>K
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description="Jump to a section, open a link, or run an action">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {groups.map(([heading, items]) => (
            <CommandGroup key={heading} heading={heading}>
              {items.map((c) => (
                <CommandItem
                  key={c.label}
                  value={`${heading} ${c.label}`}
                  onSelect={() => {
                    setOpen(false);
                    c.run();
                  }}
                >
                  {c.icon()}
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
