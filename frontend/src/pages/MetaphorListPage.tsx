import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { MetaphorDetail } from "@/components/metaphor/MetaphorDetail";
import { MetaphorListRow } from "@/components/metaphor/MetaphorListRow";
import { EmptyState } from "@/components/primitives/EmptyState";
import { metaphorByName, metaphors } from "@/data";
import { entityPath, frameDisplayName, metaphorDisplayName } from "@/lib/format";
import type { Metaphor } from "@/types";

function searchableText(m: Metaphor): string {
  return [
    metaphorDisplayName(m.name),
    m.name,
    m.source_frame ? frameDisplayName(m.source_frame) : "",
    m.source_frame ?? "",
    m.target_frame ? frameDisplayName(m.target_frame) : "",
    m.target_frame ?? "",
    ...(m.families ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Handles both /metaphors and /metaphors/:name — the app's flagship browse
 * page. With no :name (including the app's root redirect) it lands on the
 * first metaphor rather than showing an empty "nothing selected" pane, so
 * there's always something to read.
 */
export function MetaphorListPage() {
  const { name } = useParams();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return metaphors;
    return metaphors.filter((m) => searchableText(m).includes(q));
  }, [filter]);

  if (!name) {
    return <Navigate to={entityPath("metaphor", metaphors[0].name)} replace />;
  }

  const selected = metaphorByName.get(name);

  return (
    <MasterDetailLayout
      backTo="/metaphors"
      list={
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 border-b border-border bg-surface p-3">
            <p className="mb-2 font-serif text-lg text-text">
              Metaphors <span className="font-sans text-sm text-text-muted">({metaphors.length})</span>
            </p>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-faint"
              />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name, frame, or family…"
                className="w-full rounded-md border border-border bg-bg py-1.5 pr-2 pl-8 text-sm text-text placeholder:text-text-faint focus:ring-2 focus:ring-clay-500 focus:outline-none"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No matches" description="Try a different search term." />
            </div>
          ) : (
            <div>
              {filtered.map((m) => (
                <MetaphorListRow key={m.name} metaphor={m} selected={m.name === name} />
              ))}
            </div>
          )}
        </div>
      }
      detail={
        selected ? (
          <MetaphorDetail metaphor={selected} />
        ) : (
          <div className="p-8">
            <EmptyState
              title="Metaphor not found"
              description={`No metaphor named "${name}" exists in this dataset.`}
            />
          </div>
        )
      }
    />
  );
}
