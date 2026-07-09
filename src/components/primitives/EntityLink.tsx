import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { displayName, entityPath } from "../../lib/format";
import type { EntityKind } from "../../types";

/**
 * `tone` is normally implied by `kind` (metaphor -> indigo, frame -> clay).
 * Pass an explicit "source" | "target" tone when rendering a *frame* in a
 * mapping's source/target position — that overrides the frame default so
 * source stays clay and target borrows metaphor's indigo, visually encoding
 * the concrete -> abstract direction.
 */
export type EntityTone = "metaphor" | "frame" | "source" | "target";

function toneFor(kind: EntityKind, tone?: EntityTone): EntityTone {
  return tone ?? kind;
}

const TEXT_TONE: Record<EntityTone, string> = {
  metaphor: "text-indigo-700 dark:text-indigo-300",
  frame: "text-clay-700 dark:text-clay-300",
  source: "text-clay-700 dark:text-clay-300",
  target: "text-indigo-700 dark:text-indigo-300",
};

const CHIP_TONE: Record<EntityTone, string> = {
  metaphor:
    "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/70",
  frame:
    "bg-clay-50 text-clay-800 hover:bg-clay-100 dark:bg-clay-900/40 dark:text-clay-200 dark:hover:bg-clay-900/70",
  source:
    "bg-clay-50 text-clay-800 hover:bg-clay-100 dark:bg-clay-900/40 dark:text-clay-200 dark:hover:bg-clay-900/70",
  target:
    "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/70",
};

interface EntityLinkProps {
  kind: EntityKind;
  name: string;
  tone?: EntityTone;
  className?: string;
}

/** Inline text link — for use inside prose, tables, lists. */
export function EntityLink({ kind, name, tone, className }: EntityLinkProps) {
  const t = toneFor(kind, tone);
  return (
    <Link
      to={entityPath(kind, name)}
      title={name}
      className={cn(
        "font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid",
        TEXT_TONE[t],
        className,
      )}
    >
      {displayName(kind, name)}
    </Link>
  );
}

/** Pill-shaped clickable chip — for entity cross-reference lists and search results. */
export function EntityChip({ kind, name, tone, className }: EntityLinkProps) {
  const t = toneFor(kind, tone);
  return (
    <Link
      to={entityPath(kind, name)}
      title={name}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium transition-colors",
        CHIP_TONE[t],
        className,
      )}
    >
      {displayName(kind, name)}
    </Link>
  );
}
