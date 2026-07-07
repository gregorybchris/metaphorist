import { EntityChip } from "@/components/primitives/EntityLink";
import { metaphorReverseRelations } from "@/data";
import type { Metaphor } from "@/types";

/**
 * The flat, deduped list of related-metaphor chips for one metaphor —
 * content only, no heading or collapse chrome (the caller wraps this in
 * whatever section shell it's using alongside the relations graph).
 * Relations in the raw data are one-directional, so the reverse edges
 * (computed once in src/data/index.ts) are merged in here to make this an
 * explorer rather than a re-display of the YAML's own `related` list.
 */
export function RelationsGroups({ metaphor }: { metaphor: Metaphor }) {
  const forward = metaphor.related ?? [];
  const reverse = metaphorReverseRelations.get(metaphor.name) ?? [];
  const names = Array.from(new Set([...forward, ...reverse])).sort();

  if (names.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <EntityChip key={name} kind="metaphor" name={name} />
      ))}
    </div>
  );
}
