import { EntityChip } from "@/components/primitives";
import { pluralize } from "@/lib/format";
import type { EntityKind } from "@/types";

/**
 * Detail pane shared by MetaphorFamilyListPage and FrameFamilyListPage: a
 * family's name as a heading, its member count, and every member rendered
 * as a linkable chip in a wrapped cluster.
 */
export function FamilyDetail({
  name,
  members,
  memberKind,
}: {
  name: string;
  members: string[];
  memberKind: Extract<EntityKind, "metaphor" | "frame">;
}) {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <p className="font-serif text-2xl text-text sm:text-3xl">{name}</p>
      <p className="mt-1.5 text-sm text-text-muted">
        {pluralize(members.length, "member")}
      </p>

      {members.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {members.map((member) => (
            <EntityChip key={member} kind={memberKind} name={member} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-text-muted">
          This family has no recorded members.
        </p>
      )}
    </div>
  );
}
