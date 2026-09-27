import React from 'react';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  FileText, 
  Sliders, 
  Server
} from 'lucide-react';

export type SuperAdminTab = 
  | 'businesses' 
  | 'analytics' 
  | 'permissions' 
  | 'subscriptions' 
  | 'system-health' 
  | 'audit-logs';

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTab;
  onTabChange: (tab: SuperAdminTab) => void;
  tenantsCount: number;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  onTabChange,
  tenantsCount
}) => {
  const navItems: Array<{
    id: SuperAdminTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    description: string;
  }> = [
    {
      id: 'businesses',
      label: 'All Businesses',
      icon: Building2,
      badge: tenantsCount,
      description: 'Directory & Add New'
    },
    {
      id: 'permissions',
      label: 'Feature Controls',
      icon: Sliders,
      description: 'Manage Admin Access'
    },
    {
      id: 'subscriptions',
      label: 'Plans & Pricing',
      icon: CreditCard,
      description: 'Starter, Pro, Enterprise'
    },
    {
      id: 'analytics',
      label: 'Platform Sales',
      icon: TrendingUp,
      description: 'Total Revenue & Orders'
    },
    {
      id: 'system-health',
      label: 'System Status',
      icon: Activity,
      badge: '99.99%',
      description: 'Server & Database'
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileText,
      description: 'Admin Login History'
    }
  ];

  return (
    <aside className="w-60 h-full bg-aura-card border-r border-aura-border flex flex-col shrink-0 select-none font-sans z-20">
      
      {/* Platform Title Banner */}
      <div className="p-4 border-b border-aura-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-aura-muted uppercase tracking-wider">
            Super Admin
          </span>
        </div>
        <div className="text-sm font-extrabold text-aura-text mt-0.5">
          Main Console
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold text-aura-muted uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-sm'
                  : 'text-aura-text hover:bg-aura-dark/60 font-semibold'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-aura-muted group-hover:text-aura-text'}`} />
                <div className="truncate">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] font-normal truncate ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-aura-muted'}`}>
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isActive
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-aura-text'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Super Admin Status Footer */}
      <div className="p-3.5 border-t border-aura-border bg-aura-dark/30">
        <div className="p-2.5 rounded-xl bg-aura-card border border-aura-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-aura-muted">
            <span>Server Health</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-aura-muted font-mono">
            <Server className="w-3 h-3 text-aura-muted" />
            <span>SaaS Cluster v2.4</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
