import rawDataset from "virtual:metaphor-dataset";
import type { Frame, Metaphor } from "../types";

export const metaphors: Metaphor[] = rawDataset.metaphors;
export const frames: Frame[] = rawDataset.frames;

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
