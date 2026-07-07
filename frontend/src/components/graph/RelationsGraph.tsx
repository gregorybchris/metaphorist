import { useMemo } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";
import { cn } from "@/lib/cn";

export interface RelationsGraphNode {
  /** raw entity name, e.g. "ANGER_IS_HEAT" or "heating-fluid" */
  id: string;
  /** pre-formatted display label */
  label: string;
  kind: "metaphor" | "frame";
  isCenter?: boolean;
}

export interface RelationsGraphEdge {
  /** node id */
  source: string;
  /** node id */
  target: string;
  /** optional annotation for the edge; omitted when there's nothing to say */
  label?: string;
}

export interface RelationsGraphProps {
  nodes: RelationsGraphNode[];
  edges: RelationsGraphEdge[];
  onNodeClick?: (node: RelationsGraphNode) => void;
  height?: number;
}

/** Node datum as seen by d3-force: the public node shape plus the simulation's
 * position/velocity/pin fields, mutated in place while the simulation runs. */
interface SimNode extends RelationsGraphNode, SimulationNodeDatum {}

/** A settled link, after merging parallel edges between the same pair of
 * nodes (see the dedupe step below). `source`/`target` start as id strings
 * and are mutated to node references by d3-force's link force on init. */
interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  labels: string[];
}

const VIEW_WIDTH = 640;
const CENTER_RADIUS = 16;
const NODE_RADIUS = 10;
/** Above this many (deduped) edges, per-edge text labels get too crowded to
 * read — fall back to a hover title instead of always-visible text. */
const MAX_VISIBLE_EDGE_LABELS = 5;
const SIMULATION_TICKS = 300;

const NODE_FILL: Record<RelationsGraphNode["kind"], string> = {
  metaphor: "fill-indigo-500 dark:fill-indigo-400",
  frame: "fill-clay-500 dark:fill-clay-400",
};

const RING_STROKE: Record<RelationsGraphNode["kind"], string> = {
  metaphor: "stroke-indigo-400 dark:stroke-indigo-300",
  frame: "stroke-clay-400 dark:stroke-clay-300",
};

function resolveNode(
  ref: string | SimNode,
  byId: Map<string, SimNode>,
): SimNode | undefined {
  return typeof ref === "string" ? byId.get(ref) : ref;
}

/**
 * Small force-directed graph of the relations immediately around one
 * metaphor or frame. Pure presentational — the caller supplies nodes/edges
 * (usually the entity plus its direct forward and reverse relations) and
 * decides what a node click means, typically navigating to it.
 *
 * The layout is a one-shot d3-force simulation run to completion
 * synchronously (`stop()` then a fixed number of `tick()`s) and rendered at
 * its settled positions — there is no live physics, dragging, or continuous
 * animation, which is all a neighborhood this small (usually well under 20
 * nodes) needs.
 */
export function RelationsGraph({
  nodes,
  edges,
  onNodeClick,
  height = 320,
}: RelationsGraphProps) {
  const hasNeighbors = nodes.some((n) => !n.isCenter);

  const layout = useMemo(() => {
    if (!hasNeighbors) return null;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const nodeById = new Map(simNodes.map((n) => [n.id, n]));

    // Pin the center node in the middle of the viewBox so the neighborhood
    // settles around it instead of drifting.
    const center = simNodes.find((n) => n.isCenter);
    if (center) {
      center.fx = VIEW_WIDTH / 2;
      center.fy = height / 2;
    }

    // Merge parallel edges between the same pair of nodes (e.g. both
    // "related" and "dual of" between the same two metaphors) into a single
    // line — otherwise they'd draw exactly on top of each other.
    const byPair = new Map<string, SimLink>();
    for (const edge of edges) {
      if (
        edge.source === edge.target ||
        !nodeById.has(edge.source) ||
        !nodeById.has(edge.target)
      ) {
        continue;
      }
      const key = [edge.source, edge.target].sort().join("::");
      const existing = byPair.get(key);
      if (existing) {
        if (edge.label) existing.labels.push(edge.label);
      } else {
        byPair.set(key, {
          source: edge.source,
          target: edge.target,
          labels: edge.label ? [edge.label] : [],
        });
      }
    }
    const simLinks = [...byPair.values()];

    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(90)
          .strength(0.5),
      )
      .force("charge", forceManyBody().strength(-260))
      .force("center", forceCenter(VIEW_WIDTH / 2, height / 2))
      .force(
        "collide",
        forceCollide<SimNode>().radius(
          (d) => (d.isCenter ? CENTER_RADIUS : NODE_RADIUS) + 24,
        ),
      )
      .stop();

    for (let i = 0; i < SIMULATION_TICKS; i++) simulation.tick();

    return { simNodes, simLinks, nodeById };
  }, [nodes, edges, height, hasNeighbors]);

  if (!layout) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg border border-dashed border-border px-6 text-center"
      >
        <p className="text-sm text-text-muted">
          No known relations to graph yet.
        </p>
      </div>
    );
  }

  const { simNodes, simLinks, nodeById } = layout;
  const showEdgeLabels = simLinks.length <= MAX_VISIBLE_EDGE_LABELS;
  const origById = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Graph of local relations"
      className="overflow-visible"
    >
      <g>
        {simLinks.map((link, i) => {
          const source = resolveNode(link.source, nodeById);
          const target = resolveNode(link.target, nodeById);
          if (!source || !target) return null;
          const x1 = source.x ?? 0;
          const y1 = source.y ?? 0;
          const x2 = target.x ?? 0;
          const y2 = target.y ?? 0;
          const label = link.labels.join(", ");
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={1.5}
                className="stroke-border"
              />
              {label && <title>{label}</title>}
              {showEdgeLabels && label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 4}
                  textAnchor="middle"
                  className="fill-text-faint font-sans text-[9px] select-none"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <g>
        {simNodes.map((node) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const radius = node.isCenter ? CENTER_RADIUS : NODE_RADIUS;
          const clickable = !node.isCenter && Boolean(onNodeClick);

          const activate = () => {
            if (!clickable) return;
            const original = origById.get(node.id);
            if (original) onNodeClick?.(original);
          };

          return (
            <g
              key={node.id}
              transform={`translate(${x}, ${y})`}
              onClick={clickable ? activate : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activate();
                      }
                    }
                  : undefined
              }
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={clickable ? `View ${node.label}` : undefined}
              className={cn(clickable && "cursor-pointer")}
            >
              {node.isCenter && (
                <circle
                  r={radius + 5}
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="2 3"
                  className={RING_STROKE[node.kind]}
                />
              )}
              <circle
                r={radius}
                strokeWidth={1.5}
                className={cn(NODE_FILL[node.kind], "stroke-surface")}
              />
              <title>{node.id}</title>
              <text
                y={radius + 13}
                textAnchor="middle"
                className="fill-text font-sans text-[10px] select-none"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
