import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="font-serif text-lg text-text">{title}</p>
      {description && <p className="max-w-prose text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}
