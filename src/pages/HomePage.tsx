import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { MetaphorName } from "@/components/primitives/MetaphorName";
import { metaphorByName, stats } from "@/data";
import { cn } from "@/lib/cn";
import { entityPath } from "@/lib/format";
import { DEFAULT_DESCRIPTION, pageTitle, websiteJsonLd } from "@/lib/seo";
import { useDocumentHead } from "@/lib/useDocumentHead";
import type { Metaphor } from "@/types";
import {
  BatteryChargingIcon,
  BuildingIcon,
  BeerSteinIcon,
  FireIcon,
  BrainIcon,
  PersonSimpleRunIcon,
  PersonIcon,
  LightbulbIcon,
  BowlFoodIcon,
  MoneyIcon,
  DropIcon,
  SteeringWheelIcon,
  HandGrabbingIcon,
} from "@phosphor-icons/react";
import { KnifeIcon } from "@phosphor-icons/react/dist/ssr";

type IconName =
  | "beer"
  | "knife"
  | "battery"
  | "building"
  | "brain"
  | "fire"
  | "run"
  | "person"
  | "lightbulb"
  | "food"
  | "money"
  | "drop"
  | "steeringWheel"
  | "handGrabbing";

/**
 * Hand-picked for maximum "wait, that's a metaphor?" effect — dead idioms
 * ordinary speakers use constantly without noticing the buried comparison.
 * The examples themselves are pulled live from the dataset below, so only
 * the curation choice (which five) is hardcoded.
 */
const SPOTLIGHT_METAPHORS = [
  {
    name: "PEOPLE_ARE_BATTERIES",
    leftIconName: "run",
    rightIconName: "battery",
  },
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
    name: "BODIES_ARE_BUILDINGS",
    leftIconName: "person",
    rightIconName: "building",
  },
  {
    name: "IDEAS_ARE_FOOD",
    leftIconName: "lightbulb",
    rightIconName: "food",
  },
  {
    name: "MONEY_IS_A_LIQUID",
    leftIconName: "money",
    rightIconName: "drop",
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
    case "fire":
      return <FireIcon size={20} weight="duotone" color="#777" />;
    case "brain":
      return <BrainIcon size={20} weight="duotone" color="#777" />;
    case "run":
      return <PersonSimpleRunIcon size={20} weight="duotone" color="#777" />;
    case "person":
      return <PersonIcon size={20} weight="duotone" color="#777" />;
    case "lightbulb":
      return <LightbulbIcon size={20} weight="duotone" color="#777" />;
    case "food":
      return <BowlFoodIcon size={20} weight="duotone" color="#777" />;
    case "money":
      return <MoneyIcon size={20} weight="duotone" color="#777" />;
    case "drop":
      return <DropIcon size={20} weight="duotone" color="#777" />;
    case "steeringWheel":
      return <SteeringWheelIcon size={20} weight="duotone" color="#777" />;
    case "handGrabbing":
      return <HandGrabbingIcon size={20} weight="duotone" color="#777" />;
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
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface transition-colors",
        open && "bg-surface-hover/30",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full cursor-pointer divide-x divide-border select-none"
      >
        <div className="flex shrink-0 items-center justify-center bg-surface-hover px-4 sm:px-5">
          {mapIcon(leftIconName)}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-3 text-center sm:px-6 sm:py-3">
          <span className="font-serif text-base text-text sm:text-lg">
            <MetaphorName name={metaphor.name} />
          </span>
          <ChevronRight
            size={16}
            className={cn(
              "shrink-0 rotate-90 text-text-faint transition-transform duration-300 ease-in-out",
              open && "-rotate-90",
            )}
          />
        </div>

        <div className="flex shrink-0 items-center justify-center bg-surface-hover px-4 sm:px-5">
          {mapIcon(rightIconName)}
        </div>
      </button>

      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "border-t border-border bg-surface px-5 py-5 transition-opacity duration-300 sm:px-6",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            <ul className="list-none space-y-4">
              {examples.map((example, i) => (
                <li
                  key={i}
                  className="text-pretty border-l-2 border-border pl-4 font-serif text-lg leading-relaxed text-text italic"
                >
                  “{example}”
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-4">
              <Link
                to={entityPath("metaphor", metaphor.name)}
                className="inline-block text-sm text-text-faint underline decoration-dotted underline-offset-2 hover:text-text-muted hover:decoration-solid"
              >
                View metaphor →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  useDocumentHead({
    title: pageTitle(),
    description: DEFAULT_DESCRIPTION,
    path: "/",
    jsonLd: websiteJsonLd(),
  });

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
      <h1 className="font-serif text-2xl leading-snug text-center text-balance text-text italic sm:text-3xl">
        Explore how the metaphors of everyday language shape our thinking.
      </h1>

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
