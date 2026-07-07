import { Navigate, useParams } from "react-router-dom";
import { FamilyDetail } from "@/components/family/FamilyDetail";
import { FamilyList } from "@/components/family/FamilyList";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { EmptyState } from "@/components/primitives";
import { frameFamilies, frameFamilyByName } from "@/data";
import { entityPath } from "@/lib/format";

const SORTED_FAMILIES = [...frameFamilies].sort((a, b) =>
  a.name.localeCompare(b.name),
);

/**
 * Handles both "/frame-families" and "/frame-families/:name". Lands on the
 * first family (alphabetically) with no :name.
 */
export function FrameFamilyListPage() {
  const { name } = useParams();

  if (!name) {
    return <Navigate to={entityPath("frame-family", SORTED_FAMILIES[0].name)} replace />;
  }

  const family = frameFamilyByName.get(name);

  return (
    <MasterDetailLayout
      backTo="/frame-families"
      list={
        <FamilyList
          kind="frame-family"
          families={SORTED_FAMILIES}
          activeName={name}
          searchPlaceholder="Filter frame families…"
        />
      }
      detail={
        family ? (
          <FamilyDetail name={family.name} members={family.members} memberKind="frame" />
        ) : (
          <div className="p-6 sm:p-8">
            <EmptyState
              title="Family not found"
              description={`No frame family named "${name}".`}
            />
          </div>
        )
      }
    />
  );
}
