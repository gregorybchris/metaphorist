import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { frames } from "@/data";
import { frameDisplayName } from "@/lib/format";
import type { Frame } from "@/types";
import { EmptyState } from "@/components/primitives/EmptyState";
import { SidebarListHeader, SidebarListRow } from "@/components/primitives/SidebarList";

function matchesQuery(frame: Frame, query: string): boolean {
  if (!query) return true;
  if (frameDisplayName(frame.name).toLowerCase().includes(query)) return true;
  if (frame.name.toLowerCase().includes(query)) return true;
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
      <SidebarListHeader
        title="Frames"
        count={filtered.length}
        value={query}
        onChange={setQuery}
        placeholder="Filter frames…"
      />

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
              return (
                <SidebarListRow
                  key={frame.name}
                  kind="frame"
                  name={frame.name}
                  active={frame.name === activeName}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
