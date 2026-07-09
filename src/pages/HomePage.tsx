import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { metaphorByName, stats } from "@/data";
import { entityPath, metaphorDisplayName } from "@/lib/format";
import type { Metaphor } from "@/types";

/**
 * Hand-picked for maximum "wait, that's a metaphor?" effect — dead idioms
 * ordinary speakers use constantly without noticing the buried comparison.
 * The examples themselves are pulled live from the dataset below, so only
 * the curation choice (which five) is hardcoded.
 */
const SPOTLIGHT_METAPHORS = [
  "INTOXICATION_IS_GETTING_BURNED_OR_COOKED",
  "INTELLIGENCE_IDEA_IS_A_CUTTING_INSTRUMENT",
  "PEOPLE_ARE_BATTERIES",
  "BODIES_ARE_BUILDINGS",
  "EMOTIONAL_STABILITY_IS_CONTACT_WITH_THE_GROUND",
];

function SpotlightCard({ metaphor }: { metaphor: Metaphor }) {
  const examples = metaphor.examples ?? [];

  return (
    <details className="group rounded-lg border border-border bg-surface transition-colors open:bg-surface-hover/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 select-none sm:px-6">
        <span className="font-serif text-base text-text sm:text-lg">
          {metaphorDisplayName(metaphor.name)}
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-90"
        />
      </summary>
      <div className="space-y-3 border-t border-border px-5 pt-4 pb-5 sm:px-6">
        {examples.map((example, i) => (
          <p
            key={i}
            className="text-pretty font-serif text-lg leading-snug text-text-muted"
          >
            “{example}”
          </p>
        ))}
        <Link
          to={entityPath("metaphor", metaphor.name)}
          className="inline-block text-sm text-text-faint underline decoration-dotted underline-offset-2 hover:text-text-muted hover:decoration-solid"
        >
          View metaphor →
        </Link>
      </div>
    </details>
  );
}

export function HomePage() {
  const spotlight = SPOTLIGHT_METAPHORS.map((name) =>
    metaphorByName.get(name),
  ).filter((m): m is Metaphor => Boolean(m));

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
      <p className="font-serif text-2xl leading-snug text-center text-balance text-text italic sm:text-3xl">
        How often we all speak in metaphor may surprise you.
      </p>

      <div className="mt-10 space-y-3">
        {spotlight.map((metaphor) => (
          <SpotlightCard key={metaphor.name} metaphor={metaphor} />
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center">
        <Link
          to="/metaphors"
          className="text-sm text-text-muted underline decoration-dotted underline-offset-2 hover:text-text hover:decoration-solid"
        >
          Browse all {stats.metaphorCount} metaphors →
        </Link>
      </div>
    </div>
  );
}
