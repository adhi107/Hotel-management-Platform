import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  QrCode, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  Receipt, 
  FileText,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';

interface DayCloseViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const DayCloseView: React.FC<DayCloseViewProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [openingCashFloat, setOpeningCashFloat] = useState<number>(2000);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closedResult, setClosedResult] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/day-close/summary');
      setSummary(res.data.data);
      if (res.data.data?.expected_cash) {
        setActualCashCounted(res.data.data.expected_cash + 2000);
      }
    } catch (err) {
      console.error('Failed to load day close summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const currency = tenant?.config?.currency_symbol || '₹';
  const expectedTotalCash = (summary?.expected_cash || 0) + openingCashFloat;
  const cashDiscrepancy = actualCashCounted - expectedTotalCash;

  const handleExecuteDayClose = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/day-close/close', {
        business_date: summary?.business_date || new Date().toISOString().split('T')[0],
        actual_cash_counted: actualCashCounted,
        opening_cash_float: openingCashFloat,
        notes: notes || 'Daily closing verified by Manager.'
      });
      setClosedResult(res.data.data);
      alert('Business day successfully closed and reconciled!');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Day Close failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-aura-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-aura-text tracking-tight">
                Daily Business Closing & Reconciliation
              </h1>
              <p className="text-xs text-aura-muted mt-0.5">
                Reconcile shift revenues, register cash drawers, verify UPI / Card settlements, and lock the register day.
              </p>
            </div>
          </div>
        </div>

        {summary?.business_date && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-aura-card border border-aura-border text-xs font-mono font-bold text-aura-text">
            <Calendar className="w-3.5 h-3.5 text-aura-muted" />
            <span>Date: {summary.business_date}</span>
          </div>
        )}
      </div>

      {/* Clickable Revenue Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* Cash Sales */}
        <div 
          onClick={() => onNavigate && onNavigate('orders')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-aura-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Cash Sales
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-aura-text font-mono">{currency}{summary?.cash_sales?.toLocaleString() || 0}</p>
          <span className="text-[10px] text-aura-muted mt-1 block">Click to view cash orders →</span>
        </div>

        {/* UPI Sales */}
        <div 
          onClick={() => onNavigate && onNavigate('orders')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-aura-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" /> UPI Sales
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-aura-text font-mono">{currency}{summary?.upi_sales?.toLocaleString() || 0}</p>
          <span className="text-[10px] text-aura-muted mt-1 block">Click to inspect digital receipts →</span>
        </div>

        {/* Card Sales */}
        <div 
          onClick={() => onNavigate && onNavigate('orders')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-aura-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Card Sales
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-aura-text font-mono">{currency}{summary?.card_sales?.toLocaleString() || 0}</p>
          <span className="text-[10px] text-aura-muted mt-1 block">Click to verify POS slip logs →</span>
        </div>

        {/* Khata Sales */}
        <div 
          onClick={() => onNavigate && onNavigate('crm-khata')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-aura-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Khata (Credit)
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-aura-text font-mono">{currency}{summary?.khata_sales?.toLocaleString() || 0}</p>
          <span className="text-[10px] text-aura-muted mt-1 block">Click to open customer tabs →</span>
        </div>
      </div>

      {/* Cash Drawer Reconciliation Box */}
      <div className="glass-card-elevated rounded-2xl p-6 border border-aura-border space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-aura-border">
          <h3 className="font-extrabold text-base text-aura-text flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Physical Cash Drawer Count & Discrepancy Reconciliation</span>
          </h3>
          <span className="text-xs text-aura-muted">Till Balance Check</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-aura-text mb-1.5 block">
              Opening Cash Float (Morning Buffer) ({currency})
            </label>
            <input
              type="number"
              value={openingCashFloat}
              onChange={(e) => setOpeningCashFloat(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-base text-aura-text font-black font-mono focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-aura-text mb-1.5 block">
              Actual Physical Cash Counted in Till ({currency})
            </label>
            <input
              type="number"
              value={actualCashCounted}
              onChange={(e) => setActualCashCounted(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-base text-aura-text font-black font-mono focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>
        </div>

        {/* Calculation Table */}
        <div className="p-4 rounded-xl bg-aura-bg border border-aura-border text-xs space-y-2.5">
          <div className="flex justify-between text-aura-secondary font-medium">
            <span>Expected Cash (Cash Sales + Opening Float)</span>
            <span className="font-bold text-aura-text font-mono text-sm">{currency}{expectedTotalCash}</span>
          </div>
          <div className="flex justify-between text-aura-secondary font-medium">
            <span>Actual Counted Cash in Till</span>
            <span className="font-bold text-aura-text font-mono text-sm">{currency}{actualCashCounted}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-sm pt-2.5 border-t border-aura-border">
            <span className="text-aura-text">Discrepancy (Overage / Shortage)</span>
            <span className={`font-mono text-base font-black px-2.5 py-0.5 rounded-lg ${
              cashDiscrepancy === 0 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                : (cashDiscrepancy > 0 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800')
            }`}>
              {cashDiscrepancy === 0 ? '✓ Balanced (₹0)' : (cashDiscrepancy > 0 ? `+${currency}${cashDiscrepancy} (Overage)` : `${currency}${cashDiscrepancy} (Shortage)`)}
            </span>
          </div>
        </div>

        {/* Closing Notes */}
        <div>
          <label className="text-xs font-bold text-aura-text mb-1.5 block">Closing Notes & Manager Sign-off</label>
          <textarea
            rows={2}
            placeholder="e.g. Evening shift cash hand-over complete. All kitchen inventory logs verified."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none"
          />
        </div>

        {/* Submit Day Close */}
        <button
          onClick={handleExecuteDayClose}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span>Execute Daily Close & Generate Official Summary</span>
        </button>
      </div>
    </div>
  );
};
