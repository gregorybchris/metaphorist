import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone = "clay" | "indigo" | "moss" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  clay: "bg-clay-100 text-clay-800 dark:bg-clay-900/50 dark:text-clay-200",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  moss: "bg-moss-100 text-moss-800 dark:bg-moss-900/50 dark:text-moss-200",
  neutral: "bg-surface-hover text-text-muted",
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
