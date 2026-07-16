/// <reference types="vite/client" />

declare module "virtual:metaphor-dataset" {
  import type { RawDataset } from "./types";
  const dataset: RawDataset;
  export default dataset;
}

declare module "virtual:curation-ratings" {
  const ratings: Record<string, "up" | "down">;
  export default ratings;
}
