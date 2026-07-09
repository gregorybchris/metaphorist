import { Navigate, useParams } from "react-router-dom";
import { FrameDetail } from "@/components/frame/FrameDetail";
import { FrameList } from "@/components/frame/FrameList";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { frames } from "@/data";
import { entityPath } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Handles both /frames and /frames/:name. With no :name, desktop lands on
 * the first frame (so the detail pane isn't empty), but mobile stays on the
 * list — otherwise navigating here (e.g. via the mobile "Back to list" link)
 * would immediately redirect right back into a detail view.
 */
export function FrameListPage() {
  const { name } = useParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!name && isDesktop) {
    return <Navigate to={entityPath("frame", frames[0].name)} replace />;
  }

  return (
    <MasterDetailLayout
      backTo="/frames"
      list={<FrameList activeName={name} />}
      detail={name ? <FrameDetail name={name} /> : null}
    />
  );
}
