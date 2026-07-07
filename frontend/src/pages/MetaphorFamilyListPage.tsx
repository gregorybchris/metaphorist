import { Navigate, useParams } from "react-router-dom";
import { FamilyDetail } from "@/components/family/FamilyDetail";
import { FamilyList } from "@/components/family/FamilyList";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { EmptyState } from "@/components/primitives";
import { metaphorFamilies, metaphorFamilyByName } from "@/data";
import { entityPath } from "@/lib/format";

const SORTED_FAMILIES = [...metaphorFamilies].sort((a, b) =>
  a.name.localeCompare(b.name),
);

/**
 * Handles both "/metaphor-families" and "/metaphor-families/:name". Lands on
 * the first family (alphabetically) with no :name.
 */
export function MetaphorFamilyListPage() {
  const { name } = useParams();

  if (!name) {
    return <Navigate to={entityPath("metaphor-family", SORTED_FAMILIES[0].name)} replace />;
  }

  const family = metaphorFamilyByName.get(name);

  return (
    <MasterDetailLayout
      backTo="/metaphor-families"
      list={
        <FamilyList
          kind="metaphor-family"
          families={SORTED_FAMILIES}
          activeName={name}
          searchPlaceholder="Filter metaphor families…"
        />
      }
      detail={
        family ? (
          <FamilyDetail name={family.name} members={family.members} memberKind="metaphor" />
        ) : (
          <div className="p-6 sm:p-8">
            <EmptyState
              title="Family not found"
              description={`No metaphor family named "${name}".`}
            />
          </div>
        )
      }
    />
  );
}
