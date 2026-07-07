import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:metaphor-dataset";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

const HERE = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = resolve(HERE, "../dataset");

const FILES = {
  metaphors: "metaphors.yaml",
  frames: "frames.yaml",
  metaphorFamilies: "metaphor-families.yaml",
  frameFamilies: "frame-families.yaml",
} as const;

function readYaml(file: string): unknown {
  return load(readFileSync(resolve(DATASET_DIR, file), "utf-8"));
}

function buildDataset() {
  const metaphors = readYaml(FILES.metaphors) as { metaphors: unknown[] };
  const frames = readYaml(FILES.frames) as { frames: unknown[] };
  const metaphorFamilies = readYaml(FILES.metaphorFamilies) as {
    metaphor_families: unknown[];
  };
  const frameFamilies = readYaml(FILES.frameFamilies) as {
    frame_families: unknown[];
  };

  return {
    metaphors: metaphors.metaphors,
    frames: frames.frames,
    metaphorFamilies: metaphorFamilies.metaphor_families,
    frameFamilies: frameFamilies.frame_families,
  };
}

/**
 * Reads the four dataset/*.yaml files at build/dev time and exposes them as
 * a single JSON module — the browser never needs a YAML parser. In dev,
 * editing any dataset/*.yaml file triggers a full reload.
 */
export function metaphorDatasetPlugin(): Plugin {
  const watchPaths = Object.values(FILES).map((f) => resolve(DATASET_DIR, f));

  return {
    name: "metaphor-dataset",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      for (const path of watchPaths) this.addWatchFile(path);
      return `export default ${JSON.stringify(buildDataset())};`;
    },
    configureServer(server) {
      server.watcher.add(watchPaths);
      server.watcher.on("change", (file) => {
        if (watchPaths.includes(file)) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}
