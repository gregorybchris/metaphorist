import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Plugin } from "vite";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = resolve(HERE, "dataset");
const SITE_URL = "https://metaphorist.vercel.app";

const STATIC_ROUTES = ["/", "/metaphors", "/frames", "/about"];

function readNames(file: string, key: string): string[] {
  const doc = load(readFileSync(resolve(DATASET_DIR, file), "utf-8")) as Record<
    string,
    { name: string }[]
  >;
  return doc[key].map((entry) => entry.name);
}

/** ANGER_IS_HEAT -> anger-is-heat, mirrors src/lib/format.ts#metaphorSlug */
function metaphorSlug(name: string): string {
  return name.toLowerCase().replace(/_/g, "-");
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSitemap(): string {
  const metaphorNames = readNames("metaphors.yaml", "metaphors");
  const frameNames = readNames("frames.yaml", "frames");

  const paths = [
    ...STATIC_ROUTES,
    ...metaphorNames.map((name) => `/metaphors/${encodeURIComponent(metaphorSlug(name))}`),
    ...frameNames.map((name) => `/frames/${encodeURIComponent(name)}`),
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
