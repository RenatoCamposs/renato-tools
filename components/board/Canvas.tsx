'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBoardStore } from '@/lib/stores/boardStore';
import { ContentCard } from './ContentCard';
import { FolderCard } from './FolderCard';
import { FigJamBackground } from './FigJamBackground';
import type { Card, ContentCard as ContentCardType, FolderCard as FolderCardType } from '@/lib/types';

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

const nodeTypes: NodeTypes = {
  content: ContentCardNode,
  folder: FolderCardNode,
};

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
  const cards = useBoardStore((state) => state.cards);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const updateCard = useBoardStore((state) => state.updateCard);
  const toggleFolder = useBoardStore((state) => state.toggleFolder);
  const clearSelection = useBoardStore((state) => state.clearSelection);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Converter cards para nodes do React Flow
  useEffect(() => {
    const topLevelCards = cards.filter(card => !card.parentId);
    
    const flowNodes: Node[] = topLevelCards.map(card => ({
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
    }));

    setNodes(flowNodes);
  }, [cards, selectedCards, setNodes, toggleFolder, readOnly]);

  // Criar edges (conexões) baseado nos links
  useEffect(() => {
    const flowEdges: Edge[] = [];
    
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

  // Atualizar posição do card quando arrastado (só se não for readOnly)
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      if (!readOnly) updateCard(node.id, { position: node.position });
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
            if (selectedCards.includes(node.id)) return 'var(--primary-500)';
            return 'var(--neutral-300)';
          }}
          nodeBorderRadius={8}
          nodeStrokeWidth={2}
          maskColor="rgba(247, 245, 240, 0.8)"
          position="bottom-left"
          style={{
            background: 'var(--neutral-100)',
            border: '1px solid var(--neutral-300)',
            borderRadius: 'var(--radius-lg)',
          }}
        />
      </ReactFlow>
    </div>
  );
}
