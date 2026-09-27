import { create } from 'zustand';
import api from '../services/api';
import { User, Tenant, Branch, UiMode, BusinessType } from '../types';

export type ThemeMode = 'bw' | 'dualtone' | 'dark';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  branches: Branch[];
  activeBranchId: string | null;
  uiMode: UiMode;
  themeMode: ThemeMode;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setUiMode: (mode: UiMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveBranch: (branchId: string) => void;
  applyBusinessTemplate: (templateName: string) => Promise<void>;
  updateBusinessProfile: (businessType: BusinessType, size: string, uiMode: UiMode, features?: Record<string, boolean>) => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  branches: [],
  activeBranchId: localStorage.getItem('aura_branch_id'),
  uiMode: (localStorage.getItem('aura_ui_mode') as UiMode) || 'standard',
  themeMode: (localStorage.getItem('aura_theme_mode') as ThemeMode) || 'bw',
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;
      
      localStorage.setItem('aura_access_token', data.access_token);
      localStorage.setItem('aura_refresh_token', data.refresh_token);
      
      const activeBranch = data.branches?.[0]?.id || data.user?.branch_id || null;
      if (activeBranch) {
        localStorage.setItem('aura_branch_id', activeBranch);
      }
      if (data.tenant?.id) {
        localStorage.setItem('aura_tenant_id', data.tenant.id);
      }
      const tenantUiMode = (data.tenant?.ui_mode as UiMode) || 'standard';
      localStorage.setItem('aura_ui_mode', tenantUiMode);

      set({
        user: data.user,
        tenant: data.tenant,
        branches: data.branches || [],
        activeBranchId: activeBranch,
        uiMode: tenantUiMode,
        isLoading: false
      });
      return true;
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.response?.data?.error?.message || 'Invalid credentials' 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('aura_access_token');
    localStorage.removeItem('aura_refresh_token');
    localStorage.removeItem('aura_branch_id');
    localStorage.removeItem('aura_tenant_id');
    set({ user: null, tenant: null, branches: [], activeBranchId: null });
  },

  setUiMode: (mode: UiMode) => {
    localStorage.setItem('aura_ui_mode', mode);
    set({ uiMode: mode });
  },

  setThemeMode: (mode: ThemeMode) => {
    localStorage.setItem('aura_theme_mode', mode);
    if (typeof document !== 'undefined') {
      document.documentElement.className = mode === 'dark' ? 'dark' : (mode === 'dualtone' ? 'theme-dualtone' : 'theme-bw');
    }
    set({ themeMode: mode });
  },

  setActiveBranch: (branchId: string) => {
    localStorage.setItem('aura_branch_id', branchId);
    set({ activeBranchId: branchId });
  },

  applyBusinessTemplate: async (templateName: string) => {
    try {
      const res = await api.post(`/tenants/apply-template/${encodeURIComponent(templateName)}`);
      const updatedTenant = res.data.data;
      const newMode = (updatedTenant.ui_mode as UiMode) || 'standard';
      localStorage.setItem('aura_ui_mode', newMode);
      set({ tenant: updatedTenant, uiMode: newMode });
    } catch (err) {
      console.error('Failed to apply template:', err);
    }
  },

  updateBusinessProfile: async (businessType: BusinessType, size: string, uiMode: UiMode, features?: Record<string, boolean>) => {
    try {
      const res = await api.put('/tenants/profile', {
        business_type: businessType,
        business_size: size,
        ui_mode: uiMode,
        features: features
      });
      const updatedTenant = res.data.data;
      localStorage.setItem('aura_ui_mode', uiMode);
      set({ tenant: updatedTenant, uiMode: uiMode });
    } catch (err) {
      console.error('Failed to update business profile:', err);
    }
  },

  loadSession: async () => {
    const token = localStorage.getItem('aura_access_token');
    if (!token) return;
    try {
      const meRes = await api.get('/auth/me');
      const profileRes = await api.get('/tenants/profile');
      const branchRes = await api.get('/tenants/branches');
      
      const tData = profileRes.data.data;
      const bData = branchRes.data.data || [];
      const storedBranch = localStorage.getItem('aura_branch_id') || bData[0]?.id || null;
      const mode = (localStorage.getItem('aura_ui_mode') as UiMode) || tData?.ui_mode || 'standard';

      set({
        user: meRes.data.data,
        tenant: tData,
        branches: bData,
        activeBranchId: storedBranch,
        uiMode: mode
      });
    } catch (e) {
      // Session invalid, clear
      get().logout();
    }
  }
}));
