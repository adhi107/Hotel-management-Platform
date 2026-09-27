import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  UtensilsCrossed, 
  LayoutGrid, 
  ChefHat, 
  ClipboardList, 
  Package, 
  Layers, 
  BookOpen, 
  BarChart3, 
  Sliders, 
  Receipt,
  QrCode,
  Building2,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export type ActiveTab = 
  | 'dashboard'
  | 'live-ops'
  | 'quick-sale'
  | 'pos'
  | 'kds'
  | 'tables'
  | 'orders'
  | 'menu'
  | 'inventory'
  | 'recipes'
  | 'crm-khata'
  | 'day-close'
  | 'reports'
  | 'settings'
  | 'superadmin'
  | 'customer-ordering'
  | 'setup-wizard';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { tenant, uiMode, user } = useAuthStore();
  const features = tenant?.features;

  const isCashier = user?.role === 'cashier' || user?.email === 'cashier@aura.io';
  const isChef = user?.role === 'chef' || user?.role === 'kitchen' || user?.email === 'chef@aura.io';

  // 1. CASHIER SIMPLE SIDEBAR
  if (isCashier) {
    const cashierGroups = [
      {
        title: 'BILLING & SALES',
        items: [
          { id: 'quick-sale', label: 'Quick Billing', icon: Zap, badge: 'Fast' },
          { id: 'pos', label: 'Table Billing', icon: ShoppingCart },
          { id: 'orders', label: "Receipts & History", icon: ClipboardList },
        ]
      },
      {
        title: 'CUSTOMERS & CASH',
        items: [
          { id: 'crm-khata', label: 'Customer Khata', icon: BookOpen, badge: 'Khata' },
          { id: 'day-close', label: 'Cash Close', icon: Receipt },
        ]
      }
    ];

    return (
      <aside className="w-56 border-r border-aura-border bg-aura-card hidden lg:flex flex-col h-full shrink-0 overflow-y-auto select-none font-sans">
        <div className="p-3 border-b border-aura-border bg-aura-dark/20">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
            </span>
            <div>
              <div className="font-bold text-xs text-aura-text">Cashier</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Shift
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 flex-1">
          {cashierGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h4 className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 py-1">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id as ActiveTab)}
                      className={`w-full h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                          : 'text-aura-secondary hover:text-aura-text hover:bg-aura-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-aura-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                          isActive 
                            ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-950' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-aura-secondary border border-aura-border'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // 2. CHEF SIMPLE SIDEBAR
  if (isChef) {
    const chefGroups = [
      {
        title: 'KITCHEN ORDERS',
        items: [
          { id: 'kds', label: 'Live Orders (KDS)', icon: ChefHat, badge: 'Live' },
          { id: 'tables', label: 'Table Status', icon: LayoutGrid },
          { id: 'orders', label: 'Order History', icon: ClipboardList },
        ]
      },
      {
        title: 'ITEMS & STOCK',
        items: [
          { id: 'menu', label: 'Menu Dishes', icon: UtensilsCrossed },
          { id: 'inventory', label: 'Kitchen Stock', icon: Package },
          { id: 'recipes', label: 'Dish Recipes', icon: Layers },
        ]
      }
    ];

    return (
      <aside className="w-56 border-r border-aura-border bg-aura-card hidden lg:flex flex-col h-full shrink-0 overflow-y-auto select-none font-sans">
        <div className="p-3 border-b border-aura-border bg-aura-dark/20">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
              <ChefHat className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <div className="font-bold text-xs text-aura-text">Kitchen Display</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tickets
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 flex-1">
          {chefGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h4 className="text-[10px] font-bold tracking-wider text-aura-muted uppercase px-2 py-1">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id as ActiveTab)}
                      className={`w-full h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                          : 'text-aura-secondary hover:text-aura-text hover:bg-aura-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-aura-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                          isActive 
                            ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-950' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-aura-secondary border border-aura-border'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // 3. OWNER / MANAGER SIMPLE SIDEBAR
  const ownerNavGroups = [
    {
      title: 'TODAY',
      items: [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard, show: true },
        { id: 'live-ops', label: 'Live Overview', icon: Activity, show: true, badge: 'Live' },
        {
          id: 'quick-sale',
          label: 'Quick Sale',
          icon: Zap,
          show: uiMode === 'simple' || features?.quick_sale !== false,
          badge: 'Fast'
        },
        {
          id: 'pos',
          label: 'Table Orders',
          icon: ShoppingCart,
          show: uiMode !== 'simple' && (features?.pos !== false)
        },
        {
          id: 'kds',
          label: 'Kitchen Screen',
          icon: ChefHat,
          show: uiMode !== 'simple' && (features?.kitchen_display !== false)
        },
        {
          id: 'tables',
          label: 'Table Map',
          icon: LayoutGrid,
          show: uiMode === 'advanced' || (uiMode === 'standard' && features?.tables !== false)
        },
        { id: 'orders', label: 'All Orders', icon: ClipboardList, show: true },
      ]
    },
    {
      title: 'MENU & STOCK',
      items: [
        { id: 'menu', label: 'Menu & Dishes', icon: UtensilsCrossed, show: true },
        {
          id: 'inventory',
          label: 'Stock & Ingredients',
          icon: Package,
          show: features?.simple_inventory !== false || features?.advanced_inventory !== false
        },
        {
          id: 'recipes',
          label: 'Recipes & Food Cost',
          icon: Layers,
          show: uiMode === 'advanced' || features?.recipes !== false
        },
      ]
    },
    {
      title: 'MONEY & CUSTOMERS',
      items: [
        {
          id: 'crm-khata',
          label: 'Customers & Credit',
          icon: BookOpen,
          show: features?.crm !== false || features?.khata_credit !== false,
          badge: features?.khata_credit ? 'Khata' : undefined
        },
        { id: 'day-close', label: 'End of Day (Cash)', icon: Receipt, show: features?.day_close !== false },
        {
          id: 'reports',
          label: 'Sales Reports',
          icon: BarChart3,
          show: uiMode !== 'simple' && (features?.advanced_analytics !== false)
        },
        {
          id: 'customer-ordering',
          label: 'Online & QR Orders',
          icon: QrCode,
          show: features?.qr_ordering !== false || features?.online_ordering !== false
        },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Settings', icon: Sliders, show: true },
      ]
    }
  ];

  return (
    <aside
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      className="w-56 border-r hidden lg:flex flex-col h-full shrink-0 overflow-y-auto select-none"
    >
      <div className="p-2.5 space-y-4">
        {ownerNavGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx}>
              <p className="section-header px-2 mb-1">{group.title}</p>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id as ActiveTab)}
                      style={isActive ? {
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                      } : {}}
                      className={`w-full h-8 px-2.5 rounded-md text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'font-semibold'
                          : 'font-medium hover:bg-[var(--bg-surface-hover)]'
                      }`}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = ''; }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }}
                        />
                        <span
                          className="truncate"
                          style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          style={isActive
                            ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                            : { backgroundColor: 'var(--color-neutral-light)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }
                          }
                          className="px-1.5 py-px rounded text-[9px] font-bold uppercase shrink-0"
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mt-auto p-3 text-xs"
        style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Mode</span>
          <span
            className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            {uiMode}
          </span>
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: 10, lineHeight: 1.4 }}>
          {uiMode === 'simple'
            ? 'Quick counter billing.'
            : uiMode === 'standard'
            ? 'Cafe & QSR table billing.'
            : 'Multi-branch & kitchen routing.'}
        </p>
      </div>
    </aside>
  );
};
