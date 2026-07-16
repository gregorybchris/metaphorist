import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import { CircleX, Search, Star } from "lucide-react";
import { MetaphorName } from "@/components/primitives/MetaphorName";
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
          className={cn(
            "w-full rounded-md border border-border bg-bg py-1.5 pl-8 text-sm text-text placeholder:text-text-faint focus:ring-2 focus:ring-clay-500 focus:outline-none",
            value ? "pr-8" : "pr-3",
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear filter"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-faint hover:text-text"
          >
            <CircleX size={14} />
          </button>
        )}
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
  starred?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "to" | "className">;

/** A single compact, truncated, single-line row in a master list. */
export const SidebarListRow = forwardRef<HTMLAnchorElement, SidebarListRowProps>(
  function SidebarListRow({ kind, name, active, starred, ...linkProps }, ref) {
    return (
      <Link
        ref={ref}
        to={entityPath(kind, name)}
        className={cn(
          "flex items-center gap-2 border-b border-border px-4 py-2.5 hover:bg-surface-hover",
          active && ROW_ACTIVE_BG[kind],
        )}
        {...linkProps}
      >
        {kind === "metaphor" ? (
          <MetaphorName
            name={name}
            className={cn(
              "min-w-0 flex-1 truncate font-serif text-[15px] text-text",
              active && ROW_ACTIVE_TEXT[kind],
            )}
          />
        ) : (
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-serif text-[15px] text-text",
              active && ROW_ACTIVE_TEXT[kind],
            )}
          >
            {displayName(kind, name)}
          </span>
        )}
        {starred && (
          <Star
            size={13}
            strokeWidth={1.5}
            // A literal, saturated gold — the app's `amber` scale is deliberately
            // muted to match the archival palette, which reads as grayish here.
            className="shrink-0 fill-[#d4af37] text-[#d4af37]"
            aria-label="Favorited"
          />
        )}
      </Link>
    );
  },
);
