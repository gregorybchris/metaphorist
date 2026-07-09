import { useMemo } from "react";
import { roleDisplayName } from "@/lib/format";
import type { Mapping } from "@/types";

const ROW_HEIGHT = 36;

/**
 * THE signature visual of the app: a two-column correspondence diagram
 * between a metaphor's source_role and target_role vocabulary. Each column
 * lists its *unique* roles (in order of first appearance) so a role reused
 * across several mappings gets one node; every mapping entry draws its own
 * connecting curve, so reused roles fan out into several lines rather than
 * duplicating rows. Purely geometric (index * ROW_HEIGHT) — no DOM
 * measurement needed, so it stays correct across resizes for free.
 */
export function MappingDiagram({ mappings }: { mappings: Mapping[] }) {
  const { sourceRoles, targetRoles, sourceIndex, targetIndex } = useMemo(() => {
    const sourceRoles: string[] = [];
    const targetRoles: string[] = [];
    const sourceIndex = new Map<string, number>();
    const targetIndex = new Map<string, number>();
    for (const m of mappings) {
      if (!sourceIndex.has(m.source_role)) {
        sourceIndex.set(m.source_role, sourceRoles.length);
        sourceRoles.push(m.source_role);
      }
      if (!targetIndex.has(m.target_role)) {
        targetIndex.set(m.target_role, targetRoles.length);
        targetRoles.push(m.target_role);
      }
    }
    return { sourceRoles, targetRoles, sourceIndex, targetIndex };
  }, [mappings]);

  const rowCount = Math.max(sourceRoles.length, targetRoles.length, 1);
  const height = rowCount * ROW_HEIGHT;
  const y = (i: number) => i * ROW_HEIGHT + ROW_HEIGHT / 2;

  return (
    <div className="overflow-x-auto">
      <div className="mb-1.5 flex min-w-[380px] text-[11px] font-medium tracking-wide text-text-faint uppercase">
        <div className="w-2/5 text-right">Source</div>
        <div className="w-1/5" />
        <div className="w-2/5">Target</div>
      </div>
      <div className="flex min-w-[380px] items-stretch" style={{ height }}>
        <div className="flex w-2/5 flex-col">
          {sourceRoles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-end pr-2"
              style={{ height: ROW_HEIGHT }}
            >
              <span
                className="truncate rounded-md bg-clay-100 px-2 py-1 font-mono text-xs text-clay-800 dark:bg-clay-900/50 dark:text-clay-200"
                title={role}
              >
                {roleDisplayName(role)}
              </span>
            </div>
          ))}
        </div>

        <div className="relative w-1/5 shrink-0" style={{ height }}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 overflow-visible"
          >
            {mappings.map((m, i) => {
              const y1 = y(sourceIndex.get(m.source_role)!);
              const y2 = y(targetIndex.get(m.target_role)!);
              return (
                <path
                  key={i}
                  d={`M 0 ${y1} C 50 ${y1} 50 ${y2} 100 ${y2}`}
                  fill="none"
                  stroke="url(#mapping-diagram-gradient)"
                  strokeWidth={2}
                  opacity={0.7}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <defs>
              <linearGradient
                id="mapping-diagram-gradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                x2="100"
                y1="0"
                y2="0"
              >
                <stop offset="0%" stopColor="var(--color-clay-500)" />
                <stop offset="100%" stopColor="var(--color-indigo-500)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex w-2/5 flex-col">
          {targetRoles.map((role) => (
            <div key={role} className="flex items-center pl-2" style={{ height: ROW_HEIGHT }}>
              <span
                className="truncate rounded-md bg-indigo-100 px-2 py-1 font-mono text-xs text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                title={role}
              >
                {roleDisplayName(role)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
