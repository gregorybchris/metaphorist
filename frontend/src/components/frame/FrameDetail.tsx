import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Workflow } from "lucide-react";
import {
  frameByName,
  frameReverseRelations,
  metaphorsBySourceFrame,
  metaphorsByTargetFrame,
} from "@/data";
import {
  entityPath,
  frameDisplayName,
  pluralize,
  relationLabel,
  roleDisplayName,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import type { FrameRelationType } from "@/types";
import { Badge } from "@/components/primitives/Badge";
import { Breadcrumbs } from "@/components/primitives/Breadcrumbs";
import { CollapsibleSection } from "@/components/primitives/CollapsibleSection";
import { EmptyState } from "@/components/primitives/EmptyState";
import { EntityChip } from "@/components/primitives/EntityLink";
import { Mono } from "@/components/primitives/Mono";
import {
  RelationsGraph,
  type RelationsGraphEdge,
  type RelationsGraphNode,
} from "@/components/graph/RelationsGraph";

export function FrameDetail({ name }: { name: string }) {
  const navigate = useNavigate();
  const frame = frameByName.get(name);

  const reverse = useMemo(
    () => frameReverseRelations.get(name) ?? [],
    [name],
  );

  const { nodes, edges } = useMemo(() => {
    if (!frame) return { nodes: [] as RelationsGraphNode[], edges: [] as RelationsGraphEdge[] };

    const nodeMap = new Map<string, RelationsGraphNode>();
    nodeMap.set(frame.name, {
      id: frame.name,
      label: frameDisplayName(frame.name),
      kind: "frame",
      isCenter: true,
    });
    const graphEdges: RelationsGraphEdge[] = [];

    for (const [relation, targets] of Object.entries(frame.relations ?? {})) {
      for (const target of targets ?? []) {
        if (!nodeMap.has(target)) {
          nodeMap.set(target, { id: target, label: frameDisplayName(target), kind: "frame" });
        }
        graphEdges.push({ source: frame.name, target, label: relationLabel(relation) });
      }
    }
    for (const rev of reverse) {
      if (!nodeMap.has(rev.name)) {
        nodeMap.set(rev.name, { id: rev.name, label: frameDisplayName(rev.name), kind: "frame" });
      }
      graphEdges.push({ source: rev.name, target: frame.name, label: relationLabel(rev.relation) });
    }

    return { nodes: Array.from(nodeMap.values()), edges: graphEdges };
  }, [frame, reverse]);

  if (!frame) {
    return (
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Frames", to: "/frames" }, { label: name }]} />
        <div className="mt-6">
          <EmptyState
            title="Frame not found"
            description={`No frame named "${name}" exists in this dataset.`}
          />
        </div>
      </div>
    );
  }

  const sourceUses = metaphorsBySourceFrame.get(frame.name) ?? [];
  const targetUses = metaphorsByTargetFrame.get(frame.name) ?? [];

  const relationTypes = Array.from(
    new Set<string>([
      ...Object.keys(frame.relations ?? {}),
      ...reverse.map((r) => r.relation),
    ]),
  ).sort();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Breadcrumbs
        items={[{ label: "Frames", to: "/frames" }, { label: frameDisplayName(frame.name) }]}
      />

      <header className="mt-4 mb-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-serif text-2xl text-text">{frameDisplayName(frame.name)}</h1>
          <Mono>{frame.name}</Mono>
        </div>

        {frame.frame_families && frame.frame_families.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {frame.frame_families.map((fam) => (
              <EntityChip key={fam} kind="frame-family" name={fam} />
            ))}
          </div>
        )}
      </header>

      <div>
        <CollapsibleSection title="Roles" count={frame.roles?.length ?? 0} defaultOpen>
          {frame.roles && frame.roles.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {frame.roles.map((role) => {
                const isXSchema = role.name.endsWith("_x_schema");
                return (
                  <li
                    key={role.name}
                    className={cn(
                      "flex flex-wrap items-center gap-1.5 rounded-md px-2 py-1",
                      isXSchema &&
                        "border border-dashed border-indigo-300 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-900/20",
                    )}
                  >
                    {isXSchema && (
                      <Workflow size={13} className="shrink-0 text-indigo-500 dark:text-indigo-300" />
                    )}
                    <span className="text-sm text-text">{roleDisplayName(role.name)}</span>
                    {role.role_type && <Badge tone="neutral">{role.role_type}</Badge>}
                    {isXSchema && <Badge tone="indigo">executing schema</Badge>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No roles recorded for this frame.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Lexical units" count={frame.lexical_units?.length ?? 0}>
          {frame.lexical_units && frame.lexical_units.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {frame.lexical_units.map((lu) => (
                <Mono
                  key={lu}
                  className="rounded bg-surface-hover px-1.5 py-0.5 text-text-muted"
                >
                  {lu}
                </Mono>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No lexical units recorded for this frame.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Used in metaphors"
          count={sourceUses.length + targetUses.length}
          defaultOpen
        >
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Badge tone="clay">Source</Badge>
                <span className="text-xs text-text-faint">
                  concrete domain · {pluralize(sourceUses.length, "metaphor")}
                </span>
              </div>
              {sourceUses.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sourceUses.map((m) => (
                    <EntityChip key={m.name} kind="metaphor" name={m.name} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  No metaphors use this frame as their source.
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Badge tone="indigo">Target</Badge>
                <span className="text-xs text-text-faint">
                  abstract domain · {pluralize(targetUses.length, "metaphor")}
                </span>
              </div>
              {targetUses.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {targetUses.map((m) => (
                    <EntityChip key={m.name} kind="metaphor" name={m.name} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  No metaphors use this frame as their target.
                </p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {relationTypes.length > 0 && (
          <CollapsibleSection title="Related frames" count={relationTypes.length}>
            <RelationsGraph
              nodes={nodes}
              edges={edges}
              height={320}
              onNodeClick={(node) => navigate(entityPath(node.kind, node.id))}
            />
            <div className="mt-6 flex flex-col gap-4">
              {relationTypes.map((relation) => {
                const forwardTargets =
                  frame.relations?.[relation as FrameRelationType] ?? [];
                const reverseSources = reverse
                  .filter((r) => r.relation === relation)
                  .map((r) => r.name);
                return (
                  <div key={relation}>
                    <p className="mb-1.5 text-xs font-medium tracking-wide text-text-faint uppercase">
                      {relationLabel(relation)}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {forwardTargets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ArrowRight size={13} className="shrink-0 text-text-faint" />
                          {forwardTargets.map((t) => (
                            <EntityChip key={`fwd-${t}`} kind="frame" name={t} />
                          ))}
                        </div>
                      )}
                      {reverseSources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ArrowLeft size={13} className="shrink-0 text-text-faint" />
                          {reverseSources.map((s) => (
                            <EntityChip key={`rev-${s}`} kind="frame" name={s} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
