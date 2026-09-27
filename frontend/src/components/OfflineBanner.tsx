import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showSyncedToast, setShowSyncedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncedToast(true);
      const timer = setTimeout(() => setShowSyncedToast(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-aura-amber/20 border border-aura-amber/40 backdrop-blur-md text-aura-amber px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium"
        >
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline Mode • Sales will sync automatically</span>
        </motion.div>
      )}

      {isOnline && showSyncedToast && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-aura-emerald/20 border border-aura-emerald/40 backdrop-blur-md text-aura-emerald px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Back Online • System fully synced</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
