'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  StraightEdge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils/cn';
import { useBoardStore } from '@/lib/stores/boardStore';
import { ContentCard } from './ContentCard';
import { FolderCard } from './FolderCard';
import { HubNode, HUB_NODE_SIZE } from './HubNode';
import { FigJamBackground } from './FigJamBackground';
import type { Card, ContentCard as ContentCardType, FolderCard as FolderCardType } from '@/lib/types';

/** Margem de pan: só 20% a mais fora do view padrão (em cada direção) */
const PAN_MARGIN_PERCENT = 0.2;

export const HUB_NODE_ID = '__hub_tools__';

// Custom Node Wrappers para React Flow
function ContentCardNode({ data }: { data: any }) {
  return (
    <ContentCard
      data={data.card}
      selected={data.selected}
      readOnly={data.readOnly}
      isExiting={data.isExiting}
    />
  );
}

function FolderCardNode({ data }: { data: any }) {
  return (
    <FolderCard
      data={data.card}
      selected={data.selected}
      onToggleExpand={data.onToggleExpand}
      readOnly={data.readOnly}
      isExiting={data.isExiting}
    />
  );
}

function HubNodeWrapper() {
  return <HubNode />;
}

const nodeTypes: NodeTypes = {
  content: ContentCardNode,
  folder: FolderCardNode,
  hub: HubNodeWrapper,
};

const edgeTypes: EdgeTypes = {
  obsidian: StraightEdge,
};

export const ORBIT_RADIUS = 280;

/** Distância mínima (px) entre o cérebro (hub) e os itens mais próximos */
const MIN_GAP_HUB_ITEMS = 50;
const HUB_RADIUS = HUB_NODE_SIZE / 2;
/** Distância mínima do centro do hub ao centro do card (para manter 50px de folga) */
const MIN_CARD_CENTER_FROM_HUB = HUB_RADIUS + MIN_GAP_HUB_ITEMS + 100; // 100 = metade da largura do card

export function getOrbitalPosition(index: number, total: number) {
  const angle = total <= 0 ? 0 : (index / total) * 2 * Math.PI;
  const r = Math.max(ORBIT_RADIUS, MIN_CARD_CENTER_FROM_HUB);
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
  };
}

const CARD_W = 200;
const CARD_H = 140;
/** Largura do card bookmark (w-fit: 140 texto + 12 gap + 48 img + 32 padding) */
const BOOKMARK_CARD_W = 232;
/** Espaçamento entre cards (menos vertical, igual ao horizontal) */
const CARD_GAP_X = 4;
const CARD_GAP_Y = 4;

/** Raio do burst de filhos da pasta (deve bater com FolderCard) */
const FOLDER_BURST_RADIUS = 250;

function isBookmarkCard(c: Card): c is ContentCardType {
  return c.type === 'content' && !!(c as ContentCardType).url && (c as ContentCardType).image.startsWith('http');
}

function getCardDimensions(card: Card): { w: number; h: number } {
  if (isBookmarkCard(card)) return { w: BOOKMARK_CARD_W, h: CARD_H };
  return { w: CARD_W, h: CARD_H };
}

type Obstacle = { id: string; position: { x: number; y: number }; w: number; h: number };

/**
 * Posições em coordenadas do flow dos filhos de pastas expandidas (burst).
 * Usado para colisão: o card não pode ser solto em cima dos filhos.
 */
function getFolderChildrenObstacles(cards: Card[]): Obstacle[] {
  const list: Obstacle[] = [];
  const folders = cards.filter((c): c is FolderCardType => c.type === 'folder' && !c.parentId && (c as FolderCardType).isExpanded);
  for (const folder of folders) {
    const children = cards.filter((c) => c.parentId === folder.id);
    if (children.length === 0) continue;
    const folderCenterX = (folder.position?.x ?? 0) + 100;
    const folderCenterY = (folder.position?.y ?? 0) + 70;
    const angleFromHub = Math.atan2(folderCenterY, folderCenterX);
    children.forEach((child, index) => {
      const total = children.length;
      const angle = angleFromHub - Math.PI / 2 + (index / Math.max(1, total)) * Math.PI;
      const px = (folder.position?.x ?? 0) + Math.cos(angle) * FOLDER_BURST_RADIUS;
      const py = (folder.position?.y ?? 0) + Math.sin(angle) * FOLDER_BURST_RADIUS;
      const { w, h } = getCardDimensions(child);
      list.push({ id: `folder-child-${folder.id}-${child.id}`, position: { x: px, y: py }, w, h });
    });
  }
  return list;
}

function rectOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
  gapX: number,
  gapY: number,
  sizeA: { w: number; h: number },
  sizeB: { w: number; h: number }
): { dx: number; dy: number } | null {
  const aR = a.x + sizeA.w;
  const aB = a.y + sizeA.h;
  const bR = b.x + sizeB.w;
  const bB = b.y + sizeB.h;
  if (aR + gapX <= b.x || a.x >= bR + gapX || aB + gapY <= b.y || a.y >= bB + gapY) return null;
  const overlapX = Math.min(aR, bR) - Math.max(a.x, b.x) - gapX;
  const overlapY = Math.min(aB, bB) - Math.max(a.y, b.y) - gapY;
  if (overlapX <= 0 && overlapY <= 0) return null;
  const dx = overlapX > 0 ? (a.x - b.x > 0 ? overlapX : -overlapX) : 0;
  const dy = overlapY > 0 ? (a.y - b.y > 0 ? overlapY : -overlapY) : 0;
  return { dx, dy };
}

function resolveCollision(
  movingId: string,
  position: { x: number; y: number },
  others: Obstacle[],
  movingSize: { w: number; h: number }
): { x: number; y: number } {
  let x = position.x;
  let y = position.y;
  const centerX = () => x + movingSize.w / 2;
  const centerY = () => y + movingSize.h / 2;
  const distFromHub = () => Math.hypot(centerX(), centerY());

  for (let iter = 0; iter < 12; iter++) {
    let pushed = false;
    for (const o of others) {
      if (o.id === movingId) continue;
      const overlap = rectOverlap({ x, y }, o.position, CARD_GAP_X, CARD_GAP_Y, movingSize, { w: o.w, h: o.h });
      if (overlap) {
        x += overlap.dx;
        y += overlap.dy;
        pushed = true;
      }
    }
    if (distFromHub() < MIN_CARD_CENTER_FROM_HUB) {
      const d = distFromHub();
      if (d > 0) {
        const scale = MIN_CARD_CENTER_FROM_HUB / d;
        const cx = centerX();
        const cy = centerY();
        x = cx * scale - movingSize.w / 2;
        y = cy * scale - movingSize.h / 2;
        pushed = true;
      }
    }
    if (!pushed) break;
  }
  return { x, y };
}

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
  const cards = useBoardStore((state) => state.cards);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const updateCard = useBoardStore((state) => state.updateCard);
  const toggleFolder = useBoardStore((state) => state.toggleFolder);
  const clearSelection = useBoardStore((state) => state.clearSelection);
  const viewport = useBoardStore((state) => state.viewport);
  const setViewport = useBoardStore((state) => state.setViewport);
  const exitingCardIds = useBoardStore((state) => state.exitingCardIds);
  const hasBeenHydrated = useBoardStore((state) => state.hasBeenHydrated);
  const hasOrbitLaidOut = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [useCenteredViewport, setUseCenteredViewport] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const lastViewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  const addCardToFolder = useBoardStore((state) => state.addCardToFolder);

  const dragLastPosRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [momentum, setMomentum] = useState<{
    nodeId: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
  } | null>(null);
  const momentumRef = useRef<number | null>(null);
  const FRICTION = 0.92;
  const VELOCITY_MIN = 1.5;
  const MOMENTUM_VELOCITY_MULTIPLIER = 0.2;
  const MOMENTUM_SPEED_THRESHOLD = 15;

  const [collisionCorrection, setCollisionCorrection] = useState<{
    nodeId: string;
    x: number;
    y: number;
    fromX: number;
    fromY: number;
    startTime: number;
  } | null>(null);
  const collisionCorrectionRef = useRef<number | null>(null);
  const COLLISION_ANIM_MS = 220;
  const collisionTargetRef = useRef<{
    nodeId: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
    startTime: number;
  } | null>(null);

  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

  const applyPositionWithCollision = useCallback(
    (cardId: string, position: { x: number; y: number }) => {
      const movingCard = cards.find((c) => c.id === cardId);
      const movingSize = movingCard ? getCardDimensions(movingCard) : { w: CARD_W, h: CARD_H };
      const topLevel = cards.filter((c) => !c.parentId && c.id !== cardId);
      const others: Obstacle[] = [
        ...topLevel.map((c) => ({ id: c.id, position: c.position, ...getCardDimensions(c) })),
        ...getFolderChildrenObstacles(cards),
      ];
      const resolved = resolveCollision(cardId, position, others, movingSize);
      const dist = Math.hypot(resolved.x - position.x, resolved.y - position.y);
      if (dist < 2) {
        updateCard(cardId, { position: resolved });
        return;
      }
      const startTime = performance.now();
      collisionTargetRef.current = {
        nodeId: cardId,
        from: position,
        to: resolved,
        startTime,
      };
      setCollisionCorrection({
        nodeId: cardId,
        x: position.x,
        y: position.y,
        fromX: position.x,
        fromY: position.y,
        startTime,
      });
      const tick = () => {
        const target = collisionTargetRef.current;
        if (!target) return;
        const t = Math.min(1, (performance.now() - target.startTime) / COLLISION_ANIM_MS);
        const eased = easeOutCubic(t);
        const x = target.from.x + (target.to.x - target.from.x) * eased;
        const y = target.from.y + (target.to.y - target.from.y) * eased;
        setCollisionCorrection((prev) =>
          prev && prev.nodeId === target.nodeId ? { ...prev, x, y } : prev
        );
        if (t >= 1) {
          collisionTargetRef.current = null;
          collisionCorrectionRef.current = null;
          updateCard(target.nodeId, { position: target.to });
          setCollisionCorrection(null);
          return;
        }
        collisionCorrectionRef.current = requestAnimationFrame(tick);
      };
      collisionCorrectionRef.current = requestAnimationFrame(tick);
    },
    [cards, updateCard]
  );

  // Medir container para limitar pan e centralizar; medir cedo para evitar view deslocada (esquerda-cima)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0)
        setContainerSize({ width: rect.width, height: rect.height });
    };
    measure();
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 0, height: 0 };
      if (width > 0 && height > 0) setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Aplicar viewport centrado só após primeiro frame para nós/arestas renderizarem
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setUseCenteredViewport(true);
    });
    return () => cancelAnimationFrame(t);
  }, []);

  const cw = containerSize.width || 800;
  const ch = containerSize.height || 600;
  const centerX = cw / 2;
  const centerY = ch / 2;
  const marginX = cw * PAN_MARGIN_PERCENT;
  const marginY = ch * PAN_MARGIN_PERCENT;

  const panBoundsRef = useRef({ centerX, centerY, marginX, marginY });
  panBoundsRef.current = { centerX, centerY, marginX, marginY };
  const [syncedViewportAfterHydrate, setSyncedViewportAfterHydrate] = useState(false);

  // Bounds do conteúdo: hub (-36,-36) 72px + órbita 280 + cards 200x140
  const CONTENT_PADDING = 80;
  const contentWidth = ORBIT_RADIUS * 2 + 200 + CONTENT_PADDING * 2;
  const contentHeight = ORBIT_RADIUS * 2 + 140 + CONTENT_PADDING * 2;
  const fitZoom = Math.min(
    1,
    (cw / contentWidth) * 0.95,
    (ch / contentHeight) * 0.95
  );

  // Manter lastViewportRef em sync com a view exibida quando em default (centralizada), para o pan funcionar logo ao carregar
  useEffect(() => {
    if (useCenteredViewport && viewport.x === 0 && viewport.y === 0) {
      lastViewportRef.current = { x: centerX, y: centerY, zoom: fitZoom };
    }
  }, [useCenteredViewport, viewport.x, viewport.y, centerX, centerY, fitZoom]);

  // (0,0) no store = cérebro no centro da tela; traduzir para coordenadas de tela
  const isDefaultView = viewport.x === 0 && viewport.y === 0;
  const effectiveViewport: Viewport = isDefaultView
    ? { x: centerX, y: centerY, zoom: Math.min(1, viewport.zoom ?? fitZoom) }
    : { ...viewport, zoom: Math.min(1, viewport.zoom ?? 1) };
  // Viewport controlado só no sync pós-hydrate (uma vez). Durante o pan = uncontrolled = 100% local, 0 travamento.
  const controlledViewport: Viewport | undefined =
    hasBeenHydrated && !syncedViewportAfterHydrate ? effectiveViewport : undefined;

  const onViewportChange = useCallback((next: Viewport) => {
    lastViewportRef.current = next;
    // Zero setState durante o pan → zero re-renders → arraste 100% local na máquina do usuário.
  }, []);

  useEffect(() => {
    if (hasBeenHydrated && !syncedViewportAfterHydrate) {
      const t = requestAnimationFrame(() => setSyncedViewportAfterHydrate(true));
      return () => cancelAnimationFrame(t);
    }
  }, [hasBeenHydrated, syncedViewportAfterHydrate]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Nó central (hub) + cards em órbita ao redor do brain
  useEffect(() => {
    const topLevelCards = cards.filter(card => !card.parentId);
    const half = HUB_NODE_SIZE / 2;

    // Só aplica órbita quando cards foram adicionados localmente; não sobrescreve posições carregadas do API (hydrate)
    if (topLevelCards.length > 0 && !hasOrbitLaidOut.current && !hasBeenHydrated) {
      topLevelCards.forEach((card, index) => {
        const pos = getOrbitalPosition(index, topLevelCards.length);
        updateCard(card.id, { position: pos });
      });
      hasOrbitLaidOut.current = true;
    }
    if (topLevelCards.length > 0 && hasBeenHydrated) hasOrbitLaidOut.current = true;

    const hubNode: Node = {
      id: HUB_NODE_ID,
      type: 'hub',
      position: { x: -half, y: -half },
      data: {},
      draggable: false,
      selectable: false,
      width: HUB_NODE_SIZE,
      height: HUB_NODE_SIZE,
      zIndex: 0,
    };

    const cardNodes: Node[] = topLevelCards.map(card => {
      let pos = card.position;
      if (momentum && momentum.nodeId === card.id) pos = { x: momentum.x, y: momentum.y };
      else if (collisionCorrection && collisionCorrection.nodeId === card.id)
        pos = { x: collisionCorrection.x, y: collisionCorrection.y };
      const { w, h } = getCardDimensions(card);
      return {
      id: card.id,
      type: card.type,
      position: pos,
      width: w,
      height: h,
      data: {
        card,
        selected: selectedCards.includes(card.id),
        onToggleExpand: toggleFolder,
        readOnly,
        isExiting: exitingCardIds.includes(card.id),
      },
      draggable: !readOnly && !exitingCardIds.includes(card.id),
      zIndex: 1,
    };
    });

    setNodes([hubNode, ...cardNodes]);
  }, [cards, selectedCards, exitingCardIds, hasBeenHydrated, setNodes, toggleFolder, readOnly, updateCard, momentum, collisionCorrection]);

  // Edges: hub → todos os cards (brain) + pasta↔pasta/item + content↔content
  useEffect(() => {
    const topLevelCards = cards.filter(card => !card.parentId);
    const flowEdges: Edge[] = [];
    const edgeIds = new Set<string>();

    const edgeStyle = { stroke: '#B8A070', strokeWidth: 2 };
    const hubEdgeStyle = {
      stroke: 'var(--primary-400)',
      strokeWidth: 2.5,
    };
    const addEdgeOnce = (
      id: string,
      source: string,
      target: string,
      type: 'obsidian' | 'default',
      style?: Record<string, unknown>,
      opts?: { sourceHandle?: string; targetHandle?: string }
    ) => {
      if (edgeIds.has(id)) return;
      edgeIds.add(id);
      flowEdges.push({
        id,
        source,
        target,
        type,
        sourceHandle: opts?.sourceHandle,
        targetHandle: opts?.targetHandle,
        className: type === 'obsidian' ? 'obsidian-graph-edge' : undefined,
        style: type === 'obsidian' ? hubEdgeStyle : { ...edgeStyle, ...style },
      });
    };

    // 1) Cérebro (hub) → todos os itens de topo. Linha reta; origem no lado do hub que enfrenta o card, fim no centro-esquerda do card (atrás).
    const getHubSourceHandle = (pos: { x: number; y: number } | undefined) => {
      if (!pos) return 'hub-source';
      const cx = pos.x + 100;
      const cy = pos.y + 70;
      const angle = Math.atan2(cy, cx);
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) return 'hub-source';   // direita
      if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) return 'hub-bottom';
      if (angle >= (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) return 'hub-left';
      return 'hub-top';
    };
    topLevelCards.forEach(card => {
      addEdgeOnce(`${HUB_NODE_ID}-${card.id}`, HUB_NODE_ID, card.id, 'obsidian', undefined, {
        sourceHandle: getHubSourceHandle(card.position),
        targetHandle: 'target',
      });
    });

    // 2) Links de pastas: pastas conectam entre pastas e aos itens (só nós do flow).
    //    Conexão pasta↔filho (card dentro da pasta): os filhos não são nós; o traçado é o burst SVG dentro de FolderCard.
    cards.forEach(card => {
      if (card.type === 'folder') {
        const folderCard = card as FolderCardType;
        folderCard.links?.forEach(targetId => {
          addEdgeOnce(`${card.id}-${targetId}`, card.id, targetId, 'default');
        });
      }
    });

    // 3) Links de content (conexões manuais entre cards)
    cards.forEach(card => {
      if (card.type === 'content') {
        const contentCard = card as ContentCardType;
        contentCard.links?.forEach(targetId => {
          addEdgeOnce(`${card.id}-${targetId}`, card.id, targetId, 'default');
        });
      }
    });

    setEdges(flowEdges);
  }, [cards, setEdges]);

  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 140;

  const onNodeDrag = useCallback((_e: React.MouseEvent | React.TouchEvent, _node: Node) => {
    const t = performance.now();
    dragLastPosRef.current = { x: _node.position.x, y: _node.position.y, t };
  }, []);

  const momentumStateRef = useRef<{ nodeId: string; x: number; y: number; vx: number; vy: number } | null>(null);
  const momentumRunningRef = useRef(false);

  useEffect(() => {
    if (!momentum) {
      momentumRunningRef.current = false;
      return;
    }
    if (momentumRunningRef.current) return;
    momentumRunningRef.current = true;
    momentumStateRef.current = { ...momentum };
    const tick = () => {
      const m = momentumStateRef.current;
      if (!m) return;
      const dt = 16 / 1000; // ~16ms por frame
      let { x, y, vx, vy } = m;
      x += vx * dt;
      y += vy * dt;
      vx *= FRICTION;
      vy *= FRICTION;
      const done = Math.abs(vx) < VELOCITY_MIN && Math.abs(vy) < VELOCITY_MIN;
      if (done) {
        momentumStateRef.current = null;
        momentumRef.current = null;
        momentumRunningRef.current = false;
        applyPositionWithCollision(m.nodeId, { x, y });
        setMomentum(null);
        return;
      }
      momentumStateRef.current = { ...m, x, y, vx, vy };
      setMomentum((prev) => (prev && prev.nodeId === m.nodeId ? { ...prev, x, y, vx, vy } : prev));
      momentumRef.current = requestAnimationFrame(tick);
    };
    momentumRef.current = requestAnimationFrame(tick);
    return () => {
      if (momentumRef.current != null) cancelAnimationFrame(momentumRef.current);
    };
  }, [momentum?.nodeId, updateCard, applyPositionWithCollision]);

  // Atualizar posição do card quando arrastado; se for content e soltar em cima de uma pasta, move para a pasta. Ao soltar, aplica momentum (deslize tipo Obsidian).
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, node: Node) => {
      if (readOnly || node.id === HUB_NODE_ID) return;
      const topLevelFolders = cards.filter(
        (c) => !c.parentId && c.type === 'folder' && c.id !== node.id
      ) as FolderCardType[];
      const centerX = node.position.x + (node.width ?? CARD_WIDTH) / 2;
      const centerY = node.position.y + (node.height ?? CARD_HEIGHT) / 2;
      let droppedOnFolder: FolderCardType | null = null;
      for (const folder of topLevelFolders) {
        const fx = folder.position.x;
        const fy = folder.position.y;
        if (
          centerX >= fx &&
          centerX <= fx + CARD_WIDTH &&
          centerY >= fy &&
          centerY <= fy + CARD_HEIGHT
        ) {
          droppedOnFolder = folder;
          break;
        }
      }
      if (droppedOnFolder && node.type === 'content') {
        dragLastPosRef.current = null;
        addCardToFolder(node.id, droppedOnFolder.id);
      } else {
        const last = dragLastPosRef.current;
        dragLastPosRef.current = null;
        const dtMs = last ? Math.max(16, performance.now() - last.t) : 0;
        const dtSec = dtMs / 1000;
        const vx = dtSec > 0 && last ? (node.position.x - last.x) / dtSec : 0;
        const vy = dtSec > 0 && last ? (node.position.y - last.y) / dtSec : 0;
        const speed = Math.hypot(vx, vy);
        if (speed >= MOMENTUM_SPEED_THRESHOLD) {
          setMomentum({
            nodeId: node.id,
            x: node.position.x,
            y: node.position.y,
            vx: vx * MOMENTUM_VELOCITY_MULTIPLIER,
            vy: vy * MOMENTUM_VELOCITY_MULTIPLIER,
          });
          momentumRef.current = 1;
        } else {
          applyPositionWithCollision(node.id, node.position);
        }
      }
    },
    [cards, updateCard, addCardToFolder, readOnly, applyPositionWithCollision]
  );

  // Criar novo card ao double-click no canvas
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Detectar double-click manualmente se necessário
      clearSelection();
    },
    [clearSelection]
  );

  // Criar conexão entre cards: content→links ou pasta→links (pastas conectam entre pastas e itens)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly || !connection.target) return;
      const sourceCard = cards.find(c => c.id === connection.source);
      if (!sourceCard) return;

      if (sourceCard.type === 'content') {
        const contentCard = sourceCard as ContentCardType;
        const currentLinks = contentCard.links || [];
        if (!currentLinks.includes(connection.target)) {
          updateCard(connection.source, {
            links: [...currentLinks, connection.target],
          });
        }
      } else if (sourceCard.type === 'folder') {
        const folderCard = sourceCard as FolderCardType;
        const currentLinks = folderCard.links || [];
        if (!currentLinks.includes(connection.target)) {
          updateCard(connection.source, {
            links: [...currentLinks, connection.target],
          });
        }
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [cards, updateCard, setEdges, readOnly]
  );


  return (
    <div ref={containerRef} className="w-full h-screen">
      <ReactFlow
        className={cn(
          isDraggingNode && 'react-flow-node-dragging',
          (momentum || collisionCorrection) && 'react-flow-momentum'
        )}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={() => setIsDraggingNode(true)}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={(e, node) => {
          setIsDraggingNode(false);
          onNodeDragStop(e, node);
        }}
        onMoveStart={() => setIsPanning(true)}
        onMoveEnd={() => {
          setIsPanning(false);
          const current = lastViewportRef.current;
          const zoom = Math.min(1, Math.max(0.2, current.zoom ?? 1));
          const { centerX: cx, centerY: cy, marginX: mx, marginY: my } = panBoundsRef.current;
          const clampedX = Math.max(cx - mx, Math.min(cx + mx, current.x));
          const clampedY = Math.max(cy - my, Math.min(cy + my, current.y));
          const nearCenter = Math.abs(clampedX - cx) < 2 && Math.abs(clampedY - cy) < 2;
          setViewport(
            nearCenter ? { x: 0, y: 0, zoom } : { x: clampedX, y: clampedY, zoom }
          );
        }}
        onConnect={readOnly ? undefined : onConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        {...(controlledViewport != null ? { viewport: controlledViewport } : {})}
        onViewportChange={onViewportChange}
        minZoom={0.2}
        maxZoom={1}
        defaultViewport={effectiveViewport}
        defaultEdgeOptions={{
          style: { stroke: '#D4C49E', strokeWidth: 2 },
          type: 'default',
        }}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        onlyRenderVisibleElements={false}
      >
        <FigJamBackground />
        
        <Controls 
          showZoom={false}
          showFitView
          showInteractive
          position="bottom-right"
        />
        
        <MiniMap
          nodeColor={(node) => {
            if (node.id === HUB_NODE_ID) return 'var(--primary-500)';
            if (selectedCards.includes(node.id)) return 'var(--primary-600)';
            return 'var(--primary-400)';
          }}
          nodeStrokeColor="var(--primary-700)"
          nodeBorderRadius={8}
          nodeStrokeWidth={2}
          maskColor="rgba(247, 245, 240, 0.85)"
          maskStrokeColor={isPanning ? 'var(--primary-500)' : 'transparent'}
          maskStrokeWidth={isPanning ? 1 : 0}
          position="bottom-left"
          pannable
          zoomable
          style={{
            background: 'var(--neutral-100)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'inset 0 0 0 1px var(--neutral-400), var(--shadow-md)',
            zIndex: 5,
          }}
        />
      </ReactFlow>
    </div>
  );
}
