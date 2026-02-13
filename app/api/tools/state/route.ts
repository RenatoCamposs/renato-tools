/**
 * API de estado global do board — um único estado para todos os usuários.
 * Quem edita e salva deixa a página atualizada para todos.
 */

import { NextResponse } from 'next/server';
import type { Card, Viewport } from '@/lib/types';
import { DEFAULT_VIEWPORT } from '@/lib/types';

type StoredState = {
  cards: Card[];
  viewport: Viewport;
  cloudEnabled: boolean;
};

// Estado em memória (compartilhado por todos na mesma instância).
// Em produção com múltiplas instâncias, use Vercel KV ou um DB.
let globalState: StoredState = {
  cards: [],
  viewport: DEFAULT_VIEWPORT,
  cloudEnabled: true,
};

function serializeCard(card: Card & { createdAt?: Date | string; updatedAt?: Date | string }) {
  return {
    ...card,
    createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  };
}

export async function GET() {
  const payload = {
    cards: globalState.cards.map(serializeCard),
    viewport: globalState.viewport,
    cloudEnabled: globalState.cloudEnabled,
  };
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cards = [], viewport, cloudEnabled } = body as Partial<StoredState>;

    globalState = {
      cards: Array.isArray(cards) ? cards : globalState.cards,
      viewport:
        viewport && typeof viewport.x === 'number' && typeof viewport.y === 'number' && typeof viewport.zoom === 'number'
          ? viewport
          : globalState.viewport,
      cloudEnabled: typeof cloudEnabled === 'boolean' ? cloudEnabled : globalState.cloudEnabled,
    };

    return NextResponse.json({
      ok: true,
      message: 'Estado salvo. Visível para todos.',
    });
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro ao salvar' }, { status: 400 });
  }
}
