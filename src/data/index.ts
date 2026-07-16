import rawDataset from "virtual:metaphor-dataset";
import { ratings } from "@/lib/curation";
import type { Frame, Metaphor } from "../types";

/** Unfiltered — only for the /curate page, which needs to review bad and unrated metaphors too. */
export const allMetaphors: Metaphor[] = rawDataset.metaphors;
const allFrames: Frame[] = rawDataset.frames;

/** Metaphors rated "bad" via /curate are excluded from the browsable app. */
export const metaphors: Metaphor[] = allMetaphors.filter((m) => ratings[m.name] !== "down");

const referencedFrameNames = new Set<string>();
for (const m of metaphors) {
  if (m.source_frame) referencedFrameNames.add(m.source_frame);
  if (m.target_frame) referencedFrameNames.add(m.target_frame);
}

/** Frames no longer referenced by any surviving metaphor are dropped too. */
export const frames: Frame[] = allFrames.filter((f) => referencedFrameNames.has(f.name));

export const metaphorByName = new Map<string, Metaphor>(
  metaphors.map((m) => [m.name, m]),
);
export const frameByName = new Map<string, Frame>(
  frames.map((f) => [f.name, f]),
);

function pushTo<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

/** frame name -> metaphors that use it as their source_frame */
export const metaphorsBySourceFrame = new Map<string, Metaphor[]>();
/** frame name -> metaphors that use it as their target_frame */
export const metaphorsByTargetFrame = new Map<string, Metaphor[]>();

for (const m of metaphors) {
  if (m.source_frame) pushTo(metaphorsBySourceFrame, m.source_frame, m);
  if (m.target_frame) pushTo(metaphorsByTargetFrame, m.target_frame, m);
}

export const stats = {
  metaphorCount: metaphors.length,
  frameCount: frames.length,
};
