import type { Frame, Metaphor } from "@/types";
import { frameDisplayName, metaphorDisplayName } from "./format";

export const SITE_NAME = "Metaphorist";
export const SITE_URL = "https://metaphorist.vercel.app";
export const DEFAULT_DESCRIPTION =
  "A browsable explorer for a curated dataset of conceptual metaphors — how everyday " +
  "language maps abstract ideas like anger, time, and ideas onto concrete frames like " +
  "heat, motion, and buildings. Based on Lakoff & Johnson's Conceptual Metaphor Theory.";

/** "Metaphors" -> "Metaphors — Metaphorist"; omit the segment for the home page's own title. */
export function pageTitle(segment?: string): string {
  return segment ? `${segment} — ${SITE_NAME}` : `${SITE_NAME} — conceptual metaphor explorer`;
}

export function metaphorTitle(metaphor: Metaphor): string {
  return metaphorDisplayName(metaphor.name);
}

export function metaphorDescription(metaphor: Metaphor): string {
  const display = metaphorDisplayName(metaphor.name);
  const source = metaphor.source_frame ? frameDisplayName(metaphor.source_frame) : undefined;
  const target = metaphor.target_frame ? frameDisplayName(metaphor.target_frame) : undefined;
  const mapping = source && target ? ` Maps ${source} onto ${target}.` : "";
  const example = metaphor.examples?.[0] ? ` Example: “${metaphor.examples[0]}”` : "";
  return `${display} — a conceptual metaphor in the Metaphorist dataset.${mapping}${example}`;
}

export function frameTitle(frame: Frame): string {
  return frameDisplayName(frame.name);
}

export function frameDescription(frame: Frame): string {
  const display = frameDisplayName(frame.name);
  const roleNames = frame.roles?.map((r) => r.name.replace(/_/g, " ")) ?? [];
  const roles = roleNames.length
    ? ` Roles: ${roleNames.slice(0, 4).join(", ")}${roleNames.length > 4 ? ", …" : ""}.`
    : "";
  return `${display} — a semantic frame in the Metaphorist dataset.${roles}`;
}

export function metaphorJsonLd(metaphor: Metaphor, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: metaphorTitle(metaphor),
    description: metaphorDescription(metaphor),
    url: `${SITE_URL}${path}`,
    inDefinedTermSet: `${SITE_URL}/metaphors`,
  };
}

export function frameJsonLd(frame: Frame, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: frameTitle(frame),
    description: frameDescription(frame),
    url: `${SITE_URL}${path}`,
    inDefinedTermSet: `${SITE_URL}/frames`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  };
}
