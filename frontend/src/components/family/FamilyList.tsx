import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { entityPath, pluralize } from "@/lib/format";
import type { EntityKind } from "@/types";

export interface FamilyListEntry {
  name: string;
  members: string[];
}

/**
 * Filterable list rail shared by MetaphorFamilyListPage and
 * FrameFamilyListPage — a search box over a plain, alphabetical list of
 * families, each row showing the name plus its member count.
 */
export function FamilyList({
  kind,
  families,
  activeName,
  searchPlaceholder,
}: {
  kind: Extract<EntityKind, "metaphor-family" | "frame-family">;
  families: FamilyListEntry[];
  activeName?: string;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return families;
    return families.filter((f) => f.name.toLowerCase().includes(q));
  }, [families, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-surface p-3">
        <label className="flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5">
          <Search size={14} className="shrink-0 text-text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
        </label>
      </div>
      <ul className="min-h-0 flex-1">
        {filtered.map((f) => {
          const isActive = f.name === activeName;
          return (
            <li key={f.name}>
              <Link
                to={entityPath(kind, f.name)}
                className={cn(
                  "flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-sm hover:bg-surface-hover",
                  isActive && "bg-surface-hover",
                )}
              >
                <span className="truncate font-medium text-text">{f.name}</span>
                <span className="shrink-0 text-xs text-text-muted">
                  {pluralize(f.members.length, "member")}
                </span>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-text-muted">
            No families match "{query}".
          </li>
        )}
      </ul>
    </div>
  );
}
