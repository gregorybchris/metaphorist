import { useCallback, useEffect, useState } from "react";

export type Rating = "up" | "down";
export type Favorites = Record<string, Rating>;

const ENDPOINT = "/__curation";

/**
 * Talks to the dev-server-only /__curation middleware (vite-plugin-curation.ts),
 * which reads/writes curation/favorites.json on disk. Only wired up under
 * `vite dev` — the curation UI is a for-me tool, not part of the production
 * build, so requests here 404 harmlessly outside dev.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(ENDPOINT)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Favorites) => setFavorites(data))
      .catch(() => setFavorites({}))
      .finally(() => setLoaded(true));
  }, []);

  const setRating = useCallback((name: string, rating: Rating | null) => {
    setFavorites((prev) => {
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

  return { favorites, loaded, setRating };
}
