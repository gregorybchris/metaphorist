// Mirrors dataset/*.yaml exactly. See repo-root README.md for the data model
// write-up this is derived from.

export interface Role {
  name: string;
  role_type?: string;
}

export type FrameRelationType =
  | "subcase_of"
  | "uses"
  | "related_to"
  | "scalar_opposition_to"
  | "incorporates_as_role"
  | "perspective_on"
  | "causal_relation_with";

export const FRAME_RELATION_TYPES: FrameRelationType[] = [
  "subcase_of",
  "uses",
  "related_to",
  "scalar_opposition_to",
  "incorporates_as_role",
  "perspective_on",
  "causal_relation_with",
];

export interface Frame {
  name: string;
  frame_type?: string[];
  roles?: Role[];
  lexical_units?: string[];
  frame_families?: string[];
  relations?: Partial<Record<FrameRelationType, string[]>>;
}

export interface Mapping {
  source_role: string;
  target_role: string;
}

export interface Entailment {
  source: string;
  target: string;
}

export type MetaphorType = "Primary" | "Composed/complex" | "Entailed";

export type MetaphorRelationType =
  | "entailed_by"
  | "subcase_of_source"
  | "subcase_of_target"
  | "related"
  | "uses"
  | "dual_of"
  | "related_by_source"
  | "related_by_target"
  | "mapping_within"
  | "transitive_subpart_1"
  | "transitive_subpart_2";

export const METAPHOR_RELATION_TYPES: MetaphorRelationType[] = [
  "entailed_by",
  "subcase_of_source",
  "subcase_of_target",
  "related",
  "uses",
  "dual_of",
  "related_by_source",
  "related_by_target",
  "mapping_within",
  "transitive_subpart_1",
  "transitive_subpart_2",
];

export interface Metaphor {
  name: string;
  type?: MetaphorType;
  source_frame?: string;
  target_frame?: string;
  families?: string[];
  mappings?: Mapping[];
  examples?: string[];
  entailments?: Entailment[];
  relations?: Partial<Record<MetaphorRelationType, string[]>>;
}

export interface MetaphorFamily {
  name: string;
  members: string[];
}

export interface FrameFamily {
  name: string;
  members: string[];
}

export interface RawDataset {
  metaphors: Metaphor[];
  frames: Frame[];
  metaphorFamilies: MetaphorFamily[];
  frameFamilies: FrameFamily[];
}

/** The four browsable entity kinds, used throughout routing and styling. */
export type EntityKind = "metaphor" | "frame" | "metaphor-family" | "frame-family";

/** A relation edge pointed at from the *other* side — see src/data/index.ts. */
export interface ReverseRelation<K extends string = string> {
  name: string;
  relation: K;
}
