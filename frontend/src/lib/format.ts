import type { BadgeTone } from "@/components/primitives/Badge";
import type { EntityKind } from "../types";

/** ANGER_IS_HEAT -> "Anger is heat" — reads as a claim, not a shouted label. */
export function metaphorDisplayName(name: string): string {
  const words = name.split("_").filter(Boolean).map((w) => w.toLowerCase());
  if (words.length === 0) return name;
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ");
}

/** heating-fluid -> "Heating Fluid" */
export function frameDisplayName(name: string): string {
  return name
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/** fluid_heat_level -> "fluid heat level" (roles keep lowercase — they read as attributes, not titles) */
export function roleDisplayName(name: string): string {
  return name.replace(/_/g, " ");
}

export function displayName(kind: EntityKind, name: string): string {
  return kind === "metaphor" ? metaphorDisplayName(name) : frameDisplayName(name);
}

const ENTITY_BASE_PATH: Record<EntityKind, string> = {
  metaphor: "/metaphors",
  frame: "/frames",
};

/** ANGER_IS_HEAT -> "anger-is-heat" — the dataset name stays SCREAMING_SNAKE_CASE; only the URL is kebab-case. */
export function metaphorSlug(name: string): string {
  return name.toLowerCase().replace(/_/g, "-");
}

/** "anger-is-heat" -> ANGER_IS_HEAT, reversing metaphorSlug for dataset lookups. */
export function metaphorNameFromSlug(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

export function entityPath(kind: EntityKind, name: string): string {
  const slug = kind === "metaphor" ? metaphorSlug(name) : name;
  return `${ENTITY_BASE_PATH[kind]}/${encodeURIComponent(slug)}`;
}

export function listPath(kind: EntityKind): string {
  return ENTITY_BASE_PATH[kind];
}

/** Pretty count, e.g. pluralize(3, "metaphor") -> "3 metaphors" */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** FrameNet-style part-of-speech codes used in dataset/frames.yaml's lexical_units. */
const PART_OF_SPEECH: Record<string, { label: string; tone: BadgeTone }> = {
  n: { label: "noun", tone: "teal" },
  v: { label: "verb", tone: "garnet" },
  a: { label: "adjective", tone: "fern" },
  adv: { label: "adverb", tone: "amber" },
  prep: { label: "preposition", tone: "azure" },
};

/**
 * "absorb.v" -> { lemma: "absorb", pos: "verb", tone: "garnet" }
 * "soak.v up" -> { lemma: "soak up", pos: "verb", tone: "garnet" } (particle reattached after the code)
 * "ability" -> { lemma: "ability", pos: null, tone: null } (no POS code in the source data)
 */
export function parseLexicalUnit(lu: string): {
  lemma: string;
  pos: string | null;
  tone: BadgeTone | null;
} {
  const match = lu.match(/^(.*?)\.([a-z]+)(\s.*)?$/);
  if (!match) return { lemma: lu, pos: null, tone: null };

  const [, head, code, rest] = match;
  const entry = PART_OF_SPEECH[code];
  if (!entry) return { lemma: lu, pos: null, tone: null };

  return { lemma: `${head}${rest ?? ""}`, pos: entry.label, tone: entry.tone };
}
