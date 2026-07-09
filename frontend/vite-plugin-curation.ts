import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const HERE = dirname(fileURLToPath(import.meta.url));
const FAVORITES_PATH = resolve(HERE, "../curation/favorites.json");

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

/**
 * Dev-server-only endpoint backing the hidden curation UI (?curate=true).
 * Reads/writes curation/favorites.json directly on disk so ratings are
 * plain, git-diffable data rather than browser-local state. Not available
 * in the production build — this is a for-me tool, not a served feature.
 */
export function curationPlugin(): Plugin {
  return {
    name: "metaphor-curation",
    configureServer(server) {
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
