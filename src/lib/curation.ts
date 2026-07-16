import { useCallback, useEffect, useState } from "react";
import rawRatings from "virtual:curation-ratings";

export type Rating = "up" | "down";
export type Ratings = Record<string, Rating>;

const ENDPOINT = "/__curation";

/**
 * Baked in from curation/ratings.json at build time (see
 * vite-plugin-curation.ts), unlike useRatings below — available in the
 * production build for read-only display, e.g. starring favorited
 * metaphors in the main sidebar, or filtering out badly-rated ones.
 */
export const ratings: Ratings = rawRatings;

/**
 * Talks to the dev-server-only /__curation middleware (vite-plugin-curation.ts),
 * which reads/writes curation/ratings.json on disk. Only wired up under
 * `vite dev` — the curation UI is a for-me tool, not part of the production
 * build, so requests here 404 harmlessly outside dev.
 */
export function useRatings() {
  const [ratings, setRatings] = useState<Ratings>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(ENDPOINT)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Ratings) => setRatings(data))
      .catch(() => setRatings({}))
      .finally(() => setLoaded(true));
  }, []);

  const setRating = useCallback((name: string, rating: Rating | null) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (rating) next[name] = rating;
      else delete next[name];
      return next;
    });

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rating }),
    }).catch(() => {});
  }, []);

  return { ratings, loaded, setRating };
}
