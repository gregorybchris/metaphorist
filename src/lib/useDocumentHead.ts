import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "./seo";

export interface DocumentHeadOptions {
  /** Full page title, e.g. from seo.ts's pageTitle()/metaphorTitle(). */
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/metaphors/anger-is-heat" — used for canonical + og:url. */
  path: string;
  type?: "website" | "article";
  /** Set for pages that shouldn't be indexed (not-found, internal tools). */
  noindex?: boolean;
  jsonLd?: object;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSON_LD_ID = "seo-jsonld";

function upsertJsonLd(data: object | undefined) {
  const existing = document.getElementById(JSON_LD_ID);
  if (!data) {
    existing?.remove();
    return;
  }
  const el =
    (existing as HTMLScriptElement | null) ??
    Object.assign(document.createElement("script"), {
      id: JSON_LD_ID,
      type: "application/ld+json",
    });
  if (!existing) document.head.appendChild(el);
  el.textContent = JSON.stringify(data);
}

/**
 * Keeps document.title and the SEO-relevant <head> tags (description,
 * canonical, robots, OpenGraph, Twitter card, JSON-LD) in sync with the
 * current route. This is a purely client-side SPA — these tags land in the
 * DOM after React renders, which Googlebot's renderer picks up fine, but
 * non-JS crawlers and link-preview bots (Slack, Twitter, iMessage) won't see
 * them. That gap is a known, accepted tradeoff for now; closing it fully
 * would mean prerendering routes to static HTML.
 */
export function useDocumentHead({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  jsonLd,
}: DocumentHeadOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertCanonical(url);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    upsertJsonLd(jsonLd);
  }, [title, description, path, type, noindex, jsonLd]);
}
