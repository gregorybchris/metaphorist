import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MetaphorName } from "@/components/primitives/MetaphorName";
import { metaphorByName, stats } from "@/data";
import { entityPath } from "@/lib/format";
import type { Metaphor } from "@/types";
import {
  BatteryChargingIcon,
  BuildingIcon,
  GlobeHemisphereWestIcon,
  BeerSteinIcon,
  FireIcon,
  BrainIcon,
  PersonSimpleRunIcon,
  PersonIcon,
  ScalesIcon,
} from "@phosphor-icons/react";
import { KnifeIcon } from "@phosphor-icons/react/dist/ssr";

type IconName =
  | "beer"
  | "knife"
  | "battery"
  | "building"
  | "globe"
  | "brain"
  | "fire"
  | "run"
  | "person"
  | "scales";

/**
 * Hand-picked for maximum "wait, that's a metaphor?" effect — dead idioms
 * ordinary speakers use constantly without noticing the buried comparison.
 * The examples themselves are pulled live from the dataset below, so only
 * the curation choice (which five) is hardcoded.
 */
const SPOTLIGHT_METAPHORS = [
  {
    name: "INTOXICATION_IS_GETTING_BURNED_OR_COOKED",
    leftIconName: "beer",
    rightIconName: "fire",
  },
  {
    name: "INTELLIGENCE_IS_A_CUTTING_INSTRUMENT",
    leftIconName: "brain",
    rightIconName: "knife",
  },
  {
    name: "PEOPLE_ARE_BATTERIES",
    leftIconName: "run",
    rightIconName: "battery",
  },
  {
    name: "BODIES_ARE_BUILDINGS",
    leftIconName: "person",
    rightIconName: "building",
  },
  {
    name: "EMOTIONAL_STABILITY_IS_CONTACT_WITH_THE_GROUND",
    leftIconName: "scales",
    rightIconName: "globe",
  },
];

function mapIcon(iconName: IconName) {
  switch (iconName) {
    case "beer":
      return <BeerSteinIcon size={20} weight="duotone" color="#777" />;
    case "knife":
      return <KnifeIcon size={20} weight="duotone" color="#777" />;
    case "battery":
      return <BatteryChargingIcon size={20} weight="duotone" color="#777" />;
    case "building":
      return <BuildingIcon size={20} weight="duotone" color="#777" />;
    case "globe":
      return (
        <GlobeHemisphereWestIcon size={20} weight="duotone" color="#777" />
      );
    case "fire":
      return <FireIcon size={20} weight="duotone" color="#777" />;
    case "brain":
      return <BrainIcon size={20} weight="duotone" color="#777" />;
    case "run":
      return <PersonSimpleRunIcon size={20} weight="duotone" color="#777" />;
    case "person":
      return <PersonIcon size={20} weight="duotone" color="#777" />;
    case "scales":
      return <ScalesIcon size={20} weight="duotone" color="#777" />;
  }
}

function SpotlightCard({
  metaphor,
  leftIconName,
  rightIconName,
}: {
  metaphor: Metaphor;
  leftIconName: IconName;
  rightIconName: IconName;
}) {
  const examples = metaphor.examples ?? [];

  return (
    <details className="group rounded-lg border border-border bg-surface transition-colors open:bg-surface-hover/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 select-none sm:px-6">
        <div className="flex items-center gap-3">
          {mapIcon(leftIconName)}

          <span className="font-serif text-base text-text sm:text-lg">
            <MetaphorName name={metaphor.name} />
          </span>

          {mapIcon(rightIconName)}
        </div>
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
  const spotlight = SPOTLIGHT_METAPHORS.map(
    ({ name, leftIconName, rightIconName }) => ({
      metaphor: metaphorByName.get(name),
      leftIconName: leftIconName,
      rightIconName: rightIconName,
    }),
  ).filter(
    (
      m,
    ): m is {
      metaphor: Metaphor;
      leftIconName: IconName;
      rightIconName: IconName;
    } => Boolean(m.metaphor),
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 md:py-14">
      <p className="font-serif text-2xl leading-snug text-center text-balance text-text italic sm:text-3xl">
        Explore how the metaphors of everyday language shape our thinking.
      </p>

      <div className="mt-10 space-y-3">
        {spotlight.map((metaphor) => (
          <SpotlightCard
            key={metaphor.metaphor.name}
            metaphor={metaphor.metaphor}
            leftIconName={metaphor.leftIconName}
            rightIconName={metaphor.rightIconName}
          />
        ))}
      </div>

      <div className="mt-2 pt-6 text-center">
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
