// Mirrors dataset/*.yaml exactly. See repo-root README.md for the data model
// write-up this is derived from.

export interface Role {
  name: string;
}

export interface Frame {
  name: string;
  roles?: Role[];
  lexical_units?: string[];
  frame_families?: string[];
  related?: string[];
}

export interface Mapping {
  source_role: string;
  target_role: string;
}

export interface Metaphor {
  name: string;
  source_frame?: string;
  target_frame?: string;
  families?: string[];
  mappings?: Mapping[];
  examples?: string[];
  related?: string[];
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

/** The two browsable entity kinds, used throughout routing and styling. */
export type EntityKind = "metaphor" | "frame";
