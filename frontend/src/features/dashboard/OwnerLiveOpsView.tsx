import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, TrendingUp, DollarSign, ShoppingBag, Clock,
  Users, BarChart3, CheckCircle2, AlertTriangle, Timer,
  Target, Receipt, Flame, CreditCard, Banknote, Smartphone,
  BookOpen, Package, Zap, ChefHat, LayoutGrid, RefreshCw,
  ArrowUpRight, ChevronRight, Download, FileText, Printer
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { toCSV, formatLiveOpsForExport, getTodayLabel } from '../../utils/exportUtils';

interface LiveOpsData {
  total_revenue: number; net_profit: number; profit_margin_pct: number;
  total_orders: number; completed_orders: number; active_orders: number;
  cancelled_orders: number; recent_revenue_1h: number; recent_orders_1h: number;
  total_customers: number; payment_split: Record<string, number>;
  top_live_items: { name: string; qty: number }[];
  order_types: Record<string, number>; live_feed: any[];
  sla_ok: number; sla_breach: number; avg_order_value: number;
}

interface HeatmapSlot { hour: string; orders: number; revenue: number; intensity: number; }

interface OwnerLiveOpsProps { onNavigate?: (tab: ActiveTab) => void; }

/* ── KPI Card ────────────────────────────────────────────────────── */
const KpiCard: React.FC<{
  title: string; value: string; sub?: string;
  icon: React.ElementType; type?: 'default' | 'success' | 'danger' | 'warning';
  onClick?: () => void;
}> = ({ title, value, sub, icon: Icon, type = 'default', onClick }) => {
  const styles = {
    default: {
      icon: 'color: var(--color-primary)',
      iconBg: 'background: var(--color-primary-light)',
      border: '1px solid var(--border-subtle)',
    },
    success: {
      icon: 'color: var(--color-success)',
      iconBg: 'background: var(--color-success-light)',
      border: '1px solid var(--color-success-border)',
    },
    danger: {
      icon: 'color: var(--color-danger)',
      iconBg: 'background: var(--color-danger-light)',
      border: '1px solid var(--color-danger-border)',
    },
    warning: {
      icon: 'color: var(--color-warning)',
      iconBg: 'background: var(--color-warning-light)',
      border: '1px solid var(--color-warning-border)',
    },
  }[type];

  return (
    <button
      onClick={onClick}
      style={{ border: styles.border, backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}
      className="w-full text-left rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 transition-all hover:shadow-md hover:translate-y-[-1px] active:translate-y-0 active:shadow-sm cursor-pointer group min-w-0 overflow-hidden"
    >
      <div className="rounded-lg w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0" style={{ background: styles.iconBg }}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: styles.icon.replace('color: ', '') }} />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-black leading-tight tabular-nums truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        <p className="text-[11px] sm:text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
        {sub && (
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>
            {sub}
          </p>
        )}
      </div>
      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden md:block" style={{ color: 'var(--text-muted)' }} />
    </button>
  );
};

