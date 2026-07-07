import { ArrowLeft, ArrowRight } from "lucide-react";
import { EntityChip } from "@/components/primitives/EntityLink";
import { metaphorReverseRelations } from "@/data";
import { relationLabel } from "@/lib/format";
import { METAPHOR_RELATION_TYPES } from "@/types";
import type { Metaphor } from "@/types";

/**
 * The grouped forward/reverse relation chips for one metaphor — content
 * only, no heading or collapse chrome (the caller wraps this in whatever
 * section shell it's using alongside the relations graph). Relations in the
 * raw data are one-directional, so the reverse edges (computed once in
 * src/data/index.ts) are what make this an explorer rather than a
 * re-display of the YAML.
 */
export function RelationsGroups({ metaphor }: { metaphor: Metaphor }) {
  const reverse = metaphorReverseRelations.get(metaphor.name) ?? [];

  const groups = METAPHOR_RELATION_TYPES.map((type) => {
    const forward = metaphor.relations?.[type] ?? [];
    const back = reverse.filter((r) => r.relation === type).map((r) => r.name);
    return { type, forward, back };
  }).filter((g) => g.forward.length > 0 || g.back.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-5">
      {groups.map(({ type, forward, back }) => (
        <div key={type}>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-text-muted uppercase">
            {relationLabel(type)}
          </p>
          <div className="space-y-1.5">
            {forward.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <ArrowRight
                  size={13}
                  className="shrink-0 text-text-faint"
                  aria-label="this metaphor points at"
                />
                {forward.map((name) => (
                  <EntityChip key={name} kind="metaphor" name={name} />
                ))}
              </div>
            )}
            {back.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <ArrowLeft
                  size={13}
                  className="shrink-0 text-text-faint"
                  aria-label="points at this metaphor"
                />
                {back.map((name) => (
                  <EntityChip key={name} kind="metaphor" name={name} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
