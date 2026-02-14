/**
 * API de estado GLOBAL do board — um único estado para todos os usuários.
 * Todos veem o mesmo board; só uma pessoa precisa clicar em Salvar para persistir.
 * Persistência em arquivo (default: .data/board-state.json) para sobreviver a restarts.
 */

import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { Card, Viewport } from '@/lib/types';
import { DEFAULT_VIEWPORT } from '@/lib/types';

type StoredState = {
  cards: Card[];
  viewport: Viewport;
  cloudEnabled: boolean;
};

// Estado em memória (compartilhado por todos na mesma instância).
let globalState: StoredState = {
  cards: [],
  viewport: DEFAULT_VIEWPORT,
  cloudEnabled: true,
};

let stateLoadedFromFile = false;

function getStateFilePath(): string | null {
  const envPath = process.env.BOARD_STATE_FILE;
  if (envPath) return join(process.cwd(), envPath);
  return join(process.cwd(), '.data', 'board-state.json');
}

function serializeCard(card: Card & { createdAt?: Date | string; updatedAt?: Date | string }) {
  return {
    ...card,
    createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  };
}

function parseCard(card: Record<string, unknown>): Card {
  const c = { ...card } as unknown as Card & { createdAt?: string; updatedAt?: string };
  if (typeof c.createdAt === 'string') c.createdAt = new Date(c.createdAt) as unknown as Date;
  if (typeof c.updatedAt === 'string') c.updatedAt = new Date(c.updatedAt) as unknown as Date;
  return c as Card;
}

async function loadStateFromFile(): Promise<void> {
  if (stateLoadedFromFile) return;
  const filePath = getStateFilePath();
  if (!filePath) return;
  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as StoredState;
    if (Array.isArray(data.cards)) {
      globalState.cards = data.cards.map((c) => parseCard(c as Record<string, unknown>));
    }
    if (data.viewport && typeof data.viewport.x === 'number' && typeof data.viewport.y === 'number' && typeof data.viewport.zoom === 'number') {
      globalState.viewport = data.viewport;
    }
    if (typeof data.cloudEnabled === 'boolean') {
      globalState.cloudEnabled = data.cloudEnabled;
    }
    stateLoadedFromFile = true;
  } catch {
    // Arquivo não existe ou inválido — mantém estado em memória
  }
}

async function saveStateToFile(): Promise<void> {
  const filePath = getStateFilePath();
  if (!filePath) return;
  try {
    const dir = join(filePath, '..');
    await mkdir(dir, { recursive: true });
    const payload = {
      cards: globalState.cards.map(serializeCard),
      viewport: globalState.viewport,
      cloudEnabled: globalState.cloudEnabled,
    };
    await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch {
    // FS read-only (ex.: Vercel) ou permissão — ignora
  }
}

export async function GET() {
  await loadStateFromFile();
  const payload = {
    cards: globalState.cards.map(serializeCard),
    viewport: globalState.viewport,
    cloudEnabled: globalState.cloudEnabled,
  };
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    await loadStateFromFile();
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

    await saveStateToFile();

    return NextResponse.json({
      ok: true,
      message: 'Estado salvo. Visível para todos.',
    });
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro ao salvar' }, { status: 400 });
  }
}
