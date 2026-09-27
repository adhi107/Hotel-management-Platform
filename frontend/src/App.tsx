import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CommandPalette } from './components/CommandPalette';
import { useAuthStore } from './stores/authStore';

// Feature Views
import { ExecutiveDashboard } from './features/dashboard/ExecutiveDashboard';
import { OwnerLiveOpsView } from './features/dashboard/OwnerLiveOpsView';
import { QuickSaleView } from './features/pos/QuickSaleView';
import { PosView } from './features/pos/PosView';
import { KdsView } from './features/kitchen/KdsView';
import { FloorPlanView } from './features/tables/FloorPlanView';
import { OrderListView } from './features/orders/OrderListView';
import { MenuManagementView } from './features/menu/MenuManagementView';
import { InventoryView } from './features/inventory/InventoryView';
import { RecipeCostingView } from './features/recipes/RecipeCostingView';
import { CrmKhataView } from './features/crm/CrmKhataView';
import { DayCloseView } from './features/dayclose/DayCloseView';
import { ReportsView } from './features/reports/ReportsView';
import { BusinessSettingsView } from './features/settings/BusinessSettingsView';
import { SuperAdminView } from './features/superadmin/SuperAdminView';
import { CustomerOrderingView } from './features/customer/CustomerOrderingView';
import { SetupWizard } from './features/onboarding/SetupWizard';
import { LoginPage } from './features/auth/LoginPage';

// Components & Utilities
import { SplashScreen } from './components/SplashScreen';
import { OfflineBanner } from './components/OfflineBanner';

// Modals
import { AiAssistantModal } from './features/ai/AiAssistantModal';
import { AlertCenterModal } from './features/alerts/AlertCenterModal';
import { AuthModal } from './features/auth/AuthModal';
import { MobileDrawerModal } from './components/MobileDrawerModal';
import { ShieldCheck, LogOut, SunMoon } from 'lucide-react';

export const App: React.FC = () => {
  const { user, tenant, uiMode, themeMode, setThemeMode, logout, loadSession } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  
  // Active Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Modal states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'cashier' || user.email === 'cashier@aura.io') {
        setActiveTab('quick-sale');
      } else if (user.role === 'chef' || user.role === 'kitchen' || user.email === 'chef@aura.io') {
        setActiveTab('kds');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user?.email, user?.role]);

  const isSuperAdmin = user?.is_super_admin || user?.role === 'super_admin' || user?.email === 'admin@aura.io';

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'bw' : 'dark';
    setThemeMode(nextTheme);
  };

  // 1. If not authenticated, render the Enterprise Login Gateway
  if (!user) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#09090B] font-sans selection:bg-zinc-900 selection:text-white">
        {showSplash && (
          <SplashScreen
            onComplete={() => setShowSplash(false)}
            brandName={tenant?.name || 'NOVAFOOD OS'}
          />
        )}
        <OfflineBanner />
        <LoginPage />
      </div>
    );
  }

  // 2. Super Admin Dedicated Pure Console (NO restaurant sidebar, NO tenant restaurant nav)
  if (isSuperAdmin) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-aura-bg text-aura-text flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
        {showSplash && (
          <SplashScreen
            onComplete={() => setShowSplash(false)}
            brandName="NOVAFOOD SUPER ADMIN"
          />
        )}
        <OfflineBanner />

        {/* Dedicated Super Admin Top Header */}
        <header className="h-14 bg-aura-card border-b border-aura-border px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-sm shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-aura-text">NOVAFOOD PLATFORM</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Cluster Health */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SaaS Platform Online</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-aura-border text-aura-text hover:bg-aura-dark flex items-center justify-center transition-colors cursor-pointer"
              title={themeMode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              <SunMoon className="w-4 h-4 text-aura-text" />
            </button>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-aura-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold">
                  SA
                </div>
                <span className="text-xs font-bold text-aura-text hidden md:inline">
                  Super Admin
                </span>
              </div>
              <button 
                onClick={logout}
                className="h-8 px-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                title="Sign out of Super Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Super Admin Full-Screen Workspace */}
        <main className="flex-1 h-full overflow-y-auto bg-aura-bg">
          <SuperAdminView />
        </main>
      </div>
    );
  }

  // 3. Restaurant Tenant (Owner, Cashier, Chef, Manager): Full Cockpit with Sidebar & Workspace
  return (
    <div className="h-screen w-screen overflow-hidden bg-aura-bg text-aura-text flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Branded Native Boot Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          brandName={tenant?.name || 'NOVAFOOD OS'}
        />
      )}

      {/* Real-time Connectivity Status Banner */}
      <OfflineBanner />

      {/* TopBar */}
      <TopBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAiCopilot={() => setIsAiModalOpen(true)}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenDayClose={() => setActiveTab('day-close')}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Fixed Enterprise Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Independently Scrollable Workspace */}
        <main className="flex-1 h-full overflow-y-auto pb-24 lg:pb-6 bg-aura-bg">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard 
              onNavigate={setActiveTab}
              onNavigateToQuickSale={() => setActiveTab(uiMode === 'simple' ? 'quick-sale' : 'pos')} 
            />
          )}
          {activeTab === 'live-ops' && <OwnerLiveOpsView onNavigate={setActiveTab} />}
          {activeTab === 'quick-sale' && <QuickSaleView />}
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'kds' && <KdsView />}
          {activeTab === 'tables' && <FloorPlanView />}
          {activeTab === 'orders' && <OrderListView />}
          {activeTab === 'menu' && <MenuManagementView />}
          {activeTab === 'inventory' && <InventoryView onNavigate={setActiveTab} />}
          {activeTab === 'recipes' && <RecipeCostingView onNavigate={setActiveTab} />}
          {activeTab === 'crm-khata' && <CrmKhataView onNavigate={setActiveTab} />}
          {activeTab === 'day-close' && <DayCloseView onNavigate={setActiveTab} />}
          {activeTab === 'reports' && <ReportsView onNavigate={setActiveTab} />}
          {activeTab === 'settings' && <BusinessSettingsView />}
          {activeTab === 'superadmin' && <SuperAdminView />}
          {activeTab === 'customer-ordering' && <CustomerOrderingView />}
          {activeTab === 'setup-wizard' && <SetupWizard onComplete={() => setActiveTab('dashboard')} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMore={() => setIsMobileDrawerOpen(true)}
      />

      {/* Native Mobile Menu Drawer */}
      <MobileDrawerModal
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenAi={() => setIsAiModalOpen(true)}
        onOpenDayClose={() => setActiveTab('day-close')}
      />

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onOpenAi={() => { setIsCommandPaletteOpen(false); setIsAiModalOpen(true); }}
        onOpenDayClose={() => { setIsCommandPaletteOpen(false); setActiveTab('day-close'); }}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <AlertCenterModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
