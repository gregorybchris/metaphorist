import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** The raw ontology identifier — SCREAMING_SNAKE_CASE metaphor names, kebab-case
 * frame names, snake_case roles. Rendered in the mono utility face so it reads
 * as a literal symbolic token, distinct from editorial prose. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code className={cn("font-mono text-[0.85em] text-text-muted", className)}>
      {children}
    </code>
  );
}
