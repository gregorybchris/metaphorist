import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { ArrowDown, ArrowUp, CornerDownLeft, Search, X } from "lucide-react";
import { Badge, EmptyState, type BadgeTone } from "@/components/primitives";
import { cn } from "@/lib/cn";
import { displayName, entityPath } from "@/lib/format";
import { frameFamilies, frames, metaphorFamilies, metaphors, stats } from "@/data";
import type { EntityKind } from "@/types";

export interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface SearchEntry {
  kind: EntityKind;
  /** Raw dataset name — the routing/identity key. */
  name: string;
  /** Human-readable label shown as the row's heading. */
  label: string;
  /** Extra searchable-but-not-displayed text (lexical units, frames, families, ...). */
  extra: string;
}

const KIND_LABEL: Record<EntityKind, string> = {
  metaphor: "Metaphor",
  frame: "Frame",
  "metaphor-family": "Metaphor family",
  "frame-family": "Frame family",
};

const KIND_TONE: Record<EntityKind, BadgeTone> = {
  metaphor: "indigo",
  frame: "clay",
  "metaphor-family": "moss",
  "frame-family": "moss",
};

/**
 * One combined index across all four collections, built once at module
 * scope — the dataset is bundled statically at build time, so this never
 * needs to be recomputed for the lifetime of the page.
 */
const searchEntries: SearchEntry[] = [
  ...metaphors.map(
    (m): SearchEntry => ({
      kind: "metaphor",
      name: m.name,
      label: displayName("metaphor", m.name),
      extra: [...(m.families ?? []), m.source_frame, m.target_frame]
        .filter((v): v is string => Boolean(v))
        .join(" "),
    }),
  ),
  ...frames.map(
    (f): SearchEntry => ({
      kind: "frame",
      name: f.name,
      label: displayName("frame", f.name),
      extra: [...(f.lexical_units ?? []), ...(f.frame_type ?? [])].join(" "),
    }),
  ),
  ...metaphorFamilies.map(
    (f): SearchEntry => ({ kind: "metaphor-family", name: f.name, label: f.name, extra: "" }),
  ),
  ...frameFamilies.map(
    (f): SearchEntry => ({ kind: "frame-family", name: f.name, label: f.name, extra: "" }),
  ),
];

const fuse = new Fuse(searchEntries, {
  keys: [
    { name: "label", weight: 0.5 },
    { name: "name", weight: 0.3 },
    { name: "extra", weight: 0.2 },
  ],
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

const RESULT_LIMIT = 20;

/**
 * Global Cmd+K search modal — one fuzzy index over metaphors, frames, and
 * both family kinds. AppShell owns `open` and the shortcut that flips it;
 * this component owns the query, the highlighted row, and navigation.
 */
export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q, { limit: RESULT_LIMIT }).map((r) => r.item);
  }, [query]);

  // Reset to a blank slate whenever the palette closes, so it always opens
  // fresh next time rather than showing the previous search.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Lock background scroll while the modal is up.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  function goTo(entry: SearchEntry) {
    navigate(entityPath(entry.kind, entry.name));
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const entry = results[selectedIndex];
        if (entry) goTo(entry);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, selectedIndex]);

  if (!open) return null;

  const trimmed = query.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/40 pt-24"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="shrink-0 text-text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            type="text"
            placeholder="Search metaphors, frames, and families…"
            className="w-full bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-palette-results"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? `search-palette-option-${selectedIndex}` : undefined
            }
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 text-text-faint hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        <div
          id="search-palette-results"
          role="listbox"
          className="min-h-0 overflow-y-auto p-2"
        >
          {trimmed === "" && (
            <p className="px-3 py-8 text-center text-sm text-text-muted">
              Search {stats.metaphorCount} metaphors, {stats.frameCount} frames,{" "}
              {stats.metaphorFamilyCount} metaphor families, and {stats.frameFamilyCount} frame
              families.
            </p>
          )}
          {trimmed !== "" && results.length === 0 && (
            <EmptyState title="No results" description={`Nothing matches "${trimmed}".`} />
          )}
          {results.map((entry, i) => {
            const isActive = i === selectedIndex;
            return (
              <button
                key={`${entry.kind}:${entry.name}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                id={`search-palette-option-${i}`}
                role="option"
                aria-selected={isActive}
                type="button"
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => goTo(entry)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left",
                  isActive ? "bg-surface-hover" : "hover:bg-surface-hover",
                )}
              >
                <Badge tone={KIND_TONE[entry.kind]} className="shrink-0">
                  {KIND_LABEL[entry.kind]}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                  {entry.label}
                </span>
              </button>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="flex shrink-0 items-center gap-3 border-t border-border px-4 py-2 text-xs text-text-faint">
            <span className="flex items-center gap-1">
              <ArrowUp size={12} />
              <ArrowDown size={12} /> navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft size={12} /> open
            </span>
            <span className="ml-auto">Esc to close</span>
          </div>
        )}
      </div>
    </div>
  );
}
