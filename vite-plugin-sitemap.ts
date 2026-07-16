import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Plugin } from "vite";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = resolve(HERE, "dataset");
const RATINGS_PATH = resolve(HERE, "curation/ratings.json");
const SITE_URL = "https://metaphorist.vercel.app";

const STATIC_ROUTES = ["/", "/metaphors", "/frames", "/about"];

type MetaphorEntry = { name: string; source_frame?: string; target_frame?: string };
type FrameEntry = { name: string };
type Ratings = Record<string, "up" | "down">;

function readYaml<T>(file: string, key: string): T[] {
  const doc = load(readFileSync(resolve(DATASET_DIR, file), "utf-8")) as Record<string, T[]>;
  return doc[key];
}

function readRatings(): Ratings {
  if (!existsSync(RATINGS_PATH)) return {};
  return JSON.parse(readFileSync(RATINGS_PATH, "utf-8"));
}

/** ANGER_IS_HEAT -> anger-is-heat, mirrors src/lib/format.ts#metaphorSlug */
function metaphorSlug(name: string): string {
  return name.toLowerCase().replace(/_/g, "-");
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSitemap(): string {
  const allMetaphors = readYaml<MetaphorEntry>("metaphors.yaml", "metaphors");
  const allFrames = readYaml<FrameEntry>("frames.yaml", "frames");
  const ratings = readRatings();

  // Mirrors the filtering in src/data/index.ts: bad-rated metaphors and any
  // frame left with no surviving metaphor reference are excluded from the
  // browsable app, so they shouldn't be advertised to search engines either.
  const metaphors = allMetaphors.filter((m) => ratings[m.name] !== "down");

  const referencedFrameNames = new Set<string>();
  for (const m of metaphors) {
    if (m.source_frame) referencedFrameNames.add(m.source_frame);
    if (m.target_frame) referencedFrameNames.add(m.target_frame);
  }
  const frames = allFrames.filter((f) => referencedFrameNames.has(f.name));

  const paths = [
    ...STATIC_ROUTES,
    ...metaphors.map(({ name }) => `/metaphors/${encodeURIComponent(metaphorSlug(name))}`),
    ...frames.map(({ name }) => `/frames/${encodeURIComponent(name)}`),
  ];

  const body = paths
    .map((path) => `  <url><loc>${xmlEscape(`${SITE_URL}${path}`)}</loc></url>`)
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  );
}

/**
 * Emits sitemap.xml from dataset/*.yaml at build time — one <url> per
 * metaphor/frame page plus the static routes, so search engines can
 * discover all entity pages without crawling this client-rendered SPA's
 * links. Not wired into dev (`apply: "build"`) since it only matters for
 * the deployed site's crawlability.
 */
export function sitemapPlugin(): Plugin {
  return {
    name: "metaphor-sitemap",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemap(),
      });
    },
  };
}
