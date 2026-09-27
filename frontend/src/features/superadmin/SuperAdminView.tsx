import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Sliders, 
  Plus, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  ExternalLink, 
  X, 
  Check, 
  Sparkles, 
  Store, 
  ChefHat, 
  Layers, 
  Clock, 
  QrCode, 
  BookOpen, 
  Scale, 
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Server,
  FileText,
  DollarSign,
  ArrowUpRight,
  Database,
  Cpu,
  ChevronDown,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { BusinessType, UiMode } from '../../types';
import { SuperAdminSidebar, SuperAdminTab } from '../../components/SuperAdminSidebar';
import { Pagination } from '../../components/Pagination';

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
  const { user } = useAuthStore();
  
  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('businesses');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Pagination State
  const [tenantPage, setTenantPage] = useState(1);
  const [tenantPageSize, setTenantPageSize] = useState(5);

  // Modal states
  const [selectedTenant, setSelectedTenant] = useState<ManagedTenant | null>(null);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initial Platform Managed Businesses
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
      monthly_revenue: '₹14,500',
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
        multi_branch: true
      }
    },
    {
      id: 'tenant-002',
      name: 'FreshPress Juice & Quick Shakes',
      business_type: 'Juice Center',
      owner_name: 'Vikram Patel',
      owner_email: 'vikram@freshpress.in',
      plan: 'Starter',
      ui_mode: 'simple',
      status: 'active',
      branches_count: 1,
      monthly_revenue: '₹1,999',
      features: {
        quick_sale: true,
        pos: false,
        tables: false,
        kitchen_display: false,
        qr_ordering: true,
        khata_credit: true,
        recipes: false,
        ai_features: false,
        day_close: true,
        multi_branch: false
      }
    },
    {
      id: 'tenant-003',
      name: 'Chai & Bun Maska Street Hub',
      business_type: 'Tea Shop',
      owner_name: 'Karan Dave',
      owner_email: 'karan@chaihub.com',
      plan: 'Starter',
      ui_mode: 'simple',
      status: 'active',
      branches_count: 2,
      monthly_revenue: '₹1,999',
      features: {
        quick_sale: true,
        pos: false,
        tables: false,
        kitchen_display: false,
        qr_ordering: false,
        khata_credit: true,
        recipes: false,
        ai_features: false,
        day_close: true,
        multi_branch: false
      }
    },
    {
      id: 'tenant-004',
      name: 'Artisan Sourdough & Patisserie',
      business_type: 'Bakery',
      owner_name: 'Sneha Roy',
      owner_email: 'sneha@artisanbakes.com',
      plan: 'Professional',
      ui_mode: 'standard',
      status: 'active',
      branches_count: 1,
      monthly_revenue: '₹4,999',
      features: {
        quick_sale: true,
        pos: true,
        tables: true,
        kitchen_display: true,
        qr_ordering: false,
        khata_credit: true,
        recipes: true,
        ai_features: true,
        day_close: true,
        multi_branch: false
      }
    },
    {
      id: 'tenant-005',
      name: 'CloudBowl Virtual Kitchen Network',
      business_type: 'Cloud Kitchen',
      owner_name: 'Amit Verma',
      owner_email: 'amit@cloudbowl.io',
      plan: 'Enterprise',
      ui_mode: 'advanced',
      status: 'active',
      branches_count: 5,
      monthly_revenue: '₹22,000',
      features: {
        quick_sale: true,
        pos: true,
        tables: false,
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: false,
        recipes: true,
        ai_features: true,
        day_close: true,
        multi_branch: true
      }
    }
  ]);

  // Provisioning Form State
  const [newTenant, setNewTenant] = useState({
    name: '',
    business_type: 'Cafe' as BusinessType,
    owner_name: '',
    owner_email: '',
    plan: 'Professional' as 'Starter' | 'Professional' | 'Enterprise',
    ui_mode: 'standard' as UiMode
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Filtered list
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.business_type === filterType;
    return matchesSearch && matchesType;
  });

  const paginatedTenants = filteredTenants.slice((tenantPage - 1) * tenantPageSize, tenantPage * tenantPageSize);

  // Toggle Feature Control for a business
  const handleFeatureToggle = (featureKey: keyof ManagedTenant['features']) => {
    if (!selectedTenant) return;
    const updated = {
      ...selectedTenant,
      features: {
        ...selectedTenant.features,
        [featureKey]: !selectedTenant.features[featureKey]
      }
    };
    setSelectedTenant(updated);
  };

  // Save updated controls
  const handleSaveTenantControls = () => {
    if (!selectedTenant) return;
    setTenants(prev => prev.map(t => t.id === selectedTenant.id ? selectedTenant : t));
    showToast(`Updated permissions & controls for "${selectedTenant.name}"`);
    setSelectedTenant(null);
  };

  // Toggle Active/Suspended status
  const handleToggleStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'suspended' : 'active';
        showToast(`${t.name} is now ${nextStatus.toUpperCase()}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Create new tenant
  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.owner_email) return;

    const created: ManagedTenant = {
      id: `tenant-00${tenants.length + 1}`,
      name: newTenant.name,
      business_type: newTenant.business_type,
      owner_name: newTenant.owner_name || 'Admin',
      owner_email: newTenant.owner_email,
      plan: newTenant.plan,
      ui_mode: newTenant.ui_mode,
      status: 'active',
      branches_count: 1,
      monthly_revenue: newTenant.plan === 'Enterprise' ? '₹14,999' : (newTenant.plan === 'Professional' ? '₹4,999' : '₹1,999'),
      features: {
        quick_sale: true,
        pos: newTenant.ui_mode !== 'simple',
        tables: newTenant.business_type === 'Restaurant' || newTenant.business_type === 'Cafe',
        kitchen_display: true,
        qr_ordering: true,
        khata_credit: true,
        recipes: newTenant.plan !== 'Starter',
        ai_features: newTenant.plan === 'Enterprise',
        day_close: true,
        multi_branch: newTenant.plan === 'Enterprise'
      }
    };

    setTenants([created, ...tenants]);
    setIsProvisionModalOpen(false);
    setNewTenant({
      name: '',
      business_type: 'Cafe',
      owner_name: '',
      owner_email: '',
      plan: 'Professional',
      ui_mode: 'standard'
    });
    showToast(`Successfully provisioned "${created.name}" and created Admin credentials!`);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-aura-bg text-aura-text font-sans">
      
      {/* Dedicated Super Admin Sidebar */}
      <SuperAdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tenantsCount={tenants.length} 
      />

      {/* Main Workspace for Super Admin */}
      <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Toast Notification */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TAB 1: BUSINESSES & TENANTS DIRECTORY */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-aura-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-aura-text tracking-tight">
                    Tenant Businesses Directory
                  </h1>
                  <span className="badge-neutral text-[10px] font-bold">Platform Governance</span>
                </div>
                <p className="text-xs text-aura-muted">
                  Provision new food businesses, manage permissions, and delegate controls to tenant admins.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProvisionModalOpen(true)}
                  className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision New Business</span>
                </button>
              </div>
            </div>

            {/* Quick Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-aura-card border border-aura-border shadow-sm space-y-1">
                <div className="flex items-center justify-between text-aura-muted text-xs font-semibold">
                  <span>Managed Businesses</span>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-aura-text">{tenants.length}</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {tenants.filter(t => t.status === 'active').length} Active • 0 Suspended
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-aura-card border border-aura-border shadow-sm space-y-1">
                <div className="flex items-center justify-between text-aura-muted text-xs font-semibold">
                  <span>Global Monthly MRR</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-aura-text">₹45,496</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ↑ 18.5% Growth This Month
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-aura-card border border-aura-border shadow-sm space-y-1">
                <div className="flex items-center justify-between text-aura-muted text-xs font-semibold">
                  <span>Active POS Outlets</span>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-aura-text">
                  {tenants.reduce((sum, t) => sum + t.branches_count, 0)} Branches
                </div>
                <p className="text-[11px] text-aura-muted">Across 5 City Hubs</p>
              </div>

              <div className="p-4 rounded-2xl bg-aura-card border border-aura-border shadow-sm space-y-1">
                <div className="flex items-center justify-between text-aura-muted text-xs font-semibold">
                  <span>Platform Health SLA</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-aura-text">99.99%</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  All Microservices Operational
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-aura-card border border-aura-border">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-aura-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setTenantPage(1);
                  }}
                  placeholder="Search businesses by name, owner or email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent text-aura-text placeholder:text-aura-muted focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-aura-border pt-2 sm:pt-0 sm:pl-3">
                <Filter className="w-3.5 h-3.5 text-aura-muted shrink-0" />
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setTenantPage(1);
                  }}
                  className="bg-transparent text-xs text-aura-text font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Business Types</option>
                  <option value="Restaurant">Restaurants & Bistros</option>
                  <option value="Cafe">Cafes & Bakeries</option>
                  <option value="Juice Center">Juice Centers</option>
                  <option value="Tea Shop">Tea & Coffee Shops</option>
                  <option value="Cloud Kitchen">Cloud Kitchens</option>
                </select>
              </div>
            </div>

            {/* Master Business Roster Table */}
            <div className="rounded-2xl border border-aura-border bg-aura-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-aura-border bg-aura-dark/40 text-aura-muted uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-bold">Business Name & Category</th>
                      <th className="py-3 px-4 font-bold">Admin / Owner Account</th>
                      <th className="py-3 px-4 font-bold">UI Complexity</th>
                      <th className="py-3 px-4 font-bold">Plan & Tier</th>
                      <th className="py-3 px-4 font-bold">Enabled Capabilities</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Super Admin Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aura-border">
                    {paginatedTenants.length > 0 ? (
                      paginatedTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-aura-dark/20 transition-colors">
                          
                          {/* Name & Type */}
                          <td className="py-3.5 px-4 font-semibold text-aura-text">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-aura-border flex items-center justify-center font-bold text-xs text-aura-text shrink-0">
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-aura-text">{t.name}</div>
                                <div className="text-[11px] text-aura-muted font-medium">{t.business_type} • {t.branches_count} {t.branches_count > 1 ? 'Outlets' : 'Outlet'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="py-3.5 px-4 text-aura-text">
                            <div className="font-semibold">{t.owner_name}</div>
                            <div className="text-[11px] text-aura-muted font-mono">{t.owner_email}</div>
                          </td>

                          {/* UI Complexity */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              t.ui_mode === 'simple' 
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                                : (t.ui_mode === 'standard' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20')
                            }`}>
                              {t.ui_mode}
                            </span>
                          </td>

                          {/* Plan */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-aura-text">{t.plan}</div>
                            <div className="text-[10px] text-aura-muted font-semibold">{t.monthly_revenue} / mo</div>
                          </td>

                          {/* Feature Pills */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                              {t.features.quick_sale && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  POS
                                </span>
                              )}
                              {t.features.tables && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  Tables
                                </span>
                              )}
                              {t.features.kitchen_display && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  KDS
                                </span>
                              )}
                              {t.features.khata_credit && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  Khata
                                </span>
                              )}
                              {t.features.recipes && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  BOM
                                </span>
                              )}
                              {t.features.ai_features && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-aura-text">
                                  AI
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(t.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                t.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                              title="Click to toggle Active / Suspended status"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="capitalize">{t.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedTenant(JSON.parse(JSON.stringify(t)))}
                              className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Manage Controls</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-aura-muted text-xs">
                          No businesses found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTenants.length > 0 && (
                <div className="p-4 border-t border-aura-border bg-aura-card">
                  <Pagination
                    currentPage={tenantPage}
                    totalItems={filteredTenants.length}
                    pageSize={tenantPageSize}
                    onPageChange={setTenantPage}
                    onPageSizeChange={(sz) => {
                      setTenantPageSize(sz);
                      setTenantPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN CONTROLS & RBAC MATRIX */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-aura-border">
              <h2 className="text-xl font-bold text-aura-text flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <span>Global Feature Gate & Admin RBAC Delegation</span>
              </h2>
              <p className="text-xs text-aura-muted mt-1">
                Configure which capabilities are provisioned across business complexity tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-aura-text">Simple Mode (Micro Stalls)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    2-Tap POS
                  </span>
                </div>
                <p className="text-xs text-aura-muted leading-relaxed">
                  Ideal for Chai Stalls, Juice Centers, Food Carts, and Snack Counters. Strips away table maps and multi-station routing.
                </p>
                <div className="space-y-2 pt-2 border-t border-aura-border text-xs">
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Quick Sale POS</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Indian Khata Ledger</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-muted">
                    <span>Table Floor Plan</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Disabled</span>
                  </div>
                  <div className="flex items-center justify-between text-aura-muted">
                    <span>Multi-Station KDS</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Disabled</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-aura-text">Standard Mode (Cafe & QSR)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    Dine-In & KDS
                  </span>
                </div>
                <p className="text-xs text-aura-muted leading-relaxed">
                  Engineered for Cafes, Bakeries, Pizzerias, and Fast Casual Diners with table management and kitchen screens.
                </p>
                <div className="space-y-2 pt-2 border-t border-aura-border text-xs">
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Floor Plan & Table POS</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Single-Station KDS</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Recipe Inventory Costing</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>EOD Day Close Reconciliation</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-aura-text">Advanced Mode (Chains)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    Full Enterprise
                  </span>
                </div>
                <p className="text-xs text-aura-muted leading-relaxed">
                  Full multi-branch synchronization, multi-station kitchen routing, automated BOM deduction, and AI forecasting.
                </p>
                <div className="space-y-2 pt-2 border-t border-aura-border text-xs">
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Multi-Station KDS Bump</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Central Multi-Branch Sync</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>AI Operations Copilot</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-aura-text">
                    <span>Role-Based Permissions</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAAS SUBSCRIPTION PLANS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-aura-border">
              <h2 className="text-xl font-bold text-aura-text flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span>SaaS Subscription Plans & Quotas</span>
              </h2>
              <p className="text-xs text-aura-muted mt-1">
                Manage commercial tiers, pricing, and branch allowances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-aura-card border border-aura-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-aura-text">Starter Plan</h3>
                  <span className="badge-neutral text-xs font-bold">Micro Vendors</span>
                </div>
                <div className="text-3xl font-black text-aura-text">
                  ₹1,999 <span className="text-xs font-normal text-aura-muted">/ month</span>
                </div>
                <p className="text-xs text-aura-muted">Single-counter quick sales, UPI QR codes, and Khata credit ledger.</p>
                <ul className="space-y-2 text-xs text-aura-text pt-4 border-t border-aura-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Up to 2 Outlets / Carts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>2-Tap Quick Sale POS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Offline IndexedDB Resilience</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border border-zinc-900 dark:border-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black">Professional</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-zinc-900/20 text-[10px] font-bold uppercase">
                    Most Popular
                  </span>
                </div>
                <div className="text-3xl font-black">
                  ₹4,999 <span className="text-xs font-normal opacity-75">/ month</span>
                </div>
                <p className="text-xs opacity-80">Full table management, kitchen display, and automated recipe costing.</p>
                <ul className="space-y-2 text-xs pt-4 border-t border-white/20 dark:border-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Up to 5 Dine-in Branches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Table Floor Plan + KDS Station</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Recipe Costing & Stock BOM</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-aura-card border border-aura-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-aura-text">Enterprise Tier</h3>
                  <span className="badge-neutral text-xs font-bold">Multi-Chain</span>
                </div>
                <div className="text-3xl font-black text-aura-text">
                  ₹14,999 <span className="text-xs font-normal text-aura-muted">/ month</span>
                </div>
                <p className="text-xs text-aura-muted">Cloud kitchen networks, restaurant chains, and centralized procurement.</p>
                <ul className="space-y-2 text-xs text-aura-text pt-4 border-t border-aura-border">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Unlimited Outlets & Hubs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Multi-Station KDS Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>AI Operations Copilot</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL PLATFORM GMV & METRICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-aura-border">
              <h2 className="text-xl font-bold text-aura-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Global Platform GMV & Order Velocity</span>
              </h2>
              <p className="text-xs text-aura-muted mt-1">
                Real-time aggregated transaction volume across all registered hospitality tenants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-1">
                <div className="text-xs font-semibold text-aura-muted">Platform GMV Processed</div>
                <div className="text-3xl font-black text-aura-text">₹48,92,450</div>
                <p className="text-[11px] text-emerald-600 font-semibold">↑ 24.8% vs last month</p>
              </div>

              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-1">
                <div className="text-xs font-semibold text-aura-muted">Total POS Orders Logged</div>
                <div className="text-3xl font-black text-aura-text">64,280</div>
                <p className="text-[11px] text-emerald-600 font-semibold">Avg 0.4s sale execution time</p>
              </div>

              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-1">
                <div className="text-xs font-semibold text-aura-muted">Active Payment Volume</div>
                <div className="text-3xl font-black text-aura-text">86.4% UPI</div>
                <p className="text-[11px] text-aura-muted">10.2% Cash • 3.4% Khata Credit</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM HEALTH & SLA */}
        {activeTab === 'system-health' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-aura-border">
              <h2 className="text-xl font-bold text-aura-text flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Cluster Vitals, MongoDB Connection & Microservices</span>
              </h2>
              <p className="text-xs text-aura-muted mt-1">
                Infrastructure health telemetry, database connection pool, and zero-trust authentication services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-4">
                <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Database & Engine Vitals</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">MongoDB Motor Connection Pool</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Active (40 / 100)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">FastAPI Average Response Latency</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">14.2 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">Redis Pub/Sub KDS Live Sync</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-aura-card border border-aura-border space-y-4">
                <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span>Service Level Agreement (SLA)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">Core POS Billing Engine</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100.0% Uptime</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">Kitchen Display Routing Service</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">99.99% Uptime</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-aura-dark/40">
                    <span className="font-semibold text-aura-muted">JWT Auth & Multi-Tenant IDP</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & AUDIT LOGS */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-aura-border">
              <h2 className="text-xl font-bold text-aura-text flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Super Admin Audit Trail & Security Ledger</span>
              </h2>
              <p className="text-xs text-aura-muted mt-1">
                Immutable record of tenant provisioning, credential resets, and permission grants.
              </p>
            </div>

            <div className="rounded-2xl border border-aura-border bg-aura-card overflow-hidden shadow-sm">
              <div className="p-4 border-b border-aura-border flex items-center justify-between">
                <span className="text-xs font-bold text-aura-text">Recent Super Admin Actions</span>
                <span className="text-[11px] text-aura-muted font-mono">Live Sync</span>
              </div>
              <div className="divide-y divide-aura-border text-xs">
                <div className="p-3.5 flex items-center justify-between hover:bg-aura-dark/20">
                  <div>
                    <div className="font-bold text-aura-text">Provisioned Business: "Chai & Bun Maska Street Hub"</div>
                    <div className="text-[11px] text-aura-muted">Granted Quick Sale POS + Khata Ledger • Created Admin karan@chaihub.com</div>
                  </div>
                  <span className="text-[10px] text-aura-muted font-mono">10 mins ago</span>
                </div>

                <div className="p-3.5 flex items-center justify-between hover:bg-aura-dark/20">
                  <div>
                    <div className="font-bold text-aura-text">Updated RBAC Controls: "Aura Fine Dining & Bistro"</div>
                    <div className="text-[11px] text-aura-muted">Enabled Multi-Station KDS and Central Multi-Branch Sync</div>
                  </div>
                  <span className="text-[10px] text-aura-muted font-mono">35 mins ago</span>
                </div>

                <div className="p-3.5 flex items-center justify-between hover:bg-aura-dark/20">
                  <div>
                    <div className="font-bold text-aura-text">Super Admin Login Authenticated</div>
                    <div className="text-[11px] text-aura-muted">IP 127.0.0.1 • TLS 256-bit Session Established for admin@aura.io</div>
                  </div>
                  <span className="text-[10px] text-aura-muted font-mono">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Pristine Enterprise Tenant Permission & Feature Delegator */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Delegate Admin Controls: {selectedTenant.name}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Super Admin master control & feature toggle matrix for <span className="font-mono">{selectedTenant.owner_email}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Metadata Configuration Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Business Category</label>
                <div className="font-bold text-zinc-900 dark:text-white text-sm">{selectedTenant.business_type}</div>
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Subscription Tier</label>
                <select
                  value={selectedTenant.plan}
                  onChange={(e) => setSelectedTenant({ ...selectedTenant, plan: e.target.value as any })}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                >
                  <option value="Starter">Starter (₹1,999/mo)</option>
                  <option value="Professional">Professional (₹4,999/mo)</option>
                  <option value="Enterprise">Enterprise (₹14,999/mo)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">UI Complexity Level</label>
                <select
                  value={selectedTenant.ui_mode}
                  onChange={(e) => setSelectedTenant({ ...selectedTenant, ui_mode: e.target.value as any })}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                >
                  <option value="simple">Simple (Micro Stall / 2-Tap)</option>
                  <option value="standard">Standard (Cafe / QSR)</option>
                  <option value="advanced">Advanced (Multi-Station Chain)</option>
                </select>
              </div>
            </div>

            {/* Feature Granting Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Feature Controls Given To Admin
                </h4>
                <span className="text-[10px] text-zinc-400 font-medium">Toggle to grant or revoke</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Quick Sale POS */}
                <div 
                  onClick={() => handleFeatureToggle('quick_sale')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.quick_sale ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Quick Sale POS Billing</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">2-tap micro fast billing</div>
                    </div>
                  </div>
                  {/* Apple-style Toggle Switch */}
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.quick_sale ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.quick_sale ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 2. Tables & Floor Plan */}
                <div 
                  onClick={() => handleFeatureToggle('tables')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.tables ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Floor Plan & Tables</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Dine-in seat layout</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.tables ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.tables ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 3. Kitchen Display (KDS) */}
                <div 
                  onClick={() => handleFeatureToggle('kitchen_display')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.kitchen_display ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Kitchen Display (KDS)</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Station live ticket timers</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.kitchen_display ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.kitchen_display ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 4. Khata Ledger */}
                <div 
                  onClick={() => handleFeatureToggle('khata_credit')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.khata_credit ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Indian Khata & Credit</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Customer debt & WhatsApp bills</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.khata_credit ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.khata_credit ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 5. Recipe Costing & BOM */}
                <div 
                  onClick={() => handleFeatureToggle('recipes')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.recipes ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Recipe Costing & BOM</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Auto ingredient stock deduction</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.recipes ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.recipes ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 6. AI Copilot */}
                <div 
                  onClick={() => handleFeatureToggle('ai_features')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.ai_features ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">AI Operations Copilot</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Automated prep & sales forecast</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.ai_features ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.ai_features ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 7. QR Ordering */}
                <div 
                  onClick={() => handleFeatureToggle('qr_ordering')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.qr_ordering ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Customer QR Ordering</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Self-order via smartphone</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.qr_ordering ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.qr_ordering ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

                {/* 8. Multi-Branch Chain Sync */}
                <div 
                  onClick={() => handleFeatureToggle('multi_branch')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedTenant.features.multi_branch ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">Multi-Branch Chain Sync</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Central menu & inventory ledger</div>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${selectedTenant.features.multi_branch ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${selectedTenant.features.multi_branch ? 'translate-x-4 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white dark:bg-zinc-400'}`} />
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedTenant.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                {selectedTenant.status === 'active' ? 'Freeze Business Access' : 'Unfreeze Business'}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTenantControls}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Save Controls & Apply
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Provision New Business */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in font-sans">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-5 text-zinc-900 dark:text-white">
            
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-base shadow-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Provision New Food Business
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Instantly create tenant workspace and assign Admin credentials
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsProvisionModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionTenant} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Business / Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chai Express & Fast Bites"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Business Category
                  </label>
                  <select
                    value={newTenant.business_type}
                    onChange={(e) => setNewTenant({ ...newTenant, business_type: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="Restaurant">Restaurant / Bistro</option>
                    <option value="Cafe">Cafe & Coffee Bar</option>
                    <option value="Juice Center">Juice Center</option>
                    <option value="Tea Shop">Tea & Snack Stall</option>
                    <option value="Bakery">Bakery & Pastry</option>
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                    <option value="Food Truck">Food Truck / Cart</option>
                    <option value="Tiffin Center">Tiffin & Meals Center</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Initial UI Complexity
                  </label>
                  <select
                    value={newTenant.ui_mode}
                    onChange={(e) => setNewTenant({ ...newTenant, ui_mode: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="simple">Simple (Micro Stall)</option>
                    <option value="standard">Standard (Cafe/QSR)</option>
                    <option value="advanced">Advanced (Chain)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newTenant.owner_name}
                    onChange={(e) => setNewTenant({ ...newTenant, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Admin Email (Login ID)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@chai.io"
                    value={newTenant.owner_email}
                    onChange={(e) => setNewTenant({ ...newTenant, owner_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  SaaS Plan Subscription
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Starter', 'Professional', 'Enterprise'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTenant({ ...newTenant, plan: p })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        newTenant.plan === p
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div>{p}</div>
                      <div className="text-[10px] font-normal opacity-70">
                        {p === 'Starter' ? '₹1,999' : (p === 'Professional' ? '₹4,999' : '₹14,999')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Provision Business & Grant Controls</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
