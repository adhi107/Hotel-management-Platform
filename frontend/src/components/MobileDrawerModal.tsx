import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  ChefHat, 
  LayoutGrid, 
  ClipboardList, 
  UtensilsCrossed, 
  Package, 
  Layers, 
  BookOpen, 
  Receipt, 
  BarChart3, 
  QrCode, 
  Sliders, 
  Wand2, 
  Sparkles, 
  SunMoon, 
  LogOut, 
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useAuthStore } from '../stores/authStore';

interface MobileDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAi: () => void;
  onOpenDayClose: () => void;
}

export const MobileDrawerModal: React.FC<MobileDrawerModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  onOpenAi,
  onOpenDayClose,
}) => {
  const { user, tenant, branches, activeBranchId, setActiveBranch, uiMode, themeMode, setThemeMode, logout } = useAuthStore();

  if (!isOpen) return null;

  const isCashier = user?.role === 'cashier' || user?.email === 'cashier@aura.io';
  const isChef = user?.role === 'chef' || user?.role === 'kitchen' || user?.email === 'chef@aura.io';

  const handleSelect = (tab: ActiveTab) => {
    onNavigate(tab);
    onClose();
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'bw' ? 'dark' : 'bw');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-Up Sheet */}
      <div className="relative w-full max-h-[90vh] bg-aura-card border-t border-aura-border rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-250 pb-[env(safe-area-inset-bottom,16px)]">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Drawer Header: User & Branch */}
        <div className="p-4 border-b border-aura-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-sm font-black shadow-sm">
              {user?.full_name?.charAt(0) || 'N'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-aura-text">{user?.full_name || 'Staff User'}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-aura-text border border-aura-border uppercase">
                  {user?.role || 'Staff'}
                </span>
              </div>
              <div className="text-[11px] text-aura-muted">{tenant?.name || 'NOVAFOOD OS'}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-aura-dark border border-aura-border flex items-center justify-center text-aura-muted hover:text-aura-text cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Tiles */}
        <div className="p-3 bg-aura-dark/40 border-b border-aura-border grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => {
              onClose();
              onOpenAi();
            }}
            className="p-2.5 rounded-xl bg-aura-card border border-aura-border hover:border-aura-borderStrong flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-aura-text" />
            <span className="text-[10px] font-bold text-aura-text">AI Copilot</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenDayClose();
            }}
            className="p-2.5 rounded-xl bg-aura-card border border-aura-border hover:border-aura-borderStrong flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <Receipt className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-aura-text">Day Close</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-aura-card border border-aura-border hover:border-aura-borderStrong flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <SunMoon className="w-4 h-4 text-aura-text" />
            <span className="text-[10px] font-bold text-aura-text">
              {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* 1. OPERATIONS */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 mb-1">
              Operations & Sales
            </div>
            
            {!isCashier && !isChef && (
              <button
                onClick={() => handleSelect('dashboard')}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-aura-text hover:bg-aura-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Executive Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}

            {!isChef && (
              <>
                <button
                  onClick={() => handleSelect('quick-sale')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'quick-sale'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Quick Counter Billing</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Fast
                  </span>
                </button>

                <button
                  onClick={() => handleSelect('pos')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'pos'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Table Dine-in POS</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </>
            )}

            {!isCashier && (
              <button
                onClick={() => handleSelect('kds')}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'kds'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-aura-text hover:bg-aura-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChefHat className="w-4 h-4 text-emerald-500" />
                  <span>Kitchen Display (KDS)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              </button>
            )}

            {!isCashier && (
              <button
                onClick={() => handleSelect('tables')}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'tables'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-aura-text hover:bg-aura-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Tables & Floor Plan</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}

            <button
              onClick={() => handleSelect('orders')}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'orders'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-aura-text hover:bg-aura-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Order History & Receipts</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>

          {/* 2. MENU & INVENTORY */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 mb-1">
              Menu & Inventory
            </div>

            <button
              onClick={() => handleSelect('menu')}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'menu'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-aura-text hover:bg-aura-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Menu Items & Pricing</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {!isCashier && (
              <>
                <button
                  onClick={() => handleSelect('inventory')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'inventory'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    <span>Stock & Inventory</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => handleSelect('recipes')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'recipes'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4" />
                    <span>Recipe Costing</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </>
            )}
          </div>

          {/* 3. FINANCE & CUSTOMERS */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 mb-1">
              Finance & Customers
            </div>

            <button
              onClick={() => handleSelect('crm-khata')}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'crm-khata'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-aura-text hover:bg-aura-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Khata & Customer Ledger</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Khata
              </span>
            </button>

            <button
              onClick={() => handleSelect('day-close')}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'day-close'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-aura-text hover:bg-aura-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Day Close & Cash Reconciliation</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {!isChef && !isCashier && (
              <>
                <button
                  onClick={() => handleSelect('reports')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'reports'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4" />
                    <span>Reports & Analytics</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => handleSelect('customer-ordering')}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'customer-ordering'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-aura-text hover:bg-aura-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4" />
                    <span>QR Table Ordering</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </>
            )}
          </div>

          {/* 4. SETTINGS */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 mb-1">
              Configuration
            </div>

            <button
              onClick={() => handleSelect('settings')}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-aura-text hover:bg-aura-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>Business Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {!isChef && !isCashier && (
              <button
                onClick={() => handleSelect('setup-wizard')}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'setup-wizard'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-aura-text hover:bg-aura-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <span>Setup & Demo Data Wizard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}
          </div>

          {/* Sign out button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full h-11 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
