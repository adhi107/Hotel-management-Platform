import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChefHat, Clock, CheckCircle, AlertTriangle, Flame, Coffee, Utensils,
  Activity, BarChart2, Timer, TrendingUp, Bell, RefreshCw, Volume2, VolumeX,
  ChevronRight, Zap, Play
} from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';

/* ── Live elapsed-time hook ──────────────────────────────────────── */
function useElapsed(createdAt: string | undefined, slaTarget: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!createdAt) return;
    const tick = () => {
      try { setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)); }
      catch { setElapsed(0); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const pct = Math.min(100, (elapsed / slaTarget) * 100);
  const isBreached = elapsed > slaTarget;
  const isWarning  = !isBreached && elapsed > slaTarget * 0.7;
  return { m, s, pct, isBreached, isWarning };
}

/* ── Ticket Card ─────────────────────────────────────────────────── */
interface TicketCardProps {
  ticket: Order & { sla_target_seconds?: number };
  onBump:       (id: string) => void;
  onBumpItem:   (orderId: string, itemId: string, cur?: string) => void;
  onComplete:   (id: string) => void;
  position: number;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onBump, onBumpItem, onComplete, position }) => {
  const sla = ticket.sla_target_seconds ?? 1200;
  const { m, s, pct, isBreached, isWarning } = useElapsed(ticket.created_at, sla);

  const readyCount  = ticket.items?.filter(i => i.status === 'ready').length ?? 0;
  const totalItems  = ticket.items?.length ?? 0;
  const allReady    = readyCount === totalItems && totalItems > 0;

  /* Card border/state */
  const cardBorder = isBreached
    ? 'ticket-breach'
    : isWarning
    ? 'ticket-warning'
    : 'ticket-normal rounded-xl';

  /* Timer chip color */
  const timerCls = isBreached
    ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-border)]'
    : isWarning
    ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]'
    : 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-border)]';

  /* Order type label */
  const typeColors: Record<string, string> = {
    dine_in:    'badge-info',
    takeaway:   'badge-neutral',
    delivery:   'badge-warning',
    quick_sale: 'badge-neutral',
    qr_order:   'badge-neutral',
  };

  return (
    <div className={`bg-[var(--bg-surface)] rounded-xl flex flex-col overflow-hidden ${cardBorder}`}>

      {/* Timer Progress Bar — fills up as time passes */}
      <div className="h-1 w-full bg-[var(--color-neutral-light)] dark:bg-[var(--border-medium)] flex-shrink-0">
        <div
          style={{ width: `${pct}%`, transition: 'width 1s linear' }}
          className={`h-full ${
            isBreached ? 'bg-[var(--color-danger)]' :
            isWarning  ? 'bg-[var(--color-warning)]' :
                         'bg-[var(--color-primary)]'
          }`}
        />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[var(--text-primary)] text-sm">
                #{ticket.order_number}
              </span>
              <span className={typeColors[ticket.order_type] ?? 'badge-neutral'}>
                {ticket.order_type?.replace('_', ' ')}
              </span>
              {isBreached && (
                <span className="badge-danger flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                </span>
              )}
              {position === 1 && !isBreached && (
                <span className="badge-warning">Priority</span>
              )}
            </div>
            {ticket.table_number && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Table {ticket.table_number}</p>
            )}
            {ticket.customer_name && (
              <p className="text-xs text-[var(--text-muted)] truncate max-w-[140px]">{ticket.customer_name}</p>
            )}
          </div>

          {/* Timer */}
          <div className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg border text-center flex-shrink-0 ${timerCls}`}>
            <div className="flex items-center gap-1 font-mono font-bold text-sm">
              {isBreached && <AlertTriangle className="w-3 h-3" />}
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-75">
              {isBreached ? '⚠ LATE ORDER' : isWarning ? 'RUNNING LATE' : 'ON TIME'}
            </span>
          </div>
        </div>

        {/* ── Item Progress Bar ── */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Items</span>
            <span className={`text-[11px] font-semibold ${
              allReady ? 'text-[var(--color-success)]' : 'text-[var(--text-secondary)]'
            }`}>
              {readyCount} / {totalItems} ready
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-neutral-light)] dark:bg-[var(--border-medium)] overflow-hidden">
            <div
              style={{ width: totalItems > 0 ? `${(readyCount / totalItems) * 100}%` : '0%', transition: 'width 0.4s ease' }}
              className="h-full rounded-full bg-[var(--color-success)]"
            />
          </div>
        </div>

        {/* ── Item List ── */}
        <div className="space-y-1 flex-1">
          {ticket.items?.map(item => {
            const done = item.status === 'ready';
            return (
              <button
                key={item.id}
                onClick={() => onBumpItem(ticket.id, item.id, item.status)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                  done
                    ? 'bg-[var(--color-success-light)] border-[var(--color-success-border)] text-[var(--color-success)]'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    done
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-neutral-light)] dark:bg-[var(--border-medium)] text-[var(--text-secondary)]'
                  }`}>
                    {done ? '✓' : item.quantity}
                  </span>
                  <span className={`font-medium truncate ${done ? 'line-through opacity-75' : ''}`}>
                    {item.product_name}
                  </span>
                  {(item as any).notes && (
                    <span className="text-[10px] font-semibold bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-border)] px-1.5 py-0.5 rounded flex-shrink-0">
                      {(item as any).notes}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${
                  done ? 'text-[var(--color-success)]' : 'text-[var(--text-faint)]'
                }`}>
                  {done ? 'Done' : item.status || 'Prep'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2 pt-1 border-t border-[var(--border-subtle)]">
          {allReady ? (
            <button
              onClick={() => onComplete(ticket.id)}
              className="btn-success flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Order Ready — Serve Now
            </button>
          ) : (
            <>
              <button
                onClick={() => onBump(ticket.id)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Mark All as Done
              </button>
              <button
                onClick={() => onBumpItem(ticket.id, '', 'start')}
                className="btn-ghost px-3"
                title="Start preparing this order"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Analytics strip ─────────────────────────────────────────────── */
interface KitchenAnalytics {
  active_tickets: number; preparing_count: number; ready_count: number;
  completed_today: number; avg_prep_minutes: number; sla_breach_count: number;
  sla_compliance_pct: number; station_loads: Record<string, number>;
}

/* ── Main KDS View ───────────────────────────────────────────────── */
export const KdsView: React.FC = () => {
  const [tickets,       setTickets]       = useState<Order[]>([]);
  const [analytics,     setAnalytics]     = useState<KitchenAnalytics | null>(null);
  const [rushStatus,    setRushStatus]    = useState<any>(null);
  const [station,       setStation]       = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [soundOn,       setSoundOn]       = useState(false);
  const [autoRefresh,   setAutoRefresh]   = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [lastUpdate,    setLastUpdate]    = useState(new Date());
  const prevCount = useRef(0);

  const fetchAll = useCallback(async () => {
    try {
      const [tRes, aRes, rRes] = await Promise.all([
        api.get(`/kitchen/tickets?station=${station}`),
        api.get('/kitchen/analytics'),
        api.get('/kitchen/rush-status'),
      ]);
      const newTickets = tRes.data.data ?? [];

      // Audible new-order alert
      if (soundOn && newTickets.length > prevCount.current && prevCount.current > 0) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.frequency.value = 880;
          g.gain.setValueAtTime(0.25, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }
      prevCount.current = newTickets.length;
      setTickets(newTickets);
      setAnalytics(aRes.data.data);
      setRushStatus(rRes.data.data);
      setLastUpdate(new Date());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [station, soundOn]);

  useEffect(() => { fetchAll(); }, [station]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
  }, [fetchAll, autoRefresh]);

  const handleUpdateStatus = async (id: string, s: string) => {
    try { await api.patch(`/kitchen/tickets/${id}/status?status=${s}`); fetchAll(); } catch {}
  };
  const handleBumpItem = async (oId: string, iId: string, cur?: string) => {
    if (!iId) return;
    const next = cur === 'ready' ? 'preparing' : 'ready';
    try { await api.patch(`/kitchen/tickets/${oId}/items/${iId}/status?status=${next}`); fetchAll(); } catch {}
  };
  const handleBump = async (id: string) => {
    try { await api.post(`/kitchen/tickets/${id}/bump`); fetchAll(); } catch {}
  };

  const stations = [
    { id: 'all',     label: 'All Stations', icon: ChefHat },
    { id: 'Kitchen', label: 'Kitchen',      icon: Flame },
    { id: 'Grill',   label: 'Grill',        icon: Utensils },
    { id: 'Bar',     label: 'Bar',          icon: Coffee },
  ];

  const breachCount = tickets.filter(t => {
    const sla = (t as any).sla_target_seconds ?? 1200;
    const el  = t.created_at ? (Date.now() - new Date(t.created_at).getTime()) / 1000 : 0;
    return el > sla;
  }).length;

  const rushColors: Record<string, string> = {
    idle:     'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-border)]',
    light:    'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]',
    moderate: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
    busy:     'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
    rush:     'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-border)]',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">

      {/* ── Control Bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 py-3 space-y-3">

        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--text-primary)] leading-none">
                Kitchen Display System
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                Live · {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Rush badge */}
            {rushStatus && (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                rushColors[rushStatus.level] ?? rushColors.idle
              } ${rushStatus.level === 'rush' ? 'animate-pulse' : ''}`}>
                <Activity className="w-3.5 h-3.5" />
                {rushStatus.label}
              </span>
            )}

            {/* Breach alert */}
            {breachCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-border)] animate-pulse">
                <Bell className="w-3.5 h-3.5" />
                {breachCount} SLA {breachCount === 1 ? 'Breach' : 'Breaches'}
              </span>
            )}

            {/* Sound */}
            <button
              onClick={() => setSoundOn(!soundOn)}
              title={soundOn ? 'Mute alerts' : 'Enable sound alerts'}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                soundOn
                  ? 'bg-[var(--color-primary)] border-transparent text-white'
                  : 'border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)]'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Auto-refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Pause refresh' : 'Resume auto-refresh'}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                autoRefresh
                  ? 'bg-[var(--color-success)] border-transparent text-white'
                  : 'border-[var(--border-medium)] text-[var(--text-muted)] bg-[var(--bg-surface)]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </button>

            {/* Analytics */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showAnalytics
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]'
                  : 'border-[var(--border-medium)] text-[var(--text-muted)] bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </div>

        {/* Row 2 — Station selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {stations.map(st => {
            const Icon = st.icon;
            const load = analytics?.station_loads?.[st.id] ?? 0;
            const active = station === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStation(st.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium flex-shrink-0 transition-all ${
                  active
                    ? 'bg-[var(--color-primary)] text-white border-transparent'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {st.label}
                {st.id !== 'all' && load > 0 && (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none ${
                    active ? 'bg-white/20 text-white' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                  }`}>
                    {load}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Analytics Strip ──────────────────────────────────────── */}
      {showAnalytics && analytics && (
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] px-4 py-2.5">
          <div className="flex items-center gap-3 overflow-x-auto">
            {[
              { label: 'Open Orders',    value: analytics.active_tickets,    color: 'text-[var(--color-primary)]',  bg: 'bg-[var(--color-primary-light)]',  icon: Activity },
              { label: 'Being Cooked',   value: analytics.preparing_count,   color: 'text-[var(--color-warning)]',  bg: 'bg-[var(--color-warning-light)]',  icon: Flame },
              { label: 'Ready to Serve', value: analytics.ready_count,       color: 'text-[var(--color-success)]',  bg: 'bg-[var(--color-success-light)]',  icon: CheckCircle },
              { label: 'Done Today',     value: analytics.completed_today,   color: 'text-[var(--color-primary)]',  bg: 'bg-[var(--color-primary-light)]',  icon: TrendingUp },
              { label: 'Avg Cook Time',  value: `${analytics.avg_prep_minutes}m`, color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--color-neutral-light)]', icon: Timer },
              {
                label: 'Late Orders',
                value: analytics.sla_breach_count,
                color: analytics.sla_breach_count > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]',
                bg:    analytics.sla_breach_count > 0 ? 'bg-[var(--color-danger-light)]' : 'bg-[var(--color-success-light)]',
                icon: AlertTriangle
              },
              { label: 'On-Time Rate',   value: `${analytics.sla_compliance_pct}%`, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-light)]', icon: BarChart2 },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0 ${s.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <div>
                    <p className={`text-sm font-bold tabular-nums leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Ticket Grid ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-64 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-success-light)] flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8 text-[var(--color-success)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Kitchen Display Clear</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
              All tickets fulfilled.
              {analytics?.completed_today ? ` ${analytics.completed_today} orders completed today.` : ''}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-screen-2xl mx-auto">
            {tickets.map((ticket, idx) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket as any}
                position={idx + 1}
                onBump={handleBump}
                onBumpItem={handleBumpItem}
                onComplete={id => handleUpdateStatus(id, 'completed')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
