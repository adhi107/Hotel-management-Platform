import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, X, Info } from 'lucide-react';
import api from '../../services/api';
import { SmartAlert } from '../../types';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg glass-card-elevated rounded-2xl border border-aura-border shadow-2xl flex flex-col max-h-[500px] overflow-hidden">
        <div className="p-4 border-b border-aura-border flex items-center justify-between bg-aura-dark/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-aura-amber/20 border border-aura-amber/40 text-aura-amber flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Smart Alert Center</h3>
              <p className="text-[11px] text-aura-muted">Operational thresholds, low stock, and SLA warnings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-aura-muted hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length > 0 ? (
            alerts.map(a => (
              <div
                key={a.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  a.severity === 'critical'
                    ? 'bg-aura-rose/10 border-aura-rose/30 text-aura-rose'
                    : a.severity === 'warning'
                    ? 'bg-aura-amber/10 border-aura-amber/30 text-aura-amber'
                    : 'bg-aura-blue/10 border-aura-blue/30 text-aura-blue'
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{a.title}</span>
                  </h4>
                  <p className="text-aura-muted text-[11px] leading-relaxed">{a.message}</p>
                </div>
                <button
                  onClick={() => handleResolve(a.id)}
                  className="px-2.5 py-1 rounded-lg bg-aura-dark hover:bg-aura-emerald hover:text-white border border-aura-border text-aura-muted text-[10px] font-bold shrink-0 transition-colors"
                >
                  Resolve
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-aura-muted">
              <CheckCircle2 className="w-10 h-10 text-aura-emerald/60 mx-auto mb-2" />
              <p className="text-white font-bold">All Operational Alerts Resolved</p>
              <p className="text-[11px] text-aura-muted mt-1">Inventory stocks and kitchen ticket SLAs are operating within target buffers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
