import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  bordered = true,
  children,
  className,
}: {
  title: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  bordered?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cn("group py-4 first:pt-0", bordered && "border-b border-border", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 select-none">
        <ChevronRight
          size={16}
          className="shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-90"
        />
        <span className="font-serif text-lg text-text">{title}</span>
        {typeof count === "number" && (
          <span className="text-sm text-text-muted">{count}</span>
        )}
      </summary>
      <div className="mt-3 pl-6">{children}</div>
    </details>
  );
}
