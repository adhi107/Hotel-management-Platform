import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  brandName?: string;
  tagline?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  brandName = 'NOVAFOOD OS',
  tagline = 'The Universal Food & Beverage Operating System',
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 400); // Wait for exit animation
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-96 h-96 bg-aura-indigo/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-aura-card to-aura-surface border border-aura-border/80 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-aura-indigo/20 to-transparent" />
              <UtensilsCrossed className="w-10 h-10 text-aura-indigo relative z-10" />
            </div>
          </motion.div>

          {/* Brand Name & Tagline */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            className="text-center relative z-10"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>{brandName}</span>
              <Sparkles className="w-4 h-4 text-aura-indigo animate-pulse" />
            </h1>
            <p className="text-xs text-aura-text-muted mt-2 tracking-wide font-medium max-w-xs">
              {tagline}
            </p>
          </motion.div>

          {/* Micro Loading Progress Indicator */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeInOut' }}
            className="h-0.5 bg-gradient-to-r from-aura-indigo to-aura-cyan rounded-full mt-10"
          />

          {/* Footer Version Tag */}
          <div className="absolute bottom-8 text-[10px] text-aura-text-muted/60 tracking-wider uppercase font-mono">
            v2.4.0 • Enterprise Cloud Core
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
