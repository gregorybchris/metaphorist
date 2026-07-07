import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { CollapsibleSection } from "@/components/primitives/CollapsibleSection";
import { EntityChip, EntityLink } from "@/components/primitives/EntityLink";
import {
  RelationsGraph,
  type RelationsGraphEdge,
  type RelationsGraphNode,
} from "@/components/graph/RelationsGraph";
import { metaphorReverseRelations } from "@/data";
import { entityPath, metaphorDisplayName, relationLabel } from "@/lib/format";
import type { Metaphor } from "@/types";
import { MappingDiagram } from "./MappingDiagram";
import { RelationsGroups } from "./RelationsSection";

export function MetaphorDetail({ metaphor }: { metaphor: Metaphor }) {
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, RelationsGraphNode>();
    nodeMap.set(metaphor.name, {
      id: metaphor.name,
      label: metaphorDisplayName(metaphor.name),
      kind: "metaphor",
      isCenter: true,
    });
    const edges: RelationsGraphEdge[] = [];

    for (const [relation, targets] of Object.entries(metaphor.relations ?? {})) {
      for (const target of targets ?? []) {
        if (!nodeMap.has(target)) {
          nodeMap.set(target, {
            id: target,
            label: metaphorDisplayName(target),
            kind: "metaphor",
          });
        }
        edges.push({ source: metaphor.name, target, label: relationLabel(relation) });
      }
    }
    for (const rev of metaphorReverseRelations.get(metaphor.name) ?? []) {
      if (!nodeMap.has(rev.name)) {
        nodeMap.set(rev.name, {
          id: rev.name,
          label: metaphorDisplayName(rev.name),
          kind: "metaphor",
        });
      }
      edges.push({ source: rev.name, target: metaphor.name, label: relationLabel(rev.relation) });
    }

    return { nodes: Array.from(nodeMap.values()), edges };
  }, [metaphor]);

  const examples = metaphor.examples ?? [];
  const hasFrameMapping = Boolean(
    metaphor.source_frame || metaphor.target_frame || metaphor.mappings?.length,
  );
  const hasEntailments = (metaphor.entailments?.length ?? 0) > 0;
  const hasRelations = edges.length > 0;

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <Breadcrumbs items={[{ label: "Metaphors", to: "/metaphors" }]} />

      {/* Examples come first — they're what gives a reader an intuition for
          the metaphor. The formal name is secondary: a caption underneath
          when there are examples to lead with, or the headline itself on
          the minority of entries that have none recorded. */}
      <div className="mt-6">
        {examples.length > 0 ? (
          <>
            <div className="space-y-5">
              {examples.map((example, i) => (
                <p
                  key={i}
                  className="text-pretty font-serif text-xl leading-snug text-text sm:text-2xl"
                >
                  “{example}”
                </p>
              ))}
            </div>
            <p className="mt-6 font-serif text-lg text-text-muted">
              {metaphorDisplayName(metaphor.name)}
            </p>
          </>
        ) : (
          <p className="text-pretty font-serif text-xl leading-snug text-text sm:text-2xl">
            {metaphorDisplayName(metaphor.name)}
          </p>
        )}
      </div>

      {metaphor.families && metaphor.families.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {metaphor.families.map((f) => (
            <EntityChip key={f} kind="metaphor-family" name={f} className="text-xs" />
          ))}
        </div>
      )}

      <div className="mt-10 divide-y divide-border border-t border-border">
        {hasFrameMapping && (
          <CollapsibleSection
            title="Frame mapping"
            count={metaphor.mappings?.length || undefined}
          >
            <div className="mb-6 flex items-center gap-3">
              {metaphor.source_frame ? (
                <EntityLink
                  kind="frame"
                  name={metaphor.source_frame}
                  tone="source"
                  className="text-base"
                />
              ) : (
                <span className="text-base text-text-faint">—</span>
              )}
              <ArrowRight size={16} className="shrink-0 text-text-faint" />
              {metaphor.target_frame ? (
                <EntityLink
                  kind="frame"
                  name={metaphor.target_frame}
                  tone="target"
                  className="text-base"
                />
              ) : (
                <span className="text-base text-text-faint">—</span>
              )}
            </div>
            {metaphor.mappings && metaphor.mappings.length > 0 ? (
              <MappingDiagram mappings={metaphor.mappings} />
            ) : (
              <p className="text-sm text-text-muted">
                No role-by-role mapping recorded for this metaphor.
              </p>
            )}
          </CollapsibleSection>
        )}

        {hasEntailments && (
          <CollapsibleSection title="Entailments" count={metaphor.entailments!.length}>
            <ul className="space-y-2.5">
              {metaphor.entailments!.map((entailment, i) => (
                <li
                  key={i}
                  className="grid grid-cols-1 items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:gap-3"
                >
                  <p className="text-clay-800 dark:text-clay-200">{entailment.source}</p>
                  <ArrowRight size={14} className="rotate-90 text-text-faint sm:rotate-0" />
                  <p className="text-indigo-800 dark:text-indigo-200">{entailment.target}</p>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {hasRelations && (
          <CollapsibleSection title="Related metaphors" count={edges.length}>
            <RelationsGraph
              nodes={nodes}
              edges={edges}
              height={320}
              onNodeClick={(node) => navigate(entityPath(node.kind, node.id))}
            />
            <div className="mt-6">
              <RelationsGroups metaphor={metaphor} />
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
