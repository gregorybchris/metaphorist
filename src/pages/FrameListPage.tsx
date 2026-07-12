import { Navigate, useParams } from "react-router-dom";
import { FrameDetail } from "@/components/frame/FrameDetail";
import { FrameList } from "@/components/frame/FrameList";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { frameByName, frames, stats } from "@/data";
import { entityPath } from "@/lib/format";
import {
  DEFAULT_DESCRIPTION,
  frameDescription,
  frameJsonLd,
  frameTitle,
  pageTitle,
} from "@/lib/seo";
import { useDocumentHead } from "@/lib/useDocumentHead";
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

  const selected = name ? frameByName.get(name) : undefined;

  useDocumentHead(
    selected
      ? {
          title: frameTitle(selected),
          description: frameDescription(selected),
          path: entityPath("frame", selected.name),
          type: "article",
          jsonLd: frameJsonLd(selected, entityPath("frame", selected.name)),
        }
      : name
        ? {
            title: pageTitle("Frame not found"),
            description: DEFAULT_DESCRIPTION,
            path: "/frames",
            noindex: true,
          }
        : {
            title: pageTitle("Frames"),
            description: `Browse all ${stats.frameCount} semantic frames in the Metaphorist dataset.`,
            path: "/frames",
          },
  );

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
