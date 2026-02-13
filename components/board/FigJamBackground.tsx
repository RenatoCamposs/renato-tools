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

export function FigJamBackground() {
  const { zoom } = useViewport();

  const { gap, size } = useMemo(() => {
    // Ao dar zoom in (zoom > 1): gap menor = mais pontos na tela
    // Ao dar zoom out (zoom < 1): gap maior = menos pontos
    const gap = Math.max(MIN_GAP, Math.min(MAX_GAP, BASE_GAP / zoom));
    const size = Math.max(0.5, Math.min(1.5, 1 / zoom));
    return { gap, size };
  }, [zoom]);

  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={gap}
      size={size}
      color="var(--figjam-dot-color)"
    />
  );
}
