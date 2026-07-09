import { splitMetaphorDisplayName } from "@/lib/format";

/** Renders a metaphor's display name with the is/are copula muted, so the
 * eye lands on the two compared frames rather than the connective. */
export function MetaphorName({ name, className }: { name: string; className?: string }) {
  const parts = splitMetaphorDisplayName(name);
  if (!("connective" in parts)) {
    return <span className={className}>{parts.target}</span>;
  }
  return (
    <span className={className}>
      {parts.target} <span className="text-text-muted">{parts.connective}</span> {parts.source}
    </span>
  );
}
