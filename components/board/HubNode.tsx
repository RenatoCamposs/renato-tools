'use client';

import { motion } from 'framer-motion';

export const HUB_NODE_SIZE = 72;
const EMOJI = '🧠';

export function HubNode() {
  return (
    <motion.div
      className="hub-brain-node flex items-center justify-center rounded-full select-none pointer-events-none"
      style={{
        width: HUB_NODE_SIZE,
        height: HUB_NODE_SIZE,
        background: 'var(--primary-200)',
        boxShadow: 'inset 0 0 0 2px var(--primary-500), 0 0 0 2px var(--primary-300), 0 0 24px rgba(255, 217, 120, 0.5), 0 0 48px rgba(255, 200, 87, 0.25)',
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
      <span className="text-3xl" style={{ lineHeight: 1 }}>
        {EMOJI}
      </span>
    </motion.div>
  );
}
