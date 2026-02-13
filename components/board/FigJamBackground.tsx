'use client';

import { useMemo } from 'react';
import { Background, useViewport, BackgroundVariant } from '@xyflow/react';

/**
 * Background estilo FigJam:
 * - Fundo branco/leve
 * - Grid de pontos que muda com o zoom (ao zoom in, pontos mais densos)
 * - Comportamento similar ao FigJam
 */
const BASE_GAP = 24;
const MIN_GAP = 8;
const MAX_GAP = 64;
const BASE_SIZE = 1.5;
const MIN_SIZE = 1;
const MAX_SIZE = 2.5;

export function FigJamBackground() {
  const { zoom } = useViewport();

  const { gap, size } = useMemo(() => {
    const gap = Math.max(MIN_GAP, Math.min(MAX_GAP, BASE_GAP / zoom));
    const size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, BASE_SIZE / zoom));
    return { gap, size };
  }, [zoom]);

  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={gap}
      size={size}
      color="#D4C078"
    />
  );
}
