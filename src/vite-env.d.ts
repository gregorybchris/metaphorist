/// <reference types="vite/client" />

declare module "virtual:metaphor-dataset" {
  import type { RawDataset } from "./types";
  const dataset: RawDataset;
  export default dataset;
}
