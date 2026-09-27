import React, { useState } from 'react';
import { Sliders, Sparkles, Building2, Palette, ShieldCheck, CheckCircle2, Check, Store } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { BusinessType, UiMode } from '../../types';
import { useToast } from '../../context/ToastContext';

export const BusinessSettingsView: React.FC = () => {
  const { tenant, uiMode, setUiMode, applyBusinessTemplate, updateBusinessProfile } = useAuthStore();
  const toast = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>(tenant?.business_type || 'Restaurant');
  const [restaurantName, setRestaurantName] = useState(tenant?.name || 'Aura Bistro');
  const [taxPercent, setTaxPercent] = useState<number>(tenant?.config?.tax_percent || 5.0);
  const [features, setFeatures] = useState<Record<string, boolean>>(tenant?.features || {} as any);

  const businessTypes: BusinessType[] = [
    'Restaurant',
    'Cafe',
    'Juice Center',
    'Tea Shop',
    'Coffee Shop',
    'Bakery',
    'Food Stall',
    'Food Truck',
    'Cloud Kitchen',
    'Catering',
    'Tiffin Center',
    'Custom'
  ];

  const handleTemplateApply = async (tName: string) => {
    setSelectedTemplate(tName);
    await applyBusinessTemplate(tName);
    toast.success(`Template '${tName}' applied`, 'Navigation and feature modules automatically configured.');
  };

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveProfile = async () => {
    await updateBusinessProfile(
      selectedTemplate as BusinessType,
      tenant?.business_size || 'small',
      uiMode,
      features
    );
    toast.success('Settings Saved', 'Business profile and feature settings updated.');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-aura-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
            <Sliders className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-aura-text tracking-tight">
            Business Profile & Adaptive Configuration
          </h1>
        </div>
        <p className="text-xs text-aura-muted">
          Customize your food business model, toggle active modules, and customize receipts.
        </p>
      </div>

      {/* 1. Universal Business Templates */}
      <div className="bg-aura-card rounded-3xl p-6 border border-aura-border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-zinc-900 dark:text-white" />
          <h3 className="text-sm font-bold text-aura-text">Business Model Template</h3>
        </div>
        <p className="text-xs text-aura-muted">
          Select your business model to auto-configure appropriate navigation and workflows.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {businessTypes.map(t => (
            <button
              key={t}
              onClick={() => handleTemplateApply(t)}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                selectedTemplate === t
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t}</span>
                {selectedTemplate === t && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. UI Complexity Level */}
      <div className="bg-aura-card rounded-3xl p-6 border border-aura-border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white" />
          <h3 className="text-sm font-bold text-aura-text">UI Complexity & Mode</h3>
        </div>
        <p className="text-xs text-aura-muted">
          Control the density of visible navigation tabs and POS workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setUiMode('simple')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              uiMode === 'simple'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="font-bold text-xs mb-1">Simple (Micro Stall)</div>
            <p className={`text-[11px] leading-relaxed ${uiMode === 'simple' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
              2-Tap Quick Sale, Orders, Customer Khata. Zero clutter.
            </p>
          </button>

          <button
            onClick={() => setUiMode('standard')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              uiMode === 'standard'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="font-bold text-xs mb-1">Standard (Cafe / QSR)</div>
            <p className={`text-[11px] leading-relaxed ${uiMode === 'standard' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Table POS, KDS, Stock, Day Close. Ideal for Cafes.
            </p>
          </button>

          <button
            onClick={() => setUiMode('advanced')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              uiMode === 'advanced'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="font-bold text-xs mb-1">Advanced (Chains)</div>
            <p className={`text-[11px] leading-relaxed ${uiMode === 'advanced' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Multi-branch, Recipe Costing, AI Copilot & Analytics.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Taxes & Store Details */}
      <div className="bg-aura-card rounded-3xl p-6 border border-aura-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-aura-text">Store Name & Tax Percentage</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Restaurant / Store Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">GST / Tax Percentage (%)</label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold font-mono focus:outline-none focus:border-zinc-900 dark:focus:border-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveProfile}
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save Settings & Apply
          </button>
        </div>
      </div>

    </div>
  );
};
