'use client';

import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';

export const HUB_NODE_SIZE = 72;
const EMOJI = '🧠';

export function HubNode() {
  return (
    <motion.div
      className="hub-brain-node relative flex items-center justify-center rounded-full select-none"
      style={{
        width: HUB_NODE_SIZE,
        height: HUB_NODE_SIZE,
        background: 'var(--primary-200)',
        boxShadow: 'inset 0 0 0 2px var(--primary-800), inset 0 0 0 2px var(--primary-800), 0 0 24px rgba(255, 217, 120, 0.5), 0 0 48px rgba(255, 200, 87, 0.25)',
      }}
      animate={{
        scale: [1, 1.06, 0.97, 1],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Handle para as arestas cérebro → cards/pastas (traçado visível até o hub) */}
      <Handle type="source" position={Position.Right} id="hub-source" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent" style={{ right: -2, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="hub-left" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent" style={{ left: -2, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Top} id="hub-top" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent" style={{ top: -2, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="hub-bottom" className="!w-0 !h-0 !min-w-0 !min-h-0 !border-0 !bg-transparent" style={{ bottom: -2, left: '50%', transform: 'translateX(-50%)' }} />
      <span className="text-3xl pointer-events-none" style={{ lineHeight: 1 }}>
        {EMOJI}
      </span>
    </motion.div>
  );
}
