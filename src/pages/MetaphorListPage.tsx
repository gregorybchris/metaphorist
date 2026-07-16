import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { MetaphorDetail } from "@/components/metaphor/MetaphorDetail";
import { EmptyState } from "@/components/primitives/EmptyState";
import { SidebarListHeader, SidebarListRow } from "@/components/primitives/SidebarList";
import { metaphorByName, metaphors, stats } from "@/data";
import { ratings } from "@/lib/curation";
import { entityPath, metaphorDisplayName, metaphorNameFromSlug } from "@/lib/format";
import {
  DEFAULT_DESCRIPTION,
  metaphorDescription,
  metaphorJsonLd,
  metaphorTitle,
  pageTitle,
} from "@/lib/seo";
import { useDocumentHead } from "@/lib/useDocumentHead";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Metaphor } from "@/types";

function matchesQuery(m: Metaphor, query: string): boolean {
  if (!query) return true;
  return (
    metaphorDisplayName(m.name).toLowerCase().includes(query) ||
    m.name.toLowerCase().includes(query)
  );
}

/**
 * Handles both /metaphors and /metaphors/:name — the app's flagship browse
 * page. With no :name, desktop lands on the first metaphor rather than
 * showing an empty "nothing selected" pane, so there's always something to
 * read. Mobile stays on the list instead — otherwise navigating here (e.g.
 * via the mobile "Back to list" link) would immediately redirect right back
 * into a detail view.
 */
export function MetaphorListPage() {
  const { name: slug } = useParams();
  const name = slug ? metaphorNameFromSlug(slug) : undefined;
  const [filter, setFilter] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return metaphors.filter((m) => matchesQuery(m, q));
  }, [filter]);

  const selected = name ? metaphorByName.get(name) : undefined;

  useDocumentHead(
    selected
      ? {
          title: metaphorTitle(selected),
          description: metaphorDescription(selected),
          path: entityPath("metaphor", selected.name),
          type: "article",
          jsonLd: metaphorJsonLd(selected, entityPath("metaphor", selected.name)),
        }
      : name
        ? {
            title: pageTitle("Metaphor not found"),
            description: DEFAULT_DESCRIPTION,
            path: "/metaphors",
            noindex: true,
          }
        : {
            title: pageTitle("Metaphors"),
            description: `Browse all ${stats.metaphorCount} conceptual metaphors in the Metaphorist dataset.`,
            path: "/metaphors",
          },
  );

  if (!name && isDesktop) {
    return <Navigate to={entityPath("metaphor", metaphors[0].name)} replace />;
  }

  return (
    <MasterDetailLayout
      backTo="/metaphors"
      list={
        <div className="flex h-full flex-col">
          <SidebarListHeader
            title="Metaphors"
            count={filtered.length}
            value={filter}
            onChange={setFilter}
            placeholder="Filter metaphors…"
          />
          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No matches" description="Try a different search term." />
            </div>
          ) : (
            <div>
              {filtered.map((m) => (
                <SidebarListRow
                  key={m.name}
                  kind="metaphor"
                  name={m.name}
                  active={m.name === name}
                  starred={ratings[m.name] === "up"}
                />
              ))}
            </div>
          )}
        </div>
      }
      detail={
        !name ? null : selected ? (
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
