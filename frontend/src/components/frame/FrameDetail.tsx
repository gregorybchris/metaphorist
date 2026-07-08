import { Workflow } from "lucide-react";
import { frameByName, metaphorsBySourceFrame, metaphorsByTargetFrame } from "@/data";
import {
  frameDisplayName,
  parseLexicalUnit,
  pluralize,
  roleDisplayName,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/primitives/Badge";
import { CollapsibleSection } from "@/components/primitives/CollapsibleSection";
import { EmptyState } from "@/components/primitives/EmptyState";
import { EntityChip } from "@/components/primitives/EntityLink";

export function FrameDetail({ name }: { name: string }) {
  const frame = frameByName.get(name);

  if (!frame) {
    return (
      <div className="p-6">
        <EmptyState
          title="Frame not found"
          description={`No frame named "${name}" exists in this dataset.`}
        />
      </div>
    );
  }

  const sourceUses = metaphorsBySourceFrame.get(frame.name) ?? [];
  const targetUses = metaphorsByTargetFrame.get(frame.name) ?? [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="font-serif text-2xl text-text">{frameDisplayName(frame.name)}</h1>
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
                    {isXSchema && <Badge tone="indigo">executing schema</Badge>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No roles recorded for this frame.</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Lexical units"
          count={frame.lexical_units?.length ?? 0}
          defaultOpen
        >
          {frame.lexical_units && frame.lexical_units.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {frame.lexical_units.map((lu) => {
                const { lemma, pos, tone } = parseLexicalUnit(lu);
                return (
                  <span
                    key={lu}
                    className="inline-flex items-center gap-1 rounded bg-surface-hover py-0.5 pr-1 pl-1.5 font-mono text-[0.85em] text-text-muted"
                  >
                    {lemma}
                    {pos && <Badge tone={tone ?? "neutral"}>{pos}</Badge>}
                  </span>
                );
              })}
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
      </div>
    </div>
  );
}
