import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { entityPath, metaphorDisplayName } from "@/lib/format";
import type { Metaphor } from "@/types";

/**
 * A row leads with an example sentence when one exists — that's what gives a
 * reader an intuition for the metaphor, faster than the formal name does.
 * The name is always present too, but as a small caption underneath, not
 * the headline.
 */
export function MetaphorListRow({
  metaphor,
  selected,
}: {
  metaphor: Metaphor;
  selected: boolean;
}) {
  const example = metaphor.examples?.[0];
  const name = metaphorDisplayName(metaphor.name);

  return (
    <Link
      to={entityPath("metaphor", metaphor.name)}
      className={cn(
        "block border-b border-l-2 border-border px-4 py-3.5 transition-colors last:border-b-0",
        selected
          ? "border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
          : "border-l-transparent hover:bg-surface-hover",
      )}
    >
      {example ? (
        <>
          <p className="line-clamp-2 font-serif text-[15px] leading-snug text-text italic">
            “{example}”
          </p>
          <p className="mt-1.5 truncate text-xs text-text-muted">{name}</p>
        </>
      ) : (
        <p className="line-clamp-2 font-serif text-[15px] leading-snug text-text">
          {name}
        </p>
      )}
    </Link>
  );
}
