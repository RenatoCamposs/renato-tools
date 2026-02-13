'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
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
import type { Card, ContentCard as ContentCardType, FolderCard as FolderCardType } from '@/lib/types';

// Custom Node Wrappers para React Flow
function ContentCardNode({ data }: { data: any }) {
  return <ContentCard data={data.card} selected={data.selected} />;
}

function FolderCardNode({ data }: { data: any }) {
  return (
    <FolderCard 
      data={data.card} 
      selected={data.selected}
      onToggleExpand={data.onToggleExpand}
    />
  );
}

const nodeTypes: NodeTypes = {
  content: ContentCardNode,
  folder: FolderCardNode,
};

export function Canvas() {
  const cards = useBoardStore((state) => state.cards);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const updateCard = useBoardStore((state) => state.updateCard);
  const addCard = useBoardStore((state) => state.addCard);
  const toggleFolder = useBoardStore((state) => state.toggleFolder);
  const clearSelection = useBoardStore((state) => state.clearSelection);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
      },
      draggable: true,
    }));

    setNodes(flowNodes);
  }, [cards, selectedCards, setNodes, toggleFolder]);

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

  // Atualizar posição do card quando arrastado
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      updateCard(node.id, { position: node.position });
    },
    [updateCard]
  );

  // Criar novo card ao double-click no canvas
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;

      addCard({
        type: 'content',
        position: { x, y },
        title: 'Novo Card',
        description: 'Clique para editar',
        image: '📝',
      });
    },
    [addCard]
  );

  // Criar conexão entre cards
  const onConnect = useCallback(
    (connection: Connection) => {
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
    [cards, updateCard, setEdges]
  );

  // Limpar seleção ao clicar no background
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneDoubleClick={onPaneDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="var(--canvas-grid-color)" 
          gap={20}
          variant="dots"
          size={1}
        />
        
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
