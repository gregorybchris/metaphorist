import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, EntityChip } from "@/components/primitives";
import type { EntityKind } from "@/types";

export interface FamilyTeaserEntry {
  name: string;
  members: string[];
}

/**
 * One half of FamiliesIndexPage: a card introducing a family kind (metaphor
 * or frame families), its total count, a link into the full browsable list,
 * and a teaser of its largest few families as chips.
 */
export function FamilyTeaserCard({
  icon,
  title,
  description,
  count,
  noun,
  pluralNoun,
  to,
  chipKind,
  topFamilies,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  count: number;
  noun: string;
  pluralNoun: string;
  to: string;
  chipKind: Extract<EntityKind, "metaphor-family" | "frame-family">;
  topFamilies: FamilyTeaserEntry[];
}) {
  return (
    <Card className="flex flex-col p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-moss-100 text-moss-700 dark:bg-moss-900/50 dark:text-moss-200">
          {icon}
        </div>
        <div>
          <p className="font-serif text-xl text-text sm:text-2xl">{title}</p>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-text-muted">
        <span className="font-serif text-lg text-text">{count}</span>{" "}
        {count === 1 ? noun : pluralNoun} in total
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {topFamilies.map((family) => (
          <EntityChip key={family.name} kind={chipKind} name={family.name} />
        ))}
      </div>

      <Link
        to={to}
        className="mt-6 flex items-center gap-1.5 text-sm font-medium text-moss-700 hover:underline dark:text-moss-300"
      >
        Browse all {pluralNoun} <ArrowRight size={15} />
      </Link>
    </Card>
  );
}
