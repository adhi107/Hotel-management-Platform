import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Building2, Users, Activity, Zap, CheckCircle2, Sliders, 
  Plus, Search, Filter, Lock, Unlock, ExternalLink, X, Check, Sparkles, 
  Store, ChefHat, Layers, Clock, QrCode, BookOpen, Scale, TrendingUp,
  AlertTriangle, RefreshCw, CreditCard, Server, FileText, DollarSign,
  ArrowUpRight, Database, Cpu, ChevronDown, ToggleLeft, ToggleRight,
  Megaphone, Send, ShieldAlert, Download, Trash2, ArrowRight, Award,
  CheckCircle, Globe, HardDrive, Terminal, Key, Shield
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { BusinessType, UiMode } from '../../types';
import { SuperAdminSidebar, SuperAdminTab } from '../../components/SuperAdminSidebar';
import { Pagination } from '../../components/Pagination';
import { toCSV, getTodayLabel } from '../../utils/exportUtils';

interface ManagedTenant {
  id: string;
  name: string;
  business_type: BusinessType;
  owner_name: string;
  owner_email: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  ui_mode: UiMode;
  status: 'active' | 'suspended';
  branches_count: number;
  monthly_revenue: string;
  features: {
    quick_sale: boolean;
    pos: boolean;
    tables: boolean;
    kitchen_display: boolean;
    qr_ordering: boolean;
    khata_credit: boolean;
    recipes: boolean;
    ai_features: boolean;
    day_close: boolean;
    multi_branch: boolean;
  };
}

