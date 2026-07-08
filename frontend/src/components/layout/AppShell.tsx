import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { SearchPalette } from "../search/SearchPalette";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/metaphors", label: "Metaphors" },
  { to: "/frames", label: "Frames" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Link to="/metaphors" className="shrink-0 font-serif text-xl text-text italic">
          Metaphor Atlas
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 font-medium text-text-muted hover:bg-surface-hover hover:text-text",
                  isActive && "bg-surface-hover text-text",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text sm:w-64"
          >
            <Search size={15} />
            <span className="hidden sm:mr-auto sm:inline">Search</span>
            <kbd className="hidden rounded border border-border px-1 font-mono text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <nav className="flex flex-col border-b border-border px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text",
                  isActive && "bg-surface-hover text-text",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
