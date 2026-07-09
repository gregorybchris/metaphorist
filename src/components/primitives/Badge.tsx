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

// Dark-mode fills use a mid-tone (-400) at low opacity rather than a
// near-black (-900) shade: -900 sits almost at the same luminance as the
// dark page background, so blending it in at any opacity is nearly
// invisible — the badge reads as bare text with no pill behind it.
const TONE_CLASSES: Record<BadgeTone, string> = {
  clay: "bg-clay-100 text-clay-800 dark:bg-clay-400/40 dark:text-clay-100",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/40 dark:text-indigo-100",
  moss: "bg-moss-100 text-moss-800 dark:bg-moss-400/40 dark:text-moss-100",
  neutral: "bg-surface-hover text-text-muted",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/40 dark:text-teal-100",
  garnet:
    "bg-garnet-100 text-garnet-800 dark:bg-garnet-400/40 dark:text-garnet-100",
  fern: "bg-fern-100 text-fern-800 dark:bg-fern-400/40 dark:text-fern-100",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/40 dark:text-amber-100",
  azure:
    "bg-azure-100 text-azure-800 dark:bg-azure-400/40 dark:text-azure-100",
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
