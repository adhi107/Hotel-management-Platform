import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Sparkles, Printer, Download,
  Search, Filter, Calendar, ArrowUpRight, Flame, Snowflake, DollarSign,
  ShoppingBag, Clock, Percent, AlertTriangle, CheckCircle2, ChevronRight,
  Utensils, HelpCircle, Layers, Award, Tag, RefreshCw, Eye, Lightbulb,
  FileSpreadsheet, ArrowDownRight, Coffee, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, Cell, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';
import { toCSV, getTodayLabel } from '../../utils/exportUtils';
import { Pagination } from '../../components/Pagination';

interface ReportsViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

type TimeframeType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'all_time';
type ChartViewType = 'day_wise' | 'week_wise' | 'month_wise' | 'peak_hours';

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const currency = tenant?.config?.currency_symbol || '₹';

  // State
  const [timeframe, setTimeframe] = useState<TimeframeType>('this_week');
  const [chartView, setChartView] = useState<ChartViewType>('day_wise');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  // Table Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'most_ordered' | 'least_ordered' | 'high_margin' | 'low_margin'>('all');
  const [sortBy, setSortBy] = useState<'qty_desc' | 'qty_asc' | 'revenue_desc' | 'margin_desc' | 'price_desc'>('qty_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch sales analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales-analytics?timeframe=${timeframe}`);
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  // Extract data sections with fallbacks
  const summary = data?.summary || {
    total_sales: 0,
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    average_order_value: 0,
    total_items_sold: 0,
    gross_profit: 0,
    net_profit: 0,
    profit_margin_pct: 0,
    growth_vs_previous_pct: 12.5,
  };

  const mostOrdered = data?.most_ordered_items || [];
  const leastOrdered = data?.least_ordered_items || [];
  const allItems: any[] = data?.all_items || [];
  const dayWiseSales: any[] = data?.day_wise_sales || [];
  const weekWiseSales: any[] = data?.week_wise_sales || [];
  const monthWiseSales: any[] = data?.month_wise_sales || [];
  const growthInsights: any[] = data?.growth_insights || [];

  // Get list of unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return ['all', ...Array.from(set)];
  }, [allItems]);

  // Filtered and Sorted Items Table
  const filteredItems = useMemo(() => {
    let list = [...allItems];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(it =>
        it.name.toLowerCase().includes(q) ||
        (it.category && it.category.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      list = list.filter(it => it.category === selectedCategory);
    }

    // Performance filter
    if (performanceFilter === 'most_ordered') {
      list = list.filter(it => it.quantity_sold >= 5);
    } else if (performanceFilter === 'least_ordered') {
      list = list.filter(it => it.quantity_sold < 5);
    } else if (performanceFilter === 'high_margin') {
      list = list.filter(it => it.margin_percent >= 70);
    } else if (performanceFilter === 'low_margin') {
      list = list.filter(it => it.margin_percent < 50);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'qty_desc') return b.quantity_sold - a.quantity_sold;
      if (sortBy === 'qty_asc') return a.quantity_sold - b.quantity_sold;
      if (sortBy === 'revenue_desc') return b.total_revenue - a.total_revenue;
      if (sortBy === 'margin_desc') return b.margin_percent - a.margin_percent;
      if (sortBy === 'price_desc') return b.unit_price - a.unit_price;
      return 0;
    });

    return list;
  }, [allItems, searchTerm, selectedCategory, performanceFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, performanceFilter, sortBy]);

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export handlers
  const handleExportCSV = (type: 'items' | 'days' | 'summary') => {
    const today = getTodayLabel();
    if (type === 'items') {
      const exportData = allItems.map((it, idx) => ({
        Rank: idx + 1,
        'Dish Name': it.name,
        Category: it.category,
        'Selling Price': `${currency}${it.unit_price}`,
        'Cost Price': `${currency}${it.cost_price}`,
        'Quantity Sold': it.quantity_sold,
        'Total Sales': `${currency}${it.total_revenue}`,
        'Profit Margin %': `${it.margin_percent}%`,
        'Orders Count': it.orders_count,
      }));
      toCSV(exportData, `dish_sales_report_${timeframe}_${today}`);
    } else if (type === 'days') {
      const exportData = dayWiseSales.map(d => ({
        Date: d.date,
        Day: d.day_name,
        'Total Sales': `${currency}${d.sales}`,
        'Orders Count': d.orders,
        'Average Order Value': `${currency}${d.aov}`,
        'Items Sold': d.items_sold,
      }));
      toCSV(exportData, `daily_sales_trend_${timeframe}_${today}`);
    } else {
      const exportData = [
        { Metric: 'Total Sales Revenue', Value: `${currency}${summary.total_sales}` },
        { Metric: 'Total Orders', Value: summary.total_orders },
        { Metric: 'Completed Orders', Value: summary.completed_orders },
        { Metric: 'Cancelled Orders', Value: summary.cancelled_orders },
        { Metric: 'Average Order Value (AOV)', Value: `${currency}${summary.average_order_value}` },
        { Metric: 'Total Servings Sold', Value: summary.total_items_sold },
        { Metric: 'Estimated Gross Profit', Value: `${currency}${summary.gross_profit}` },
        { Metric: 'Profit Margin %', Value: `${summary.profit_margin_pct}%` },
      ];
      toCSV(exportData, `sales_summary_${timeframe}_${today}`);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* ── Top Header & Controls ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <span>Sales & Business Growth Intelligence</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Real-time sales performance, top & least ordered dishes, day/week/month trends, and profit growth insights.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-default)] shadow-sm">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'Last 7 Days' },
              { id: 'this_month', label: 'Last 30 Days' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'all_time', label: 'All Time' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id as TimeframeType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--color-primary)] shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-xl p-1 z-30 hidden group-hover:block animate-scale-in">
              <button
                onClick={() => handleExportCSV('items')}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-between"
              >
                <span>Dish-wise Sales</span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
              <button
                onClick={() => handleExportCSV('days')}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-between"
              >
                <span>Daily Sales Trend</span>
                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
              <button
                onClick={() => handleExportCSV('summary')}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-between"
              >
                <span>Full Summary KPIs</span>
                <Award className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--border-strong)] shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ── Top Row: Key Sales KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {currency}{summary.total_sales?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-[var(--color-success)] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{summary.growth_vs_previous_pct}%
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Gross Profit:</span>
            <span className="font-bold text-[var(--color-success)]">{currency}{summary.gross_profit?.toLocaleString('en-IN')} ({summary.profit_margin_pct}%)</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {summary.total_orders?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">orders placed</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Completed / Cancelled:</span>
            <span>
              <strong className="text-[var(--color-success)]">{summary.completed_orders}</strong> / <strong className="text-[var(--color-danger)]">{summary.cancelled_orders}</strong>
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {currency}{summary.average_order_value?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">per table/bill</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Tip:</span>
            <span className="font-semibold text-[var(--color-primary)]">Suggest drinks to increase bill</span>
          </div>
        </div>

        {/* Total Servings Sold */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Total Dishes & Drinks Sold</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {summary.total_items_sold?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">servings served</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Catalog Items Tracked:</span>
            <span className="font-bold text-[var(--text-primary)]">{allItems.length} menu dishes</span>
          </div>
        </div>
      </div>

      {/* ── Smart Business Growth Coach (Actionable Insights) ─────────────── */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                Smart Business Growth & Action Coach
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Key data-driven opportunities to increase sales revenue and eliminate wasted food cost.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--bg-app)] border border-[var(--border-default)] text-[var(--text-secondary)]">
            Live AI Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {growthInsights.map((insight: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] space-y-2 hover:border-[var(--color-primary)] transition-all"
            >
              <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5 line-clamp-1">
                {insight.title}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                {insight.description}
              </p>
              <div className="pt-1 border-t border-[var(--border-default)] flex items-center gap-1 text-[11px] font-bold" style={{ color: insight.color || 'var(--color-primary)' }}>
                <span>Action:</span>
                <span className="truncate">{insight.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dual Spotlight: Most Ordered Dishes vs Least Ordered Dishes ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 🔥 Most Ordered Dishes (Top Sellers) */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>Most Ordered Dishes</span>
                  <span className="badge-success text-[10px]">Top Sellers</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Dishes driving the highest customer volume & sales.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('menu')}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {mostOrdered.slice(0, 5).map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] hover:border-[var(--color-success)] transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500 text-white shadow-sm'
                      : idx === 1
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                      : idx === 2
                      ? 'bg-amber-700/80 text-white'
                      : 'bg-[var(--border-default)] text-[var(--text-secondary)]'
                  }`}>
                    #{item.rank || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] font-medium">
                        {item.category}
                      </span>
                      <span>Price: {currency}{item.unit_price}</span>
                      <span className="text-[var(--color-success)] font-semibold">{item.margin_percent}% Profit</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-[var(--text-primary)] block">
                    {item.quantity_sold} <span className="text-[10px] font-semibold text-[var(--text-muted)]">sold</span>
                  </span>
                  <span className="text-[11px] font-bold text-[var(--color-success)]">
                    {currency}{item.total_revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--color-success-light)] border border-[var(--color-success-border)] flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              💡 <strong>Growth Tip:</strong> Ensure kitchen prep stays stocked for these top 5 dishes to prevent out-of-stock delays.
            </span>
          </div>
        </div>

        {/* ❄️ Least Ordered Dishes (Slow Movers) */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center">
                <Snowflake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>Least Ordered Dishes</span>
                  <span className="badge-danger text-[10px]">Action Needed</span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Dishes with zero or lowest demand. Fix or replace to save inventory cost.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('recipes')}
              className="text-xs font-bold text-[var(--color-danger)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Check Cost</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {leastOrdered.slice(0, 5).map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] hover:border-[var(--color-danger)] transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-danger-light)] text-[var(--color-danger)] font-black text-xs flex items-center justify-center shrink-0">
                    #{item.rank || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {item.name}
                      </p>
                      <span className="badge-danger text-[9px] py-0 px-1.5">
                        {item.status_badge || 'Slow'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-danger)] font-medium mt-0.5 truncate">
                      👉 {item.growth_advice || 'Bundle into a combo or replace with popular alternative'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[var(--text-muted)] block">
                    {item.quantity_sold} sold
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    Price: {currency}{item.unit_price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              💡 <strong>Action Tip:</strong> Review raw ingredient expiry for slow-moving items and bundle them into meal deals.
            </span>
          </div>
        </div>

      </div>

      {/* ── Sales Trends: Day-wise, Week-wise, Month-wise Charts ─────────── */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Sales & Order Volume Trends</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Day-by-day, weekly, and monthly breakdown to understand peak revenue cycles.
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-[var(--bg-app)] p-1 rounded-xl border border-[var(--border-default)]">
            {[
              { id: 'day_wise', label: '📅 Day-wise' },
              { id: 'week_wise', label: '📊 Week-wise' },
              { id: 'month_wise', label: '📈 Month-wise' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setChartView(v.id as ChartViewType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartView === v.id
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'day_wise' ? (
              <AreaChart data={dayWiseSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${currency}${v}`} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'sales' ? `${currency}${value?.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Revenue' : 'Orders Count'
                  ]}
                  labelFormatter={(label: any) => `Date: ${label}`}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGradient)" />
                <Line type="monotone" dataKey="orders" name="Order Count" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            ) : chartView === 'week_wise' ? (
              <BarChart data={weekWiseSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="week_label" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${currency}${v}`} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'sales' ? `${currency}${value?.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Sales Revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" name="Total Orders" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={monthWiseSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="month_name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${currency}${v}`} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'sales' ? `${currency}${value?.toLocaleString('en-IN')}` : name === 'profit_est' ? `${currency}${value?.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Sales Revenue' : name === 'profit_est' ? 'Est. Profit' : 'Orders'
                  ]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Gross Revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit_est" name="Net Profit Est." fill="var(--color-success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Day-wise Table Summary List */}
        {chartView === 'day_wise' && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)] font-bold">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Day</th>
                  <th className="py-2 px-3 text-right">Orders</th>
                  <th className="py-2 px-3 text-right">Items Sold</th>
                  <th className="py-2 px-3 text-right">Avg. Order Value</th>
                  <th className="py-2 px-3 text-right">Daily Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {dayWiseSales.slice(-7).map((d, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-app)] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">{d.label}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{d.day_name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[var(--text-primary)]">{d.orders}</td>
                    <td className="py-2.5 px-3 text-right text-[var(--text-secondary)]">{d.items_sold}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[var(--text-primary)]">{currency}{d.aov}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[var(--color-primary)]">{currency}{d.sales?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Complete Dish Performance Table with Search & Smart Filters ── */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Complete Menu Items Performance Ranking</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Search, filter, and analyze sales velocity and profit margins for every item on your menu.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Showing {filteredItems.length} of {allItems.length} items
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dish by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Performance Filter Dropdown */}
          <div>
            <select
              value={performanceFilter}
              onChange={e => setPerformanceFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            >
              <option value="all">All Performance Levels</option>
              <option value="most_ordered">🔥 Most Ordered (5+ sales)</option>
              <option value="least_ordered">❄️ Least Ordered (&lt; 5 sales)</option>
              <option value="high_margin">💰 High Margin (70%+ Profit)</option>
              <option value="low_margin">⚠️ Low Margin (&lt; 50% Profit)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            >
              <option value="qty_desc">Most Ordered First</option>
              <option value="qty_asc">Least Ordered First</option>
              <option value="revenue_desc">Highest Sales Revenue</option>
              <option value="margin_desc">Highest Profit Margin</option>
              <option value="price_desc">Highest Price First</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[var(--text-muted)] shrink-0 mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer capitalize ${
                selectedCategory === cat
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'bg-[var(--bg-app)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-default)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-app)] border-b border-[var(--border-default)] text-[var(--text-muted)] font-bold">
              <tr>
                <th className="py-3 px-4"># Rank</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
                <th className="py-3 px-4 text-right">Profit Margin</th>
                <th className="py-3 px-4 text-center">Status / Advice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] bg-[var(--bg-card)]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--text-muted)]">
                    No dishes matched your search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const actualRank = (currentPage - 1) * pageSize + idx + 1;
                  const isTopSeller = item.quantity_sold >= 8;
                  const isSlowMover = item.quantity_sold <= 1;

                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-app)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--text-muted)]">
                        #{actualRank}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[var(--text-primary)] block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {item.orders_count} orders contained this item
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-default)] text-[10px] font-semibold text-[var(--text-secondary)]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">
                        {currency}{item.unit_price}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--text-muted)]">
                        {currency}{item.cost_price}
                      </td>
                      <td className="py-3 px-4 text-right font-black">
                        <span className={`px-2 py-0.5 rounded-full ${
                          isTopSeller ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' :
                          isSlowMover ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' :
                          'text-[var(--text-primary)]'
                        }`}>
                          {item.quantity_sold} sold
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[var(--color-primary)]">
                        {currency}{item.total_revenue?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={item.margin_percent >= 70 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>
                          {item.margin_percent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isTopSeller ? (
                          <span className="badge-success text-[10px]">🔥 High Demand</span>
                        ) : isSlowMover ? (
                          <span className="badge-danger text-[10px]">❄️ Slow Mover</span>
                        ) : (
                          <span className="badge-info text-[10px]">Consistent</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredItems.length > pageSize && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

    </div>
  );
};
