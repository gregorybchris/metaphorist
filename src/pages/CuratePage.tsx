import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { MetaphorDetail } from "@/components/metaphor/MetaphorDetail";
import { metaphors } from "@/data";
import { cn } from "@/lib/cn";
import { type Favorites, type Rating, useFavorites } from "@/lib/curation";
import { pageTitle } from "@/lib/seo";
import { useDocumentHead } from "@/lib/useDocumentHead";

/** Personal review tool, not linked from anywhere in the app: only reachable by visiting /curate directly. */
export function CuratePage() {
  useDocumentHead({
    title: pageTitle("Curate"),
    description: "Internal curation tool.",
    path: "/curate",
    noindex: true,
  });

  return <CurateReview />;
}

function firstUnratedIndex(favorites: Favorites): number {
  const i = metaphors.findIndex((m) => !favorites[m.name]);
  return i === -1 ? 0 : i;
}

function CurateReview() {
  const { favorites, loaded, setRating } = useFavorites();
  const [index, setIndex] = useState<number | null>(null);

  // Jump to the first unrated metaphor once favorites load, but only once —
  // otherwise every mark made during the session would yank focus forward.
  useEffect(() => {
    if (loaded && index === null) setIndex(firstUnratedIndex(favorites));
  }, [loaded, favorites, index]);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min((i ?? 0) + 1, metaphors.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setIndex((i) => Math.max((i ?? 0) - 1, 0));
  }, []);

  const current = index !== null ? metaphors[index] : undefined;
  const currentRating = current ? favorites[current.name] : undefined;

  const rate = useCallback(
    (value: Rating) => {
      if (!current) return;
      const isUndo = favorites[current.name] === value;
      setRating(current.name, isUndo ? null : value);
      if (!isUndo) goNext();
    },
    [current, favorites, setRating, goNext],
  );
  const reset = useCallback(() => {
    if (!current) return;
    setRating(current.name, null);
  }, [current, setRating]);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowUp":
        case "k":
          e.preventDefault();
          rate("up");
          break;
        case "ArrowDown":
        case "j":
          e.preventDefault();
          rate("down");
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [rate, goNext, goPrev]);

  if (!loaded || !current || index === null) {
    return <div className="p-8 text-text-muted">Loading…</div>;
  }

  const ratings = Object.values(favorites);
  const goodCount = ratings.filter((r) => r === "up").length;
  const badCount = ratings.filter((r) => r === "down").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5 text-sm text-text-muted">
        <span>
          {goodCount} good · {badCount} bad
        </span>
        <span className="hidden text-xs text-text-faint sm:inline">
          ↑/k good · ↓/j bad · ←/→ navigate
        </span>
        <span>
          {index + 1} of {metaphors.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <MetaphorDetail metaphor={current} />
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border p-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous"
          className="rounded-full p-2.5 text-text-muted hover:bg-surface-hover hover:text-text disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => rate("down")}
          className={cn(
            "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition",
            currentRating === "down"
              ? "border-garnet-500 bg-garnet-100 text-garnet-800 dark:bg-garnet-900/50 dark:text-garnet-200"
              : "border-border text-text-muted hover:bg-surface-hover hover:text-text",
          )}
        >
          <ThumbsDown size={16} /> Bad
        </button>

        <button
          type="button"
          onClick={reset}
          disabled={!currentRating}
          aria-label="Reset rating"
          className="rounded-full p-2.5 text-text-muted hover:bg-surface-hover hover:text-text disabled:pointer-events-none disabled:opacity-30"
        >
          <RotateCcw size={16} />
        </button>

        <button
          type="button"
          onClick={() => rate("up")}
          className={cn(
            "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition",
            currentRating === "up"
              ? "border-fern-500 bg-fern-100 text-fern-800 dark:bg-fern-900/50 dark:text-fern-200"
              : "border-border text-text-muted hover:bg-surface-hover hover:text-text",
          )}
        >
          <ThumbsUp size={16} /> Good
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={index === metaphors.length - 1}
          aria-label="Next"
          className="rounded-full p-2.5 text-text-muted hover:bg-surface-hover hover:text-text disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