export const SuperAdminView: React.FC = () => {
  const { user, impersonateTenant } = useAuthStore();
  
  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('businesses');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Pagination State
  const [tenantPage, setTenantPage] = useState(1);
  const [tenantPageSize, setTenantPageSize] = useState(6);

  // Modals & Drawers
  const [selectedTenant, setSelectedTenant] = useState<ManagedTenant | null>(null);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Global Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'critical' | 'release'>('info');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'enterprise' | 'pro'>('all');
  const [broadcastsHistory, setBroadcastsHistory] = useState([
    { id: 'bc-1', title: 'System Performance Upgrade', body: 'Database latency optimized by 40% across all cloud regions.', type: 'info', target: 'All Businesses', time: '2 hours ago', reach: 4 },
    { id: 'bc-2', title: 'AI Upselling Engine Live', body: 'Smart menu recommendations are now available for Pro & Enterprise tiers.', type: 'release', target: 'Pro & Enterprise', time: 'Yesterday', reach: 3 },
  ]);

  // Global Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Provision New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizType, setNewBizType] = useState<BusinessType>('Restaurant');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>('Professional');
  const [newUiMode, setNewUiMode] = useState<UiMode>('standard');
  const [newBranchesCount, setNewBranchesCount] = useState(1);

  // Platform Managed Businesses Data
  const [tenants, setTenants] = useState<ManagedTenant[]>([
    {
      id: 'tenant-001',
      name: 'Aura Fine Dining & Bistro',
      business_type: 'Restaurant',
      owner_name: 'Rajesh Sharma',
      owner_email: 'owner@aura.io',
      plan: 'Enterprise',
      ui_mode: 'advanced',
      status: 'active',
      branches_count: 3,
      monthly_revenue: '₹1,48,500',
      features: {
        quick_sale: true,
        pos: true,
        tables: true,
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: true,
        recipes: true,
        ai_features: true,
        day_close: true,
        multi_branch: true,
      }
    },
    {
      id: 'tenant-002',
      name: 'Chai & Co Express',
      business_type: 'Cafe',
      owner_name: 'Amit Verma',
      owner_email: 'amit@chaico.in',
      plan: 'Professional',
      ui_mode: 'simple',
      status: 'active',
      branches_count: 2,
      monthly_revenue: '₹62,400',
      features: {
        quick_sale: true,
        pos: false,
        tables: false,
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: true,
        recipes: true,
        ai_features: true,
        day_close: true,
        multi_branch: true,
      }
    },
    {
      id: 'tenant-003',
      name: 'Spice Garden Cloud Kitchen',
      business_type: 'Cloud Kitchen',
      owner_name: 'Priya Nair',
      owner_email: 'priya@spicegarden.com',
      plan: 'Starter',
      ui_mode: 'standard',
      status: 'active',
      branches_count: 1,
      monthly_revenue: '₹34,800',
      features: {
        quick_sale: true,
        pos: false,
        tables: false,
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: false,
        recipes: true,
        ai_features: false,
        day_close: true,
        multi_branch: false,
      }
    },
    {
      id: 'tenant-004',
      name: 'The Vintage Bakery & Desserts',
      business_type: 'Bakery',
      owner_name: 'Sunil Mehta',
      owner_email: 'sunil@vintagebakery.com',
      plan: 'Professional',
      ui_mode: 'standard',
      status: 'active',
      branches_count: 1,
      monthly_revenue: '₹51,200',
      features: {
        quick_sale: true,
        pos: true,
        tables: false,
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: true,
        recipes: true,
        ai_features: true,
        day_close: true,
        multi_branch: false,
      }
    }
  ]);

  // Telemetry KPIs
  const platformStats = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const totalBranches = tenants.reduce((s, t) => s + t.branches_count, 0);
    const mrr = tenants.reduce((s, t) => {
      if (t.plan === 'Enterprise') return s + 5999;
      if (t.plan === 'Professional') return s + 2499;
      return s + 999;
    }, 0);
    return { totalTenants, activeTenants, totalBranches, mrr, arr: mrr * 12 };
  }, [tenants]);

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Filtered Businesses
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || t.business_type === filterType;
      const matchesPlan = filterPlan === 'all' || t.plan === filterPlan;
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

      return matchesSearch && matchesType && matchesPlan && matchesStatus;
    });
  }, [tenants, searchQuery, filterType, filterPlan, filterStatus]);

  const paginatedTenants = filteredTenants.slice((tenantPage - 1) * tenantPageSize, tenantPage * tenantPageSize);

  // Handlers
  const handleToggleStatus = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'active' ? 'suspended' : 'active';
        setSuccessToast(`${t.name} is now ${nextStatus.toUpperCase()}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleToggleFeature = (tenantId: string, featureKey: keyof ManagedTenant['features']) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const updatedFeatures = { ...t.features, [featureKey]: !t.features[featureKey] };
        return { ...t, features: updatedFeatures };
      }
      return t;
    }));
    setSuccessToast('Feature flag updated in real-time');
  };

  const handleUpdatePlan = (tenantId: string, newPlan: 'Starter' | 'Professional' | 'Enterprise') => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, plan: newPlan };
      }
      return t;
    }));
    setIsPlanModalOpen(false);
    setSuccessToast(`Plan upgraded to ${newPlan} successfully`);
  };

  const handleImpersonateLogin = (tenant: ManagedTenant) => {
    setSuccessToast(`Logging in as ${tenant.owner_name} (${tenant.name})...`);
    impersonateTenant({
      id: `usr-${tenant.id}`,
      full_name: tenant.owner_name,
      email: tenant.owner_email,
      role: 'owner',
      tenant_id: tenant.id
    }, {
      id: tenant.id,
      name: tenant.name,
      business_type: tenant.business_type,
      business_size: 'small',
      ui_mode: tenant.ui_mode || 'standard',
      plan: tenant.plan,
      features: tenant.features as any,
      config: {
        restaurant_name: tenant.name,
        currency: 'INR',
        currency_symbol: '₹',
        decimal_precision: 2,
        tax_percent: 5,
        primary_color: '#2563EB',
        secondary_color: '#334155',
        accent_color: '#16A34A',
      },
    });
  };

  const handleProvisionBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newOwnerEmail.trim()) return;

    const newTenant: ManagedTenant = {
      id: `tenant-00${tenants.length + 1}`,
      name: newBizName,
      business_type: newBizType,
      owner_name: newOwnerName || 'Business Owner',
      owner_email: newOwnerEmail,
      plan: newPlan,
      ui_mode: newUiMode,
      status: 'active',
      branches_count: newBranchesCount,
      monthly_revenue: '₹0',
      features: {
        quick_sale: true,
        pos: newPlan !== 'Starter',
        tables: newPlan === 'Enterprise' || newBizType === 'Restaurant',
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: true,
        recipes: true,
        ai_features: newPlan === 'Enterprise',
        day_close: true,
        multi_branch: newBranchesCount > 1,
      }
    };

    setTenants([newTenant, ...tenants]);
    setIsProvisionModalOpen(false);
    setSuccessToast(`🎉 ${newBizName} successfully provisioned & ready for onboarding!`);
    
    // Reset Form
    setNewBizName('');
    setNewOwnerName('');
    setNewOwnerEmail('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    const newBc = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle,
      body: broadcastBody,
      type: broadcastType,
      target: broadcastTarget === 'all' ? 'All Businesses' : broadcastTarget === 'enterprise' ? 'Enterprise Only' : 'Pro & Enterprise',
      time: 'Just now',
      reach: broadcastTarget === 'all' ? tenants.length : 2
    };

    setBroadcastsHistory([newBc, ...broadcastsHistory]);
    setBroadcastTitle('');
    setBroadcastBody('');
    setSuccessToast('📢 Announcement broadcasted live to all restaurant dashboards!');
  };

  const handleExportDirectory = () => {
    const data = tenants.map(t => ({
      'Business ID': t.id,
      'Business Name': t.name,
      'Type': t.business_type,
      'Owner': t.owner_name,
      'Email': t.owner_email,
      'Plan': t.plan,
      'Branches': t.branches_count,
      'Monthly Revenue': t.monthly_revenue,
      'Status': t.status.toUpperCase(),
    }));
    toCSV(data, `platform_tenants_directory_${getTodayLabel()}`);
  };

  return (
    <div className="flex h-full w-full bg-white text-[var(--text-primary)] font-sans select-none overflow-hidden">
      
      {/* ── Fixed Super Admin Sidebar ───────────────────────────────────── */}
      <SuperAdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tenantsCount={tenants.length} 
      />

      {/* ── Main Workspace ──────────────────────────────────────────────── */}
      <div className="flex-1 h-full overflow-y-auto bg-white p-4 md:p-6 space-y-6">
        
        {/* Toast Notification */}
        {successToast && (
          <div className="fixed top-16 right-6 z-50 p-3.5 px-4 rounded-xl bg-[var(--color-primary)] text-white shadow-xl flex items-center gap-2.5 text-xs font-bold animate-slide-in-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{successToast}</span>
          </div>
        )}

        {/* ── Top Super Admin Header & Global Actions ─────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-black shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <span>Super Admin Platform Control Center</span>
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Full multi-tenant governance, live feature controls, revenue telemetry, and system maintenance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Business</span>
            </button>
          </div>
        </div>

        {/* ── Global Platform Stats Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)]">Active Businesses</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">{platformStats.activeTenants}</span>
              <span className="text-[11px] font-bold text-emerald-600">100% Active</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
              {platformStats.totalBranches} total branches across all cities
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)]">Platform Monthly MRR</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">₹{platformStats.mrr.toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-bold text-emerald-600">+18% MoM</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
              ARR Run Rate: ₹{(platformStats.arr).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)]">Total Orders Handled (GMV)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">₹2,96,900</span>
              <span className="text-[11px] font-bold text-blue-600">3,850+ orders</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
              Zero transaction downtime
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)]">Cluster Uptime & Latency</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">99.99%</span>
              <span className="text-[11px] font-bold text-[var(--text-muted)]">14ms API</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
              Redis cache hit rate: 98.4%
            </p>
          </div>
        </div>

        {/* ── TAB 1: ALL BUSINESSES DIRECTORY ─────────────────────────────── */}
        {activeTab === 'businesses' && (
          <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Tenant Businesses Directory ({filteredTenants.length})</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Live management, feature toggle switchboard, plan upgrades, and direct portal access.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDirectory}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by business name, owner, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-base pl-9 text-xs"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="input-base text-xs font-semibold"
                >
                  <option value="all">All Business Types</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                  <option value="Bakery">Bakery</option>
                </select>
              </div>

              <div>
                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value)}
                  className="input-base text-xs font-semibold"
                >
                  <option value="all">All Plans</option>
                  <option value="Starter">Starter Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-4">Owner & Email</th>
                    <th className="py-3 px-4">Plan & UI Mode</th>
                    <th className="py-3 px-4 text-center">Branches</th>
                    <th className="py-3 px-4 text-right">Monthly Sales</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4 text-right">Quick SuperAdmin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                  {paginatedTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--text-primary)] block text-xs">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">
                              ID: {t.id} • {t.business_type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[var(--text-primary)] block">{t.owner_name}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{t.owner_email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                            t.plan === 'Professional' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {t.plan}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                            {t.ui_mode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[var(--text-primary)]">
                        {t.branches_count}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                        {t.monthly_revenue}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(t.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            t.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {t.status === 'active' ? '● Active' : '✕ Suspended'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {/* Impersonate Access Button */}
                        <button
                          onClick={() => handleImpersonateLogin(t)}
                          title="Instant Portal Login"
                          className="px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-white hover:bg-blue-700 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Login</span>
                        </button>

                        {/* Feature Controls Button */}
                        <button
                          onClick={() => {
                            setSelectedTenant(t);
                            setIsFeatureModalOpen(true);
                          }}
                          title="Configure Features"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 border border-[var(--border-subtle)]"
                        >
                          <Sliders className="w-3 h-3 text-slate-600" />
                          <span>Features</span>
                        </button>

                        {/* Plan Changer Button */}
                        <button
                          onClick={() => {
                            setSelectedTenant(t);
                            setIsPlanModalOpen(true);
                          }}
                          title="Upgrade Plan"
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 border border-purple-200"
                        >
                          <CreditCard className="w-3 h-3 text-purple-600" />
                          <span>Plan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTenants.length > tenantPageSize && (
              <div className="pt-2">
                <Pagination
                  currentPage={tenantPage}
                  totalItems={filteredTenants.length}
                  pageSize={tenantPageSize}
                  onPageChange={setTenantPage}
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: FEATURE SWITCHBOARD (LIVE GOVERNANCE) ────────────────── */}
        {activeTab === 'permissions' && (
          <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Live Feature Switchboard & Module Permissions</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Turn specific platform features ON or OFF for any restaurant with instant real-time synchronization.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-2 text-center">Quick Sale</th>
                    <th className="py-3 px-2 text-center">Table POS</th>
                    <th className="py-3 px-2 text-center">Kitchen KDS</th>
                    <th className="py-3 px-2 text-center">QR Ordering</th>
                    <th className="py-3 px-2 text-center">Khata Credit</th>
                    <th className="py-3 px-2 text-center">Recipes</th>
                    <th className="py-3 px-2 text-center">AI Copilot</th>
                    <th className="py-3 px-2 text-center">Day Close</th>
                    <th className="py-3 px-2 text-center">Multi-Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        {t.name}
                        <span className="block text-[10px] text-[var(--text-muted)] font-normal">{t.plan} Plan</span>
                      </td>
                      {(Object.keys(t.features) as Array<keyof ManagedTenant['features']>).map((fKey) => (
                        <td key={fKey} className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleToggleFeature(t.id, fKey)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              t.features[fKey]
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {t.features[fKey] ? <Check className="w-4 h-4 font-black" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: GLOBAL BROADCAST ANNOUNCEMENTS ───────────────────────── */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
              <div className="pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Send Live Platform Broadcast Announcement</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Push urgent alerts, feature updates, or maintenance notices directly to all tenant cockpits.
                </p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Scheduled Maintenance Window Tonight at 2:00 AM IST"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Message Details / Instructions
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details for restaurant owners and cashiers..."
                    value={broadcastBody}
                    onChange={e => setBroadcastBody(e.target.value)}
                    className="input-base text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      Alert Priority Level
                    </label>
                    <select
                      value={broadcastType}
                      onChange={e => setBroadcastType(e.target.value as any)}
                      className="input-base text-xs font-semibold"
                    >
                      <option value="info">🔵 Information Notice</option>
                      <option value="release">🟢 New Feature Launch</option>
                      <option value="warning">🟡 Scheduled Maintenance</option>
                      <option value="critical">🔴 Critical Security Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      Target Audience
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={e => setBroadcastTarget(e.target.value as any)}
                      className="input-base text-xs font-semibold"
                    >
                      <option value="all">All Connected Restaurants</option>
                      <option value="enterprise">Enterprise Tier Only</option>
                      <option value="pro">Pro & Enterprise Tiers</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Live Dashboards</span>
                </button>
              </form>
            </div>

            {/* Broadcast History */}
            <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-3">
              <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                Recent Broadcasts Sent
              </h4>
              <div className="space-y-2.5">
                {broadcastsHistory.map(bc => (
                  <div key={bc.id} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[#F8FAFC] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{bc.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">{bc.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{bc.body}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)]">
                      <span>Target: {bc.target}</span>
                      <span className="font-bold text-emerald-600">✓ Delivered ({bc.reach})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: PLANS & PRICING TIER BUILDER ─────────────────────────── */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[var(--text-primary)]">Starter Tier</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Small Cafes</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-[var(--text-primary)]">₹999</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 1 Branch & 2 Staff Logins</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Fast POS & Order Receipts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Basic Daily Sales Reports</li>
                  <li className="flex items-center gap-2 text-[var(--text-muted)]"><X className="w-3.5 h-3.5 text-slate-400" /> No AI Copilot</li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[var(--color-primary)] shadow-md space-y-4 relative">
                <div className="absolute -top-3 right-4 bg-[var(--color-primary)] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[var(--text-primary)]">Professional Tier</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Restaurants</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-[var(--text-primary)]">₹2,499</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 3 Branches & 10 Staff</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Live Kitchen Screen (KDS) & Floor Map</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Recipe Food Costing & Inventory</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Day-close cash register audit</li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-4 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-purple-700">Enterprise Tier</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">Chains & Franchises</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-[var(--text-primary)]">₹5,999</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Branches & Unlimited Staff</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> AI Business Growth Copilot & Insights</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Customer Khata Credit Book & WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Priority SuperAdmin Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: PLATFORM TELEMETRY & REVENUE TRENDS ───────────────────── */}
        {activeTab === 'analytics' && (
          <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Multi-Tenant Platform Revenue & Growth Curve</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Combined Gross Merchandise Value (GMV) and SaaS subscription revenue across all hotel chains.
              </p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'May', gmv: 85000, mrr: 28000, orders: 1200 },
                  { month: 'Jun', gmv: 120000, mrr: 34000, orders: 1750 },
                  { month: 'Jul', gmv: 165000, mrr: 39000, orders: 2300 },
                  { month: 'Aug', gmv: 210000, mrr: 44000, orders: 3100 },
                  { month: 'Sep', gmv: 296900, mrr: 48500, orders: 3850 },
                ]}>
                  <defs>
                    <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={(v: any, name: any) => [`₹${v?.toLocaleString('en-IN')}`, name === 'gmv' ? 'Hotel GMV' : 'SaaS MRR']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="gmv" name="Total Hotel Sales (GMV)" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#gmvGrad)" />
                  <Area type="monotone" dataKey="mrr" name="Platform Subscription MRR" stroke="#10B981" strokeWidth={2} fillOpacity={0.2} fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TAB 6: SYSTEM & DB HEALTH & MAINTENANCE MODE ────────────────── */}
        {activeTab === 'system-health' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Real-time Cluster Health & Maintenance Governance</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Server nodes, database read/write latency, cache hit performance, and global maintenance lock.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      setSuccessToast(`Maintenance mode is now ${!maintenanceMode ? 'ENABLED (Platform Locked)' : 'DISABLED (Live)'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      maintenanceMode
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-[var(--border-subtle)]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{maintenanceMode ? 'Maintenance Mode: ON' : 'Toggle Maintenance Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">API Response Time</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">14 ms</p>
                  <span className="text-[10px] text-[var(--text-muted)]">Optimal (p99: 32ms)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">MongoDB Latency</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">3.2 ms</p>
                  <span className="text-[10px] text-[var(--text-muted)]">ReplicaSet synced</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Active WebSockets</span>
                  <p className="text-lg font-black text-blue-600 mt-0.5">8 Channels</p>
                  <span className="text-[10px] text-[var(--text-muted)]">KDS & Live Ops</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Memory Allocation</span>
                  <p className="text-lg font-black text-slate-800 mt-0.5">512 MB / 2 GB</p>
                  <span className="text-[10px] text-emerald-600 font-bold">25% (Healthy)</span>
                </div>
              </div>

              {/* Maintenance Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setSuccessToast('⚡ Redis cache flushed successfully')}
                  className="btn-secondary text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flush Redis Cache</span>
                </button>
                <button
                  onClick={() => setSuccessToast('📊 Database indexes re-optimized and compacted')}
                  className="btn-secondary text-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Optimize DB Indexes</span>
                </button>
                <button
                  onClick={() => setSuccessToast('💾 Snapshot backup archive generated & encrypted')}
                  className="btn-secondary text-xs"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Generate Full DB Backup</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: SECURITY & AUDIT TRAIL ───────────────────────────────── */}
        {activeTab === 'audit-logs' && (
          <div className="p-5 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Super Admin Audit Trail & Action Logs</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Cryptographically verifiable record of all administrative operations, logins, and permission changes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Operator / Admin</th>
                    <th className="py-3 px-4">Action Summary</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                  {[
                    { action: 'PORTAL_ACCESS', admin: 'superadmin@aura.io', summary: "Masqueraded as Rajesh Sharma (Aura Bistro)", ip: '122.172.88.14', time: '5 mins ago' },
                    { action: 'FEATURE_TOGGLE', admin: 'superadmin@aura.io', summary: "Enabled AI Copilot for Chai & Co Express", ip: '122.172.88.14', time: '22 mins ago' },
                    { action: 'PLAN_UPGRADE', admin: 'superadmin@aura.io', summary: "Upgraded The Vintage Bakery to Professional Plan", ip: '122.172.88.14', time: '1 hour ago' },
                    { action: 'BACKUP_CREATED', admin: 'SYSTEM_CRON', summary: "Automated incremental cluster backup completed", ip: '127.0.0.1', time: '3 hours ago' },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{log.admin}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{log.summary}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">{log.ip}</td>
                      <td className="py-3 px-4 text-right text-[var(--text-muted)]">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: PROVISION NEW BUSINESS ─────────────────────────────────── */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">Provision New Restaurant Tenant</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Initialize restaurant database, default menu catalog, and admin login.</p>
                </div>
              </div>
              <button onClick={() => setIsProvisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionBusiness} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Biryani House"
                  value={newBizName}
                  onChange={e => setNewBizName(e.target.value)}
                  className="input-base text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Business Type</label>
                  <select
                    value={newBizType}
                    onChange={e => setNewBizType(e.target.value as any)}
                    className="input-base text-xs font-semibold"
                  >
                    <option value="Restaurant">Restaurant (Fine Dining)</option>
                    <option value="Cafe">Cafe & Bistro</option>
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                    <option value="Bakery">Bakery & Sweets</option>
                    <option value="Quick Service">Quick Service / QSR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Plan Tier</label>
                  <select
                    value={newPlan}
                    onChange={e => setNewPlan(e.target.value as any)}
                    className="input-base text-xs font-semibold"
                  >
                    <option value="Starter">Starter (₹999/mo)</option>
                    <option value="Professional">Professional (₹2,499/mo)</option>
                    <option value="Enterprise">Enterprise (₹5,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Owner Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Vikram Reddy"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., vikram@royalbiryani.in"
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Template Seeding
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  The system will automatically seed 30+ categorized menu dishes, pricing templates, and floor tables for <strong>{newBizType}</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold shadow-md"
                >
                  Provision & Launch Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIGURE FEATURES PER TENANT ─────────────────────────── */}
      {isFeatureModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  Feature Controls: {selectedTenant.name}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Toggle modular capabilities for this restaurant account.</p>
              </div>
              <button onClick={() => setIsFeatureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(Object.keys(selectedTenant.features) as Array<keyof ManagedTenant['features']>).map((fKey) => (
                <div
                  key={fKey}
                  onClick={() => handleToggleFeature(selectedTenant.id, fKey)}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[#F8FAFC] hover:border-[var(--color-primary)] transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[var(--text-primary)] capitalize">
                    {fKey.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedTenant.features[fKey] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedTenant.features[fKey] ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsFeatureModalOpen(false)}
              className="btn-primary w-full text-xs font-bold mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE PLAN TIER ──────────────────────────────────────── */}
      {isPlanModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  Upgrade Plan: {selectedTenant.name}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Current Tier: <strong>{selectedTenant.plan}</strong></p>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(['Starter', 'Professional', 'Enterprise'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleUpdatePlan(selectedTenant.id, p)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedTenant.plan === p
                      ? 'border-[var(--color-primary)] bg-blue-50/50 shadow-xs'
                      : 'border-[var(--border-subtle)] bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-[var(--text-primary)] block">{p} Plan</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {p === 'Starter' ? '₹999/mo • 1 Branch' : p === 'Professional' ? '₹2,499/mo • KDS & Inventory' : '₹5,999/mo • Unlimited + AI'}
                    </span>
                  </div>
                  {selectedTenant.plan === p && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
