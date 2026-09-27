import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Zap, 
  ShoppingCart, 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  Layers, 
  BookOpen, 
  Receipt, 
  Sparkles, 
  Sliders, 
  X 
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAi: () => void;
  onOpenDayClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAi,
  onOpenDayClose
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Open Quick Sale (Fast 2-Tap Billing)', icon: Zap, action: () => onNavigate('quick-sale'), group: 'POS' },
    { label: 'Open Restaurant Full POS', icon: ShoppingCart, action: () => onNavigate('pos'), group: 'POS' },
    { label: 'Open Kitchen Display System (KDS)', icon: ChefHat, action: () => onNavigate('kds'), group: 'Kitchen' },
    { label: 'View Floor Plan & Table Status', icon: LayoutDashboard, action: () => onNavigate('tables'), group: 'Tables' },
    { label: 'Open Ingredients & Inventory Ledger', icon: Package, action: () => onNavigate('inventory'), group: 'Inventory' },
    { label: 'Open Recipe & Food Costing Matrix', icon: Layers, action: () => onNavigate('recipes'), group: 'Costing' },
    { label: 'Open Customer Khata (Credit Ledger)', icon: BookOpen, action: () => onNavigate('crm-khata'), group: 'CRM' },
    { label: 'Perform One-Tap Day Close Reconciliation', icon: Receipt, action: onOpenDayClose, group: 'Operations' },
    { label: 'Ask AI Copilot Operational Query', icon: Sparkles, action: onOpenAi, group: 'AI' },
    { label: 'Configure Business Profile & White Label', icon: Sliders, action: () => onNavigate('settings'), group: 'Settings' },
  ];

  const filtered = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-card-elevated rounded-2xl overflow-hidden border border-aura-border shadow-2xl">
        {/* Search Header */}
        <div className="p-4 border-b border-aura-border flex items-center gap-3 bg-aura-dark/60">
          <Search className="w-5 h-5 text-aura-blue shrink-0" />
          <input
            type="text"
            placeholder="Type a command, feature or action... (e.g. Quick Sale, Day Close, AI)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-aura-muted focus:outline-none"
          />
          <button onClick={onClose} className="text-aura-muted hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-aura-blue/15 hover:border-aura-blue/30 border border-transparent text-left text-xs font-medium text-aura-text transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-aura-dark group-hover:bg-aura-blue/20 text-aura-blue transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-aura-muted">{item.group}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-aura-muted group-hover:text-aura-blue">Jump ↵</span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-aura-muted">
              No matching actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-aura-border bg-aura-dark/40 flex items-center justify-between text-[11px] text-aura-muted">
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span>Press <strong>ESC</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
