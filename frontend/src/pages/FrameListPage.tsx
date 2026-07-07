import { Navigate, useParams } from "react-router-dom";
import { FrameDetail } from "@/components/frame/FrameDetail";
import { FrameList } from "@/components/frame/FrameList";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { frames } from "@/data";
import { entityPath } from "@/lib/format";

/** Handles both /frames and /frames/:name. Lands on the first frame with no :name. */
export function FrameListPage() {
  const { name } = useParams();

  if (!name) {
    return <Navigate to={entityPath("frame", frames[0].name)} replace />;
  }

  return (
    <MasterDetailLayout
      backTo="/frames"
      list={<FrameList activeName={name} />}
      detail={<FrameDetail name={name} />}
    />
  );
}
