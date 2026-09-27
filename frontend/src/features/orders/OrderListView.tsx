import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Receipt, Search, Printer, Filter,
  Download, FileText, ChevronDown, X, SlidersHorizontal,
  TrendingUp, CheckCircle2, AlertTriangle, Clock, ArrowUpRight,
  Calendar, RefreshCw, Zap, ChefHat, Package, Eye
} from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { ActiveTab } from '../../components/Sidebar';
import { toCSV, toJSON, toPDF, formatOrdersForExport, getTodayLabel } from '../../utils/exportUtils';

interface OrderListViewProps {
  onNavigate?: (tab: ActiveTab) => void;
  initialStatus?: string;
}

// ── Summary Stat Mini-card ───────────────────────────────────────────────────
const MiniStat: React.FC<{
  label: string; value: string | number; icon: React.ElementType;
  color: string; bg: string; onClick?: () => void;
}> = ({ label, value, icon: Icon, color, bg, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-aura-border ${bg} transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] cursor-pointer text-left w-full`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '100').replace('400', '950/40')}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <p className={`text-sm font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-aura-muted font-medium">{label}</p>
    </div>
    <ArrowUpRight className="w-3 h-3 text-aura-muted ml-auto opacity-0 group-hover:opacity-100" />
  </button>
);

