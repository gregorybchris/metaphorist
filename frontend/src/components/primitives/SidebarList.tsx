import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { displayName, entityPath } from "@/lib/format";
import type { EntityKind } from "@/types";

/**
 * Shared master-list chrome for the /metaphors and /frames sidebars: a
 * serif title + total count, a search input below it, and compact
 * single-line rows tinted by entity kind (metaphor -> indigo, frame ->
 * clay, matching EntityLink/EntityChip's tone convention).
 */
export function SidebarListHeader({
  title,
  count,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  count: number;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-surface p-3">
      <p className="mb-2 font-serif text-lg text-text">
        {title} <span className="font-sans text-sm text-text-muted">({count})</span>
      </p>
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-faint"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-bg py-1.5 pr-3 pl-8 text-sm text-text placeholder:text-text-faint focus:ring-2 focus:ring-clay-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

const ROW_ACTIVE_BG: Record<EntityKind, string> = {
  metaphor: "bg-indigo-50 dark:bg-indigo-900/30",
  frame: "bg-clay-50 dark:bg-clay-900/40",
};

const ROW_ACTIVE_TEXT: Record<EntityKind, string> = {
  metaphor: "text-indigo-800 dark:text-indigo-200",
  frame: "text-clay-800 dark:text-clay-200",
};

type SidebarListRowProps = {
  kind: EntityKind;
  name: string;
  active: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "to" | "className">;

/** A single compact, truncated, single-line row in a master list. */
export const SidebarListRow = forwardRef<HTMLAnchorElement, SidebarListRowProps>(
  function SidebarListRow({ kind, name, active, ...linkProps }, ref) {
    return (
      <Link
        ref={ref}
        to={entityPath(kind, name)}
        className={cn(
          "flex items-center border-b border-border px-4 py-2.5 hover:bg-surface-hover",
          active && ROW_ACTIVE_BG[kind],
        )}
        {...linkProps}
      >
        <span
          className={cn(
            "truncate font-serif text-[15px] text-text",
            active && ROW_ACTIVE_TEXT[kind],
          )}
        >
          {displayName(kind, name)}
        </span>
      </Link>
    );
  },
);
