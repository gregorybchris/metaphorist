import { ArrowRight } from "lucide-react";
import { CollapsibleSection } from "@/components/primitives/CollapsibleSection";
import { EntityLink } from "@/components/primitives/EntityLink";
import { MetaphorName } from "@/components/primitives/MetaphorName";
import type { Metaphor } from "@/types";
import { MappingDiagram } from "./MappingDiagram";

export function MetaphorDetail({ metaphor }: { metaphor: Metaphor }) {
  const examples = metaphor.examples ?? [];
  const hasFrameMapping = Boolean(
    metaphor.source_frame || metaphor.target_frame || metaphor.mappings?.length,
  );

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <h1 className="text-pretty font-serif text-xl leading-snug text-text sm:text-2xl">
        <MetaphorName name={metaphor.name} />
      </h1>
      {examples.length > 0 && (
        <div className="mt-6 space-y-3">
          {examples.map((example, i) => (
            <p
              key={i}
              className="text-pretty font-serif text-lg leading-snug text-text-muted"
            >
              “{example}”
            </p>
          ))}
        </div>
      )}

      <div className="mt-10">
        {hasFrameMapping && (
          <CollapsibleSection
            title="Frame mapping"
            count={metaphor.mappings?.length || undefined}
            bordered={false}
            defaultOpen
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
      </div>
    </div>
  );
}
