import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
