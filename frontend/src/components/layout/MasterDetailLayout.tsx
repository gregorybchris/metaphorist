import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * The list+detail pattern used by every browsable collection (metaphors,
 * frames, both family kinds): a scrollable list rail stays mounted while an
 * entry's detail renders alongside it, so exploring many entries in
 * sequence never loses your place in the list. On narrow screens the two
 * collapse to a single pane — list only, or detail-with-back-link only —
 * driven purely by whether `detail` is non-null (i.e. whether the route has
 * a :name param).
 */
export function MasterDetailLayout({
  list,
  detail,
  backTo,
  emptyDetailHint = "Select an entry from the list to explore it.",
  listWidthClassName = "md:w-96",
}: {
  list: ReactNode;
  detail: ReactNode | null;
  backTo: string;
  emptyDetailHint?: ReactNode;
  listWidthClassName?: string;
}) {
  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          "min-h-0 shrink-0 flex-col overflow-y-auto border-r border-border",
          listWidthClassName,
          detail ? "hidden md:flex" : "flex w-full",
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          detail ? "block" : "hidden md:block",
        )}
      >
        {detail && (
          <Link
            to={backTo}
            className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-border bg-surface px-4 py-2.5 text-sm text-text-muted hover:text-text md:hidden"
          >
            <ArrowLeft size={14} /> Back to list
          </Link>
        )}
        {detail ?? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="max-w-sm font-serif text-lg text-text-muted">
              {emptyDetailHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
