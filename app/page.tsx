'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Folder, Cloud, Zap } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-50)] via-[var(--neutral-50)] to-[var(--accent-cream)] flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <motion.div
          className="text-2xl font-bold text-[var(--primary-800)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ✨ Infinite Board
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => router.push('/sign-in')}
          >
            Entrar
          </Button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-[var(--primary-200)] rounded-full text-sm font-medium text-[var(--primary-800)]">
            <Sparkles className="inline mr-2" size={16} />
            Organize suas ideias visualmente
          </div>
          
          <h1 className="text-6xl font-bold text-[var(--neutral-900)] mb-6 max-w-4xl">
            Seu espaço infinito de{' '}
            <span className="text-[var(--primary-700)]">criatividade</span>
          </h1>
          
          <p className="text-xl text-[var(--neutral-600)] mb-8 max-w-2xl mx-auto">
            Board infinito estilo Miro com efeito de nuvem do Obsidian. 
            Cards, pastas, conexões e animações suaves para organizar tudo.
          </p>

          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/sign-up')}
              rightIcon={<ArrowRight />}
            >
              Começar Grátis
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/board')}
            >
              Ver Demo
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[var(--neutral-200)] hover:border-[var(--primary-400)] transition-colors">
            <div className="w-12 h-12 bg-[var(--primary-200)] rounded-xl flex items-center justify-center mb-4">
              <Cloud className="text-[var(--primary-700)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-2">
              Efeito Nuvem
            </h3>
            <p className="text-[var(--neutral-600)] text-sm">
              Cards flutuam e se organizam automaticamente como no Obsidian Graph View
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[var(--neutral-200)] hover:border-[var(--primary-400)] transition-colors">
            <div className="w-12 h-12 bg-[var(--accent-peach)] rounded-xl flex items-center justify-center mb-4">
              <Folder className="text-[var(--primary-700)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-2">
              Pastas Explosivas
            </h3>
            <p className="text-[var(--neutral-600)] text-sm">
              Pastas que expandem mostrando cards filhos com animação burst
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[var(--neutral-200)] hover:border-[var(--primary-400)] transition-colors">
            <div className="w-12 h-12 bg-[var(--accent-honey)] rounded-xl flex items-center justify-center mb-4">
              <Zap className="text-[var(--primary-700)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-2">
              Animações Snappy
            </h3>
            <p className="text-[var(--neutral-600)] text-sm">
              Hover effects, glow, e transições suaves em todos os elementos
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-[var(--neutral-500)]">
        <p>Feito com 💛 por Renato • 2026</p>
      </footer>
    </div>
  );
}
