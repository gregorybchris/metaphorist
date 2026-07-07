import { Layers, Shapes } from "lucide-react";
import { FamilyTeaserCard } from "@/components/family/FamilyTeaserCard";
import { metaphorFamilies, frameFamilies, stats } from "@/data";

const TOP_METAPHOR_FAMILIES = [...metaphorFamilies]
  .sort((a, b) => b.members.length - a.members.length)
  .slice(0, 8);

const TOP_FRAME_FAMILIES = [...frameFamilies]
  .sort((a, b) => b.members.length - a.members.length)
  .slice(0, 8);

/** "/families" — landing page tying the two family kinds together. */
export function FamiliesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="font-serif text-3xl text-text">Families</p>
      <p className="mt-2 max-w-2xl text-text-muted">
        Metaphors and frames are each grouped into named thematic families —
        clusters like <span className="text-text">Anger metaphors</span> or{" "}
        <span className="text-text">Emotion frames</span> that make it easier
        to browse the dataset by topic instead of one entry at a time.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <FamilyTeaserCard
          icon={<Shapes size={20} />}
          title="Metaphor families"
          description="Thematic groupings of metaphors, e.g. Anger metaphors or Governance metaphors."
          count={stats.metaphorFamilyCount}
          noun="family"
          pluralNoun="families"
          to="/metaphor-families"
          chipKind="metaphor-family"
          topFamilies={TOP_METAPHOR_FAMILIES}
        />
        <FamilyTeaserCard
          icon={<Layers size={20} />}
          title="Frame families"
          description="Thematic groupings of frames, e.g. Emotion frames or Motion frames."
          count={stats.frameFamilyCount}
          noun="family"
          pluralNoun="families"
          to="/frame-families"
          chipKind="frame-family"
          topFamilies={TOP_FRAME_FAMILIES}
        />
      </div>
    </div>
  );
}