/* ── Export dropdown ─────────────────────────────────────────────── */
const ExportBtn: React.FC<{ liveOps: LiveOpsData | null; currency: string }> = ({ liveOps, currency }) => {
  const [open, setOpen] = useState(false);
  const handle = (type: 'csv' | 'print') => {
    setOpen(false);
    if (!liveOps) return;
    if (type === 'csv') toCSV(formatLiveOpsForExport(liveOps, currency), `live_ops_${getTodayLabel()}`);
    else window.print();
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="btn-secondary flex items-center gap-2">
        <Download className="w-3.5 h-3.5" />
        Export
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-20 animate-scale-in"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
          >
            {[
              { label: 'Export as CSV', icon: FileText, type: 'csv' as const },
              { label: 'Print / PDF', icon: Printer, type: 'print' as const },
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.type} onClick={() => handle(opt.type)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Live Feed Row ───────────────────────────────────────────────── */
const FeedRow: React.FC<{ order: any; currency: string }> = ({ order, currency }) => {
  const elapsed = order.created_at
    ? Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000) : 0;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-[var(--bg-surface-subtle)] transition-colors"
      style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
            #{order.order_number}
          </span>
          <span className="badge-neutral text-[10px]">{order.order_type?.replace('_', ' ')}</span>
          {order.table_number && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>T{order.table_number}</span>
          )}
        </div>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {order.customer_name || 'Walk-in'} · {order.items_count} item{order.items_count !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {currency}{order.grand_total?.toFixed(2)}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
          {elapsed < 1 ? 'Just now' : `${elapsed}m ago`}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────────── */
export const OwnerLiveOpsView: React.FC<OwnerLiveOpsProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const currency = tenant?.config?.currency_symbol || '₹';
  const [liveOps, setLiveOps] = useState<LiveOpsData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [liveRes, heatRes] = await Promise.all([
        api.get('/reports/live-ops'),
        api.get('/reports/hourly-heatmap'),
      ]);
      setLiveOps(liveRes.data.data);
      setHeatmap(heatRes.data.data?.heatmap || []);
      setLastUpdate(new Date());
    } catch (err) { console.error('Live ops error:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 8000);
    return () => clearInterval(id);
  }, [fetchData]);

  const paymentData = liveOps
    ? Object.entries(liveOps.payment_split).map(([name, value]) => ({ name, value: Math.round(value as number) })).filter(d => d.value > 0)
    : [];

  const slaTotal = (liveOps?.sla_ok || 0) + (liveOps?.sla_breach || 0);
  const slaCompliance = slaTotal > 0 ? Math.round((liveOps!.sla_ok / slaTotal) * 100) : 100;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-64 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-hover)' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary)', boxShadow: '0 2px 8px rgba(29,78,216,0.25)' }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            Live Operations Center
          </h1>
          <p className="text-xs mt-1 flex items-center gap-1.5 ml-10" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: 'var(--color-success)' }} />
            Auto-refresh every 8s · Last updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <ExportBtn liveOps={liveOps} currency={currency} />
          <button onClick={() => onNavigate?.('reports')} className="btn-primary">
            <BarChart3 className="w-3.5 h-3.5" />
            Reports
          </button>
        </div>
      </div>

      {/* ── Late orders alert banner ─────────────────────────────── */}
      {(liveOps?.sla_breach || 0) > 0 && (
        <div className="alert-danger flex items-center gap-3 animate-slide-in-up rounded-xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{liveOps?.sla_breach} Late Order{(liveOps?.sla_breach || 0) > 1 ? 's' : ''} Active</span>
            <span className="ml-2 opacity-80 hidden sm:inline">Exceeded prep time target. Review kitchen screen immediately.</span>
          </div>
          <button onClick={() => onNavigate?.('kds')} className="ml-auto flex items-center gap-1 text-xs font-bold shrink-0 hover:underline cursor-pointer">
            View Kitchen <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── KPI Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Revenue"
          value={`${currency}${Math.round(liveOps?.total_revenue || 0).toLocaleString('en-IN')}`}
          sub={`${currency}${Math.round(liveOps?.recent_revenue_1h || 0)} in last hour`}
          icon={TrendingUp} type="default"
          onClick={() => onNavigate?.('reports')}
        />
        <KpiCard
          title="Net Profit"
          value={`${currency}${Math.round(liveOps?.net_profit || 0).toLocaleString('en-IN')}`}
          sub={`${liveOps?.profit_margin_pct || 0}% margin`}
          icon={DollarSign} type="success"
          onClick={() => onNavigate?.('day-close')}
        />
        <KpiCard
          title="Active Orders"
          value={String(liveOps?.active_orders || 0)}
          sub={`${liveOps?.recent_orders_1h || 0} in last hour`}
          icon={Activity}
          type={(liveOps?.active_orders || 0) > 10 ? 'warning' : 'default'}
          onClick={() => onNavigate?.('orders')}
        />
        <KpiCard
          title="Avg Order Value"
          value={`${currency}${Math.round(liveOps?.avg_order_value || 0).toLocaleString('en-IN')}`}
          sub={`${liveOps?.completed_orders || 0} finished today`}
          icon={ShoppingBag} type="default"
          onClick={() => onNavigate?.('orders')}
        />
      </div>

      {/* ── Secondary stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Total Orders',    value: liveOps?.total_orders || 0,    color: 'var(--color-primary)',  bg: 'var(--color-primary-light)',  icon: Receipt },
          { label: 'Finished Orders', value: liveOps?.completed_orders || 0, color: 'var(--color-success)', bg: 'var(--color-success-light)',  icon: CheckCircle2 },
          { label: 'Cancelled',       value: liveOps?.cancelled_orders || 0, color: 'var(--color-danger)',  bg: 'var(--color-danger-light)',   icon: AlertTriangle },
          { label: 'Customers Served',value: liveOps?.total_customers || 0,  color: 'var(--color-primary)', bg: 'var(--color-primary-light)',  icon: Users },
          { label: 'Orders On Time',  value: `${slaCompliance}%`,            color: slaCompliance >= 90 ? 'var(--color-success)' : 'var(--color-warning)', bg: slaCompliance >= 90 ? 'var(--color-success-light)' : 'var(--color-warning-light)', icon: Target },
          { label: 'Late Orders',     value: liveOps?.sla_breach || 0,       color: (liveOps?.sla_breach || 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)', bg: (liveOps?.sla_breach || 0) > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)', icon: Timer },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Today at a Glance — simple insight row ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Best Selling Category Today */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-warning)' }} />
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Top Selling Items Right Now</h3>
          </div>
          {liveOps?.top_live_items?.length ? (
            <div className="space-y-2">
              {liveOps.top_live_items.slice(0, 4).map((item, i) => {
                const max = liveOps.top_live_items[0]?.qty || 1;
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium truncate max-w-[150px]" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{item.qty} sold</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--color-neutral-light)' }}>
                      <div style={{ width: `${(item.qty / max) * 100}%`, background: i === 0 ? 'var(--color-warning)' : 'var(--color-primary)', transition: 'width 0.5s ease' }}
                        className="h-full rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No active items yet</p>
          )}
          <button onClick={() => onNavigate?.('menu')} className="btn-ghost w-full mt-3 text-[11px]">
            Manage Menu <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* How Customers Paid */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>How Customers Paid Today</h3>
          </div>
          {liveOps && Object.entries(liveOps.payment_split).filter(([, v]) => (v as number) > 0).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(liveOps.payment_split)
                .filter(([, v]) => (v as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([method, amount], i) => {
                  const total = Object.values(liveOps.payment_split).reduce((s, v) => s + (v as number), 0);
                  const pct   = total > 0 ? Math.round(((amount as number) / total) * 100) : 0;
                  const icons: Record<string, React.ReactNode> = {
                    Cash: <Banknote className="w-3.5 h-3.5" />, UPI: <Smartphone className="w-3.5 h-3.5" />,
                    Card: <CreditCard className="w-3.5 h-3.5" />, Khata: <BookOpen className="w-3.5 h-3.5" />,
                  };
                  const barColors = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--text-muted)'];
                  return (
                    <div key={method} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{icons[method]}</span>
                          {method}
                        </div>
                        <span className="font-semibold tabular-nums text-[11px]" style={{ color: 'var(--text-primary)' }}>
                          {currency}{(amount as number).toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--color-neutral-light)' }}>
                        <div style={{ width: `${pct}%`, background: barColors[i % barColors.length], transition: 'width 0.6s ease' }}
                          className="h-full rounded-full" />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No payments yet</p>
          )}
          <button onClick={() => onNavigate?.('day-close')} className="btn-ghost w-full mt-3 text-[11px]">
            View End of Day <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Order Type Breakdown */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Order Types Today</h3>
          </div>
          {liveOps && Object.entries(liveOps.order_types).filter(([, v]) => (v as number) > 0).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(liveOps.order_types)
                .filter(([, v]) => (v as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([type, count], i) => {
                  const total = Object.values(liveOps.order_types).reduce((s, v) => s + (v as number), 0);
                  const pct   = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                  const readableType: Record<string, string> = {
                    dine_in: 'Dine In (Sit down)', takeaway: 'Takeaway / Parcel',
                    delivery: 'Home Delivery', quick_sale: 'Counter Sale', qr_order: 'QR / Online',
                  };
                  const typeColors = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--text-muted)'];
                  return (
                    <div key={type} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{readableType[type] || type}</span>
                        <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--color-neutral-light)' }}>
                        <div style={{ width: `${pct}%`, background: typeColors[i % typeColors.length], transition: 'width 0.5s ease' }}
                          className="h-full rounded-full" />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No orders yet</p>
          )}
          <button onClick={() => onNavigate?.('orders')} className="btn-ghost w-full mt-3 text-[11px]">
            See All Orders <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Feed */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Latest Orders</h3>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Most recent 10 orders — updates every 8 seconds</p>
            </div>
            <button onClick={() => onNavigate?.('orders')} className="btn-ghost text-xs flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {liveOps?.live_feed?.length ? (
            liveOps.live_feed.map((order, i) => (
              <FeedRow key={order.id || i} order={order} currency={currency} />
            ))
          ) : (
            <div className="py-12 text-center">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No orders yet today</p>
            </div>
          )}
        </div>

        {/* Right Panel — Kitchen + Profit Tip */}
        <div className="space-y-4">

          {/* Kitchen Status */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kitchen Status</h3>
              <ChefHat className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Orders waiting to be made', value: liveOps?.active_orders || 0, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
                { label: 'Orders finished today',      value: liveOps?.completed_orders || 0, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
                { label: 'Late orders (over time)',    value: liveOps?.sla_breach || 0, color: (liveOps?.sla_breach || 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)', bg: (liveOps?.sla_breach || 0) > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: s.bg }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate?.('kds')} className="btn-primary w-full mt-3 text-xs justify-center">
              <ChefHat className="w-3.5 h-3.5" /> Open Kitchen Screen
            </button>
          </div>

          {/* Profit tip */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Today's Profit Summary</h3>
            </div>
            <p className="text-[22px] font-bold tabular-nums" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {currency}{(liveOps?.net_profit || 0).toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {liveOps?.profit_margin_pct || 0}% profit margin on {currency}{(liveOps?.total_revenue || 0).toLocaleString()} revenue
            </p>
            <button onClick={() => onNavigate?.('day-close')} className="btn-ghost w-full mt-3 text-[11px] justify-center">
              See Full Breakdown <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hourly Heatmap ──────────────────────────────────────── */}
      {heatmap.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Hourly Revenue — Today</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Revenue by hour. Green = peak, amber = moderate, gray = low</p>
            </div>
            <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmap} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  formatter={(v: any) => [`${currency}${v}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={38}>
                  {heatmap.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.intensity > 0.7 ? 'var(--color-success)' :
                      entry.intensity > 0.35 ? 'var(--color-warning)' :
                      'var(--color-neutral-border)'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Go To Section — Quick Navigation ────────────────────── */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <p className="section-header mb-3">Go To</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[
            { id: 'pos',       label: 'New Sale',            icon: Zap,        color: 'var(--color-warning)' },
            { id: 'kds',       label: 'Kitchen Screen',      icon: ChefHat,    color: 'var(--color-success)' },
            { id: 'tables',    label: 'Table Map',           icon: LayoutGrid, color: 'var(--color-primary)' },
            { id: 'orders',    label: 'All Orders',          icon: Receipt,    color: 'var(--color-primary)' },
            { id: 'inventory', label: 'Check Stock',         icon: Package,    color: 'var(--color-danger)' },
            { id: 'crm-khata', label: 'Customers',           icon: Users,      color: 'var(--color-primary)' },
            { id: 'day-close', label: 'End of Day',          icon: BarChart3,  color: 'var(--color-success)' },
            { id: 'reports',   label: 'Sales Reports',       icon: TrendingUp, color: 'var(--color-primary)' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onNavigate?.(id as ActiveTab)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:shadow-md active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
