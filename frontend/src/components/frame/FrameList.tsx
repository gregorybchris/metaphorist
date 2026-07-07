import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { frames } from "@/data";
import { entityPath, frameDisplayName, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Frame } from "@/types";
import { EmptyState } from "@/components/primitives/EmptyState";

function matchesQuery(frame: Frame, query: string): boolean {
  if (!query) return true;
  if (frameDisplayName(frame.name).toLowerCase().includes(query)) return true;
  if (frame.name.toLowerCase().includes(query)) return true;
  if (frame.frame_type?.some((t) => t.toLowerCase().includes(query))) return true;
  if (frame.lexical_units?.some((lu) => lu.toLowerCase().includes(query))) return true;
  return false;
}

export function FrameList({ activeName }: { activeName?: string }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return frames.filter((f) => matchesQuery(f, q));
  }, [query]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 12,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border bg-surface p-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter frames…"
            className="w-full rounded-md border border-border bg-bg py-1.5 pr-3 pl-8 text-sm text-text placeholder:text-text-faint focus:ring-2 focus:ring-clay-500 focus:outline-none"
          />
        </div>
        <p className="mt-2 text-xs text-text-faint">{pluralize(filtered.length, "frame")}</p>
      </div>

      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No frames match" description="Try a different search term." />
          </div>
        ) : (
          <div
            style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const frame = filtered[virtualRow.index];
              const isActive = frame.name === activeName;
              return (
                <Link
                  key={frame.name}
                  to={entityPath("frame", frame.name)}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={cn(
                    "flex items-center border-b border-border px-4 py-2.5 hover:bg-surface-hover",
                    isActive && "bg-clay-50 dark:bg-clay-900/40",
                  )}
                >
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      isActive ? "text-clay-800 dark:text-clay-200" : "text-text",
                    )}
                  >
                    {frameDisplayName(frame.name)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
