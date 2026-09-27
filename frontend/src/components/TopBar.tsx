import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Bell, 
  Search, 
  SunMoon, 
  Clock, 
  LogOut,
  ChevronDown,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore, ThemeMode } from '../stores/authStore';
import { UiMode } from '../types';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onOpenAiCopilot: () => void;
  onOpenAlerts: () => void;
  onOpenDayClose: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onOpenAiCopilot,
  onOpenAlerts,
  onOpenDayClose,
  onOpenSettings,
  onOpenAuthModal
}) => {
  const { user, tenant, branches, activeBranchId, setActiveBranch, uiMode, setUiMode, themeMode, setThemeMode, logout } = useAuthStore();

  const handleModeChange = (mode: UiMode) => {
    setUiMode(mode);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = themeMode === 'bw' ? 'dark' : 'bw';
    setThemeMode(nextTheme);
  };

  return (
    <header className="h-14 border-b border-aura-border bg-aura-card/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40 shrink-0 select-none">
      {/* Left: Brand Identity & Branch Selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            N
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-aura-text truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px]">
                {tenant?.name || 'NOVAFOOD OS'}
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-aura-border uppercase tracking-wider shrink-0">
                {tenant?.business_type || 'Restaurant'}
              </span>
            </div>
            {/* Mobile Branch Tag */}
            {branches.length > 0 && (
              <span className="text-[10px] text-aura-muted font-medium truncate max-w-[130px] sm:hidden">
                {branches.find(b => b.id === activeBranchId)?.name || 'Main Branch'}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Branch Selector Dropdown */}
        {branches.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text hover:border-aura-borderStrong transition-colors cursor-pointer">
            <Building2 className="w-3.5 h-3.5 text-aura-muted shrink-0" />
            <select 
              value={activeBranchId || ''} 
              onChange={(e) => setActiveBranch(e.target.value)}
              className="bg-transparent text-xs text-aura-text font-medium focus:outline-none cursor-pointer pr-1"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-aura-card text-aura-text">
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Search, Complexity Mode, AI, Day Close, Alerts, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Universal Search (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden lg:flex items-center gap-2 h-8 px-2.5 rounded-lg bg-aura-bg border border-aura-border hover:border-aura-borderStrong text-xs text-aura-muted hover:text-aura-text transition-colors cursor-pointer"
          title="Search anything (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-aura-muted" />
          <span className="font-normal text-xs">Search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-aura-card text-[10px] font-mono text-aura-muted border border-aura-border">
            ⌘K
          </kbd>
        </button>

        {/* Adaptive Complexity Segmented Switcher (SuperAdmin only) / Tenant Mode Badge */}
        {user?.is_super_admin || user?.role === 'super_admin' || user?.email === 'admin@aura.io' ? (
          <div className="hidden sm:flex items-center h-8 bg-aura-bg p-0.5 rounded-lg border border-aura-border text-xs">
            <button
              onClick={() => handleModeChange('simple')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                uiMode === 'simple' 
                  ? 'bg-aura-card text-aura-text shadow-sm border border-aura-border' 
                  : 'text-aura-muted hover:text-aura-text'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => handleModeChange('standard')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                uiMode === 'standard' 
                  ? 'bg-aura-card text-aura-text shadow-sm border border-aura-border' 
                  : 'text-aura-muted hover:text-aura-text'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleModeChange('advanced')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                uiMode === 'advanced' 
                  ? 'bg-aura-card text-aura-text shadow-sm border border-aura-border' 
                  : 'text-aura-muted hover:text-aura-text'
              }`}
            >
              Advanced
            </button>
          </div>
        ) : (
          <div 
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-aura-border text-[11px] font-bold text-aura-secondary select-none"
            title="UI Complexity tier managed centrally by Super Admin"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="capitalize">{tenant?.ui_mode || uiMode || 'Advanced'} Mode</span>
          </div>
        )}


        {/* AI Operations Copilot */}
        <button
          onClick={onOpenAiCopilot}
          className="h-8 px-2 sm:px-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:bg-black dark:hover:bg-white shadow-sm transition-all cursor-pointer active:scale-95"
          title="Open AI Operations Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* Day Close Button (Desktop/Tablet) */}
        <button
          onClick={onOpenDayClose}
          className="hidden sm:flex h-8 px-2.5 rounded-lg bg-aura-card border border-aura-border text-xs font-semibold text-aura-text hover:bg-aura-dark items-center gap-1.5 transition-colors cursor-pointer"
          title="Daily Business Closing & Reconciliation"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">Day Close</span>
        </button>

        {/* Theme Switcher Toggle (B&W / Dark) */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg border border-aura-border text-aura-text hover:bg-aura-dark flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title={themeMode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          <SunMoon className="w-4 h-4 text-aura-text" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="w-8 h-8 rounded-lg border border-aura-border text-aura-text hover:bg-aura-dark flex items-center justify-center relative transition-colors cursor-pointer active:scale-95"
          title="Operational Alerts"
        >
          <Bell className="w-4 h-4 text-aura-text" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
        </button>

        {/* User Account / Auth */}
        {user ? (
          <div className="flex items-center gap-1 pl-1 border-l border-aura-border">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 h-8 px-1.5 sm:px-2 rounded-lg hover:bg-aura-dark transition-colors cursor-pointer active:scale-95"
              title="Open Settings & Profile"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-semibold text-aura-text hidden xl:inline truncate max-w-[100px]">
                {user.full_name}
              </span>
            </button>
            <button 
              onClick={logout}
              className="flex w-8 h-8 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="h-8 px-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-100 shadow-sm transition-all cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
