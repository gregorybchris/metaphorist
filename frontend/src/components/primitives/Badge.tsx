import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone =
  | "clay"
  | "indigo"
  | "moss"
  | "neutral"
  | "teal"
  | "garnet"
  | "fern"
  | "amber"
  | "azure";

const TONE_CLASSES: Record<BadgeTone, string> = {
  clay: "bg-clay-100 text-clay-800 dark:bg-clay-900/50 dark:text-clay-200",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  moss: "bg-moss-100 text-moss-800 dark:bg-moss-900/50 dark:text-moss-200",
  neutral: "bg-surface-hover text-text-muted",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
  garnet:
    "bg-garnet-100 text-garnet-800 dark:bg-garnet-900/50 dark:text-garnet-200",
  fern: "bg-fern-100 text-fern-800 dark:bg-fern-900/50 dark:text-fern-200",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  azure:
    "bg-azure-100 text-azure-800 dark:bg-azure-900/50 dark:text-azure-200",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