// ── Export Dropdown ──────────────────────────────────────────────────────────
const ExportDropdown: React.FC<{ data: any[]; currency: string }> = ({ data, currency }) => {
  const [open, setOpen] = useState(false);

  const handleExport = (type: 'csv' | 'json' | 'print') => {
    setOpen(false);
    const label = `orders_export_${getTodayLabel()}`;
    if (type === 'csv') toCSV(formatOrdersForExport(data, currency), label);
    else if (type === 'json') toJSON(data, label);
    else toPDF('Orders Export — NovaFood OS');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary flex items-center gap-2"
        id="orders-export-btn"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-48 glass-card-elevated rounded-xl border border-aura-border overflow-hidden z-20 animate-scale-in shadow-xl">
            {[
              { label: 'Export as CSV', icon: FileText, type: 'csv' as const, desc: 'Spreadsheet compatible' },
              { label: 'Export as JSON', icon: Download, type: 'json' as const, desc: 'Raw data format' },
              { label: 'Print / Save PDF', icon: Printer, type: 'print' as const, desc: 'Print-friendly view' },
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => handleExport(opt.type)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-aura-text hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left border-b border-aura-border last:border-0"
                >
                  <Icon className="w-4 h-4 text-aura-muted shrink-0" />
                  <div>
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-aura-muted">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main OrderListView ───────────────────────────────────────────────────────
export const OrderListView: React.FC<OrderListViewProps> = ({ onNavigate, initialStatus }) => {
  const { tenant } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const currency = tenant?.config?.currency_symbol || '₹';

  const fetchOrders = async () => {
    try {
      const res = await api.get('/pos/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter, dateFilter, minAmount, maxAmount, sortBy]);

  // ── Computed stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed');
    const active = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
    const cancelled = orders.filter(o => o.status === 'cancelled');
    const revenue = completed.reduce((s, o) => s + (o.grand_total || 0), 0);
    return { completed: completed.length, active: active.length, cancelled: cancelled.length, revenue };
  }, [orders]);

  // ── Filtering & Sorting ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...orders];

    // Status
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);

    // Order type
    if (typeFilter !== 'all') result = result.filter(o => o.order_type === typeFilter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.includes(q)) ||
        (o.table_number && o.table_number.toLowerCase().includes(q))
      );
    }

    // Amount range
    if (minAmount) result = result.filter(o => (o.grand_total || 0) >= parseFloat(minAmount));
    if (maxAmount) result = result.filter(o => (o.grand_total || 0) <= parseFloat(maxAmount));

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (dateFilter === 'last1h') cutoff.setHours(now.getHours() - 1);
      else if (dateFilter === 'last6h') cutoff.setHours(now.getHours() - 6);
      else if (dateFilter === 'yesterday') { cutoff.setDate(now.getDate() - 1); cutoff.setHours(0, 0, 0, 0); }
      else if (dateFilter === 'week') cutoff.setDate(now.getDate() - 7);
      result = result.filter(o => o.created_at && new Date(o.created_at) >= cutoff);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'highest') return (b.grand_total || 0) - (a.grand_total || 0);
      return (a.grand_total || 0) - (b.grand_total || 0);
    });

    return result;
  }, [orders, statusFilter, typeFilter, search, minAmount, maxAmount, dateFilter, sortBy]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = [
    statusFilter !== 'all', typeFilter !== 'all', search.trim(), minAmount, maxAmount,
    dateFilter !== 'today', sortBy !== 'newest'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setTypeFilter('all');
    setDateFilter('today'); setMinAmount(''); setMaxAmount('');
    setSortBy('newest'); setCurrentPage(1);
  };

  const statusButtons = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'confirmed', label: 'New', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'preparing', label: 'Cooking', count: orders.filter(o => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
    { id: 'completed', label: 'Done', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto font-sans">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-aura-text tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            Orders & Transaction Ledger
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-aura-text font-bold border border-aura-border">
              {orders.length}
            </span>
          </h1>
          <p className="text-xs text-aura-muted mt-1 pl-11.5">
            Live order lifecycle · filter by status, type, date · export CSV/PDF
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchOrders} className="btn-ghost">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <ExportDropdown data={filtered} currency={currency} />
          {onNavigate && (
            <button onClick={() => onNavigate('pos')} className="btn-primary">
              <Zap className="w-3.5 h-3.5 fill-current" />
              New Sale
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Stats (clickable) ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Revenue" value={`${currency}${stats.revenue.toLocaleString()}`}
          icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
          onClick={() => { setStatusFilter('completed'); onNavigate?.('reports'); }} />
        <MiniStat label="Active Orders" value={stats.active}
          icon={Clock} color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-950/30"
          onClick={() => { setStatusFilter('preparing'); setCurrentPage(1); }} />
        <MiniStat label="Completed" value={stats.completed}
          icon={CheckCircle2} color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-950/30"
          onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }} />
        <MiniStat label="Cancelled" value={stats.cancelled}
          icon={AlertTriangle} color="text-rose-600 dark:text-rose-400"
          bg="bg-rose-50 dark:bg-rose-950/30"
          onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }} />
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Row 1: Search + Status Chips + Filters toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-aura-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="orders-search"
              type="text"
              placeholder="Search order #, customer name, phone, table…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-aura-muted hover:text-aura-text">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Advanced Filters toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
              showAdvancedFilters || activeFilterCount > 0
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent'
                : 'bg-aura-card border-aura-border text-aura-text hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-zinc-900/30 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="btn-ghost text-rose-600 dark:text-rose-400 shrink-0">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statusButtons.map(s => (
            <button
              key={s.id}
              onClick={() => { setStatusFilter(s.id); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 transition-all ${
                statusFilter === s.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
              }`}
            >
              {s.label}
              {s.count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  statusFilter === s.id
                    ? 'bg-white/20 dark:bg-zinc-900/20'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                }`}>
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="glass-card rounded-xl border border-aura-border p-4 animate-slide-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Order Type */}
              <div>
                <label className="text-[11px] font-bold text-aura-muted uppercase tracking-wider mb-1.5 block">Order Type</label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-aura-card border border-aura-border text-xs text-aura-text focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                >
                  <option value="all">All Types</option>
                  <option value="dine_in">Dine-In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                  <option value="quick_sale">Quick Sale</option>
                  <option value="qr_order">QR Order</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-[11px] font-bold text-aura-muted uppercase tracking-wider mb-1.5 block">Date Period</label>
                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-aura-card border border-aura-border text-xs text-aura-text focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                >
                  <option value="last1h">Last 1 Hour</option>
                  <option value="last6h">Last 6 Hours</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="text-[11px] font-bold text-aura-muted uppercase tracking-wider mb-1.5 block">Min Amount ({currency})</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-aura-card border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-aura-muted uppercase tracking-wider mb-1.5 block">Max Amount ({currency})</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxAmount}
                  onChange={e => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-aura-card border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-aura-border">
              <span className="text-[11px] font-bold text-aura-muted uppercase tracking-wider shrink-0">Sort by:</span>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'oldest', label: 'Oldest First' },
                  { id: 'highest', label: 'Highest Amount' },
                  { id: 'lowest', label: 'Lowest Amount' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      sortBy === s.id
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                        : 'bg-aura-card border border-aura-border text-aura-muted hover:text-aura-text'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-aura-muted mt-2">
              Showing <span className="font-bold text-aura-text">{filtered.length}</span> of <span className="font-bold">{orders.length}</span> orders
            </p>
          </div>
        )}
      </div>

      {/* ── Orders Table ────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-aura-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/60 text-aura-muted uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Type / Table</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Time</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aura-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="p-3.5">
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.map(ord => {
                const elapsed = ord.created_at
                  ? Math.floor((Date.now() - new Date(ord.created_at).getTime()) / 60000)
                  : 0;
                const isActive = ['confirmed', 'preparing', 'ready'].includes(ord.status);
                return (
                  <tr
                    key={ord.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group ${
                      isActive ? 'bg-amber-50/20 dark:bg-amber-950/5' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />}
                        <span className="font-mono font-black text-aura-text">#{ord.order_number}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded-md ${
                        ord.order_type === 'dine_in' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' :
                        ord.order_type === 'takeaway' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400' :
                        ord.order_type === 'delivery' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' :
                        'bg-zinc-100 dark:bg-zinc-800 text-aura-text'
                      }`}>
                        {ord.order_type.replace('_', ' ')}
                      </span>
                      {ord.table_number && (
                        <span className="text-aura-muted ml-1.5 font-mono text-[11px]">T{ord.table_number}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-aura-text font-medium">
                      {ord.customer_name || 'Walk-in'}
                      {ord.customer_phone && (
                        <p className="text-[10px] text-aura-muted font-mono">{ord.customer_phone}</p>
                      )}
                    </td>
                    <td className="p-3.5 text-aura-muted">
                      <span className="font-bold text-aura-text">{ord.items?.length || 1}</span> items
                    </td>
                    <td className="p-3.5 font-black text-aura-text font-mono">{currency}{ord.grand_total?.toFixed(2)}</td>
                    <td className="p-3.5"><StatusBadge status={ord.status} /></td>
                    <td className="p-3.5 text-aura-muted text-[11px]">
                      {elapsed < 1 ? 'Just now' : elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ago`}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="btn-secondary py-1 px-2.5 text-[11px]"
                          title="View Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                        {isActive && onNavigate && (
                          <button
                            onClick={() => onNavigate('kds')}
                            className="btn-ghost py-1 px-2 text-[11px] text-amber-600 dark:text-amber-400"
                            title="View in KDS"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <ClipboardList className="w-8 h-8 text-aura-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-aura-text">No orders match your filters</p>
                    <p className="text-xs text-aura-muted mt-0.5">Try adjusting your search or filter criteria</p>
                    <button onClick={clearFilters} className="btn-secondary mt-3 text-xs">
                      <X className="w-3.5 h-3.5" /> Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="orders"
        />
      </div>

      {/* ── Receipt Modal ───────────────────────────────────────── */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReceiptOrder(null)}>
          <div
            className="w-full max-w-sm glass-card-elevated rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4 text-left font-mono animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center pb-3 border-b border-aura-border space-y-1">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center mx-auto mb-2 font-black text-lg">
                {(tenant?.name || 'N')[0]}
              </div>
              <h3 className="font-extrabold text-base text-aura-text tracking-wider uppercase">
                {tenant?.config?.restaurant_name || 'NOVAFOOD OS'}
              </h3>
              <p className="text-[11px] text-aura-muted">{tenant?.config?.tagline || 'Modern Gastronomy'}</p>
              <p className="text-[10px] text-aura-muted">{tenant?.config?.invoice_footer || 'FSSAI: 10020042000123'}</p>
            </div>

            <div className="text-xs space-y-1.5 text-aura-muted border-b border-aura-border pb-3">
              {[
                ['Receipt #', selectedReceiptOrder.order_number],
                ['Type', selectedReceiptOrder.order_type.replace('_', ' ')],
                ['Table', selectedReceiptOrder.table_number || '—'],
                ['Guest', selectedReceiptOrder.customer_name || 'Walk-in'],
                ['Date', new Date(selectedReceiptOrder.created_at || Date.now()).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}:</span>
                  <span className="text-aura-text font-bold capitalize">{v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-aura-text max-h-40 overflow-y-auto border-b border-aura-border pb-3">
              {selectedReceiptOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between font-mono">
                  <span>{item.quantity}× {item.product_name}</span>
                  <span className="font-bold">{currency}{item.total_price}</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1.5 text-aura-muted">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{currency}{selectedReceiptOrder.subtotal}</span></div>
              <div className="flex justify-between"><span>GST</span><span className="font-mono">{currency}{selectedReceiptOrder.tax_amount}</span></div>
              {(selectedReceiptOrder.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-mono">-{currency}{selectedReceiptOrder.discount_amount}</span></div>
              )}
              <div className="flex justify-between text-base font-extrabold text-aura-text pt-2 border-t border-aura-border">
                <span>Total Paid</span>
                <span className="text-emerald-600 font-mono text-lg">{currency}{selectedReceiptOrder.grand_total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setSelectedReceiptOrder(null)} className="btn-secondary flex-1">Close</button>
              <button
                onClick={() => toCSV(formatOrdersForExport([selectedReceiptOrder], currency), `receipt_${selectedReceiptOrder.order_number}`)}
                className="btn-ghost px-3"
                title="Export receipt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => toPDF(`Receipt #${selectedReceiptOrder.order_number}`)} className="btn-primary flex-1">
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
