import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  ClipboardList, 
  Menu, 
  ChefHat, 
  LayoutGrid, 
  UtensilsCrossed, 
  BookOpen,
  Activity
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useAuthStore } from '../stores/authStore';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMore,
}) => {
  const { user, uiMode } = useAuthStore();

  const isCashier = user?.role === 'cashier' || user?.email === 'cashier@aura.io';
  const isChef = user?.role === 'chef' || user?.role === 'kitchen' || user?.email === 'chef@aura.io';

  // Role-based Nav Configuration
  let navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'quick-sale' as ActiveTab, label: 'Quick Billing', icon: Zap },
    { id: 'kds' as ActiveTab, label: 'Kitchen', icon: ChefHat },
    { id: 'live-ops' as ActiveTab, label: 'Live Ops', icon: Activity },
    { id: 'orders' as ActiveTab, label: 'Orders', icon: ClipboardList },
  ];

  if (isCashier) {
    navItems = [
      { id: 'quick-sale' as ActiveTab, label: 'Quick Billing', icon: Zap },
      { id: 'pos' as ActiveTab, label: 'Table Orders', icon: ShoppingCart },
      { id: 'orders' as ActiveTab, label: 'Receipts', icon: ClipboardList },
      { id: 'crm-khata' as ActiveTab, label: 'Khata', icon: BookOpen },
    ];
  } else if (isChef) {
    navItems = [
      { id: 'kds' as ActiveTab, label: 'Kitchen Screen', icon: ChefHat },
      { id: 'tables' as ActiveTab, label: 'Table Map', icon: LayoutGrid },
      { id: 'orders' as ActiveTab, label: 'Order History', icon: ClipboardList },
      { id: 'menu' as ActiveTab, label: 'Menu Dishes', icon: UtensilsCrossed },
    ];
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#161B22] border-t border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-around z-40 px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isActive 
                ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold' 
                : 'text-[#475569] dark:text-[#94A3B8] font-semibold hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${
              isActive 
                ? 'bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#2563EB] dark:text-[#60A5FA]' 
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-[58px]">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More / All Apps & Profile Button */}
      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 px-0.5 rounded-xl text-[#475569] dark:text-[#94A3B8] font-semibold hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer active:scale-95"
      >
        <div className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8]">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight leading-none text-center">
          More
        </span>
      </button>
    </nav>
  );
};
