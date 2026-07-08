import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { entityPath, metaphorDisplayName } from "@/lib/format";
import type { Metaphor } from "@/types";

export function MetaphorListRow({
  metaphor,
  selected,
}: {
  metaphor: Metaphor;
  selected: boolean;
}) {
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
      <p className="line-clamp-2 font-serif text-[15px] leading-snug text-text">
        {name}
      </p>
    </Link>
  );
}
