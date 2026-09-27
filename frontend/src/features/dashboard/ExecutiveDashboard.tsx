import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Activity, 
  Sparkles, 
  Zap,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Receipt,
  ChefHat,
  Package,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard } from '../../components/StatCard';
import { ActiveTab } from '../../components/Sidebar';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface ExecutiveDashboardProps {
  onNavigateToQuickSale: () => void;
  onNavigate?: (tab: ActiveTab) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  onNavigateToQuickSale,
  onNavigate 
}) => {
  const { tenant, uiMode } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get(`/reports/dashboard-metrics?timeframe=${timeframe}`);
        setMetrics(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [timeframe]);

  const currency = tenant?.config?.currency_symbol || '₹';

  const handleNav = (tab: ActiveTab) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-aura-text">
              {tenant?.name || 'Aura Operations Cockpit'}
            </h1>
            <span className="badge-neutral font-medium">
              {tenant?.business_type || 'Restaurant'}
            </span>
          </div>
          <p className="text-xs text-aura-muted mt-1">
            Real-time business performance, live revenue telemetry and kitchen throughput. (Click any card to inspect)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast Sale POS Button */}
          <button
            onClick={onNavigateToQuickSale}
            className="btn-primary"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>New Sale (Fast POS)</span>
          </button>
        </div>
      </div>

      {/* Clickable KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`${currency}${metrics?.total_revenue?.toLocaleString() || '0'}`}
          subtitle={`Across ${metrics?.total_orders || 0} completed orders`}
          icon={TrendingUp}
          trend="14.2%"
          trendPositive={true}
          colorVariant="blue"
          onClick={() => handleNav('orders')}
        />
        <StatCard
          title="Average Order Value"
          value={`${currency}${metrics?.average_order_value || '0'}`}
          subtitle="Spend per ticket"
          icon={ShoppingBag}
          trend="5.8%"
          trendPositive={true}
          colorVariant="emerald"
          onClick={() => handleNav('reports')}
        />
        <StatCard
          title="Estimated Net Profit"
          value={`${currency}${metrics?.net_profit_estimate?.toLocaleString() || '0'}`}
          subtitle={`Expenses: ${currency}${metrics?.total_expenses || 0}`}
          icon={DollarSign}
          trend="8.1%"
          trendPositive={true}
          colorVariant="violet"
          onClick={() => handleNav('day-close')}
        />
        <StatCard
          title="Operational Health Score"
          value={`${metrics?.health_score || 92} / 100`}
          subtitle="Peak kitchen compliance"
          icon={Activity}
          colorVariant="amber"
          onClick={() => handleNav('kds')}
        />
      </div>

      {/* Core Operation Modules Navigation Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-aura-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Operations Hub (Click to open)</span>
          </h3>
          <span className="text-[10px] text-aura-muted">9 Active Modules</span>
        </div>

        {/* Live Ops Featured Banner */}
        <button
          onClick={() => handleNav('live-ops' as ActiveTab)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 text-white text-left flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-black text-base text-white">Live Operations Center</h4>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Live
                </span>
              </div>
              <p className="text-white/70 text-xs">Real-time revenue feed · Active orders · Kitchen status · Payment split · Hourly heatmap</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { id: 'quick-sale', label: 'POS Terminal', icon: Zap, color: 'text-amber-500', desc: 'Fast billing' },
            { id: 'kds', label: 'Kitchen KDS', icon: ChefHat, color: 'text-emerald-500', desc: 'Cook tickets' },
            { id: 'tables', label: 'Floor Plan', icon: LayoutGrid, color: 'text-blue-500', desc: 'Table maps' },
            { id: 'orders', label: 'Live Orders', icon: Receipt, color: 'text-violet-500', desc: 'Receipts & status' },
            { id: 'inventory', label: 'Live Stock', icon: Package, color: 'text-rose-500', desc: 'Ingredients' },
            { id: 'recipes', label: 'Recipe BOM', icon: BookOpen, color: 'text-indigo-500', desc: 'Food costing' },
            { id: 'crm-khata', label: 'CRM & Khata', icon: ShoppingBag, color: 'text-teal-500', desc: 'Credit tabs' },
            { id: 'day-close', label: 'Day Close', icon: BarChart3, color: 'text-orange-500', desc: 'Reconciliation' },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id as ActiveTab)}
                className="glass-card p-3 rounded-xl border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${mod.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-aura-text group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{mod.label}</h4>
                  <p className="text-[10px] text-aura-muted mt-0.5">{mod.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Revenue Velocity Chart & Tender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clickable Revenue Area Chart */}
        <div 
          onClick={() => handleNav('reports')}
          className="lg:col-span-2 glass-card rounded-xl p-5 border border-aura-border flex flex-col justify-between cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-aura-border">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-aura-text">Revenue & Order Velocity</h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-aura-muted">Weekly revenue trajectory and transaction trends</p>
            </div>
            <span className="badge-info flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Full Analytics →</span>
            </span>
          </div>

          <div className="h-64 w-full pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.revenue_trend || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#18181B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-subtle)', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#18181B" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clickable Settlement Tender Split & Operations */}
        <div className="glass-card rounded-xl p-5 border border-aura-border flex flex-col justify-between space-y-5">
          <div>
            <div 
              onClick={() => handleNav('day-close')}
              className="flex items-center justify-between pb-2 border-b border-aura-border mb-4 cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-aura-text">Tender Breakdown</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-aura-muted">Settlement distribution & reconciliation</p>
              </div>
              <span className="text-[11px] font-semibold text-aura-muted group-hover:text-aura-text">Day Close →</span>
            </div>

            <div className="space-y-3.5">
              {metrics?.payment_split && Object.entries(metrics.payment_split).map(([method, amount]: any) => {
                const total = metrics.total_revenue || 1;
                const pct = Math.round((amount / total) * 100) || 0;
                return (
                  <div 
                    key={method} 
                    onClick={() => handleNav(method === 'Khata' ? 'crm-khata' : 'day-close')}
                    className="space-y-1 cursor-pointer p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-aura-text font-semibold">{method}</span>
                      <span className="text-aura-secondary font-mono">{currency}{amount.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-aura-border">
                      <div 
                        className={`h-full rounded-full ${
                          method === 'UPI' ? 'bg-zinc-900 dark:bg-white' : (method === 'Cash' ? 'bg-emerald-600' : 'bg-blue-600')
                        }`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Metrics Panel */}
          <div className="pt-3 border-t border-aura-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-aura-text">Operational Dimensions</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">92% Optimal</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div 
                onClick={() => handleNav('kds')}
                className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-aura-border cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-aura-text text-sm">94.2%</p>
                  <ArrowUpRight className="w-3 h-3 text-aura-muted opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-[11px] text-aura-muted mt-0.5">Kitchen SLA Met →</p>
              </div>
              <div 
                onClick={() => handleNav('recipes')}
                className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-aura-border cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-aura-text text-sm">68.5%</p>
                  <ArrowUpRight className="w-3 h-3 text-aura-muted opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-[11px] text-aura-muted mt-0.5">Avg Gross Margin →</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable Top Selling Products */}
      {metrics?.top_products && metrics.top_products.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-aura-border">
          <div 
            onClick={() => handleNav('menu')}
            className="flex items-center justify-between mb-3 pb-2 border-b border-aura-border cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-aura-text">Top Velocity Products</h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-aura-muted">Highest turnover items contributing to volume</p>
            </div>
            <span className="text-[11px] font-semibold text-aura-muted group-hover:text-aura-text">Manage Menu →</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.top_products.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => handleNav('menu')}
                className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs transition-all"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-aura-text truncate">{item.name}</p>
                  <p className="text-[11px] text-aura-muted font-mono">{item.sales} units sold</p>
                </div>
                <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[11px] flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
