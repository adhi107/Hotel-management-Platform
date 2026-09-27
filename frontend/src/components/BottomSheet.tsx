import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[88vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      haptic('light');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      haptic('selection');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className={`relative w-full sm:max-w-lg bg-aura-card border-t sm:border border-aura-border rounded-t-[28px] sm:rounded-2xl shadow-2xl flex flex-col ${maxHeight} z-10 overflow-hidden pb-[env(safe-area-inset-bottom,16px)]`}
          >
            {/* Drag Handle for Mobile */}
            <div className="flex justify-center pt-3 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-aura-border hover:bg-aura-text-muted transition-colors" />
            </div>

            {/* Sheet Header */}
            {(title || subtitle) && (
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-aura-border/60">
                <div>
                  {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
                  {subtitle && <p className="text-xs text-aura-text-muted mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={() => {
                    haptic('selection');
                    onClose();
                  }}
                  className="p-1.5 rounded-full text-aura-text-muted hover:text-white hover:bg-aura-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Sheet Content */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
