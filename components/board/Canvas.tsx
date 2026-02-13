'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  BezierEdge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBoardStore } from '@/lib/stores/boardStore';
import { ContentCard } from './ContentCard';
import { FolderCard } from './FolderCard';
import { HubNode, HUB_NODE_SIZE } from './HubNode';
import { FigJamBackground } from './FigJamBackground';
import type { Card, ContentCard as ContentCardType, FolderCard as FolderCardType } from '@/lib/types';

export const HUB_NODE_ID = '__hub_tools__';

// Custom Node Wrappers para React Flow
function ContentCardNode({ data }: { data: any }) {
  return <ContentCard data={data.card} selected={data.selected} readOnly={data.readOnly} />;
}

function FolderCardNode({ data }: { data: any }) {
  return (
    <FolderCard 
      data={data.card} 
      selected={data.selected}
      onToggleExpand={data.onToggleExpand}
      readOnly={data.readOnly}
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
  obsidian: BezierEdge,
};

export const ORBIT_RADIUS = 280;

export function getOrbitalPosition(index: number, total: number) {
  const angle = total <= 0 ? 0 : (index / total) * 2 * Math.PI;
  return {
    x: ORBIT_RADIUS * Math.cos(angle),
    y: ORBIT_RADIUS * Math.sin(angle),
  };
}

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
  const cards = useBoardStore((state) => state.cards);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const updateCard = useBoardStore((state) => state.updateCard);
  const toggleFolder = useBoardStore((state) => state.toggleFolder);
  const clearSelection = useBoardStore((state) => state.clearSelection);
  const hasOrbitLaidOut = useRef(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Nó central (hub) + cards em órbita ao redor do brain
  useEffect(() => {
    const topLevelCards = cards.filter(card => !card.parentId);
    const half = HUB_NODE_SIZE / 2;

    if (topLevelCards.length > 0 && !hasOrbitLaidOut.current) {
      topLevelCards.forEach((card, index) => {
        const pos = getOrbitalPosition(index, topLevelCards.length);
        updateCard(card.id, { position: pos });
      });
      hasOrbitLaidOut.current = true;
    }

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

    const cardNodes: Node[] = topLevelCards.map(card => ({
      id: card.id,
      type: card.type,
      position: card.position,
      data: {
        card,
        selected: selectedCards.includes(card.id),
        onToggleExpand: toggleFolder,
        readOnly,
      },
      draggable: !readOnly,
      zIndex: 1,
    }));

    setNodes([hubNode, ...cardNodes]);
  }, [cards, selectedCards, setNodes, toggleFolder, readOnly, updateCard]);

  // Edges: hub -> todos os cards (estilo Obsidian) + links entre cards
  useEffect(() => {
    const topLevelCards = cards.filter(card => !card.parentId);
    const flowEdges: Edge[] = [];

    // Linhas do hub central para cada card (Bezier; animação via CSS .obsidian-graph-edge)
    topLevelCards.forEach(card => {
      flowEdges.push({
        id: `${HUB_NODE_ID}-${card.id}`,
        source: HUB_NODE_ID,
        target: card.id,
        type: 'obsidian',
        className: 'obsidian-graph-edge',
        style: { stroke: '#D4C49E', strokeWidth: 2 },
      });
    });

    // Links entre cards (conexões manuais)
    cards.forEach(card => {
      if (card.type === 'content') {
        const contentCard = card as ContentCardType;
        contentCard.links?.forEach(targetId => {
          flowEdges.push({
            id: `${card.id}-${targetId}`,
            source: card.id,
            target: targetId,
            type: 'default',
            style: {
              stroke: 'var(--connection-default)',
              strokeWidth: 2,
            },
          });
        });
      }
    });

    setEdges(flowEdges);
  }, [cards, setEdges]);

  // Atualizar posição do card quando arrastado (hub não é arrastável)
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      if (readOnly || node.id === HUB_NODE_ID) return;
      updateCard(node.id, { position: node.position });
    },
    [updateCard, readOnly]
  );

  // Criar novo card ao double-click no canvas
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Detectar double-click manualmente se necessário
      clearSelection();
    },
    [clearSelection]
  );

  // Criar conexão entre cards (só se não for readOnly)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      const sourceCard = cards.find(c => c.id === connection.source);
      if (sourceCard && sourceCard.type === 'content') {
        const contentCard = sourceCard as ContentCardType;
        const currentLinks = contentCard.links || [];
        
        if (connection.target && !currentLinks.includes(connection.target)) {
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
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={readOnly ? undefined : onConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <FigJamBackground />
        
        <Controls 
          showZoom
          showFitView
          showInteractive
          position="bottom-right"
        />
        
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === HUB_NODE_ID) return 'var(--primary-500)';
            if (selectedCards.includes(node.id)) return 'var(--primary-600)';
            return 'var(--neutral-300)';
          }}
          nodeBorderRadius={8}
          nodeStrokeWidth={2}
          maskColor="rgba(247, 245, 240, 0.8)"
          position="bottom-left"
          style={{
            background: 'var(--neutral-100)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'inset 0 0 0 1px var(--neutral-400), var(--shadow-md)',
          }}
        />
      </ReactFlow>
    </div>
  );
}
