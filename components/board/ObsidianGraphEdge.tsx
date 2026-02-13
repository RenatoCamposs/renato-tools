'use client';

import { getBezierPath, BaseEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

/**
 * Aresta no estilo Obsidian Graph View: Bezier suave + animação wobbly (traço em movimento).
 */
export function ObsidianGraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      className="obsidian-edge-path"
      style={{
        stroke: 'var(--connection-default)',
        strokeWidth: 2,
        fill: 'none',
        ...(style as object),
      }}
    />
  );
}
