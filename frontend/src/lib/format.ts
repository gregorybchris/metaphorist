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

/** Family names are already human-readable sentence case in the dataset. */
export function displayName(kind: EntityKind, name: string): string {
  switch (kind) {
    case "metaphor":
      return metaphorDisplayName(name);
    case "frame":
      return frameDisplayName(name);
    case "metaphor-family":
    case "frame-family":
      return name;
  }
}

const ENTITY_BASE_PATH: Record<EntityKind, string> = {
  metaphor: "/metaphors",
  frame: "/frames",
  "metaphor-family": "/metaphor-families",
  "frame-family": "/frame-families",
};

export function entityPath(kind: EntityKind, name: string): string {
  return `${ENTITY_BASE_PATH[kind]}/${encodeURIComponent(name)}`;
}

export function listPath(kind: EntityKind): string {
  return ENTITY_BASE_PATH[kind];
}

/** Pretty count, e.g. pluralize(3, "metaphor") -> "3 metaphors" */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
