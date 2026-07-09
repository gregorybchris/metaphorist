import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const HERE = dirname(fileURLToPath(import.meta.url));
const FAVORITES_PATH = resolve(HERE, "curation/favorites.json");

const VIRTUAL_ID = "virtual:curation-favorites";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

type Rating = "up" | "down";
type Favorites = Record<string, Rating>;

function readFavorites(): Favorites {
  if (!existsSync(FAVORITES_PATH)) return {};
  return JSON.parse(readFileSync(FAVORITES_PATH, "utf-8"));
}

function writeFavorites(favorites: Favorites) {
  mkdirSync(dirname(FAVORITES_PATH), { recursive: true });
  const sorted = Object.fromEntries(
    Object.entries(favorites).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(FAVORITES_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function invalidateVirtualModule(server: import("vite").ViteDevServer) {
  const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
  if (mod) server.moduleGraph.invalidateModule(mod);
  server.ws.send({ type: "full-reload" });
}

/**
 * Dev-server-only endpoint backing the hidden curation UI (?curate=true).
 * Reads/writes curation/favorites.json directly on disk so ratings are
 * plain, git-diffable data rather than browser-local state. Not available
 * in the production build — this is a for-me tool, not a served feature.
 *
 * Also exposes curation/favorites.json as the `virtual:curation-favorites`
 * module, baked in at build time like vite-plugin-dataset.ts, so the
 * production app can read ratings (e.g. to star favorited metaphors)
 * without hitting the dev-only /__curation endpoint.
 */
export function curationPlugin(): Plugin {
  return {
    name: "metaphor-curation",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      this.addWatchFile(FAVORITES_PATH);
      return `export default ${JSON.stringify(readFavorites())};`;
    },
    configureServer(server) {
      server.watcher.add(FAVORITES_PATH);
      server.watcher.on("change", (file) => {
        if (file === FAVORITES_PATH) invalidateVirtualModule(server);
      });

      server.middlewares.use("/__curation", async (req, res) => {
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(readFavorites()));
          return;
        }

        if (req.method === "POST") {
          const { name, rating } = JSON.parse(await readBody(req)) as {
            name: string;
            rating: Rating | null;
          };
          const favorites = readFavorites();
          if (rating) favorites[name] = rating;
          else delete favorites[name];
          writeFavorites(favorites);
          invalidateVirtualModule(server);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(favorites));
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}
