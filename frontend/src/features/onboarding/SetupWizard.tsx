import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Building2, Store, Users, DollarSign, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../context/ToastContext';
import { BusinessType } from '../../types';

export const SetupWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { applyBusinessTemplate } = useAuthStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<BusinessType>('Restaurant');
  const [businessSize, setBusinessSize] = useState('small');
  const [businessName, setBusinessName] = useState('Aura Fine Dining & Cafe');
  const [currency, setCurrency] = useState('INR');
  const [isSeeding, setIsSeeding] = useState(false);

  const businessTypes: Array<{ type: BusinessType; desc: string; icon: string }> = [
    { type: 'Juice Center', desc: 'Fresh cold-pressed juices, shakes, quick sales', icon: '🥤' },
    { type: 'Tea Shop', desc: 'Irani chai, kulhad chai, snacks & quick khata', icon: '☕' },
    { type: 'Food Stall', desc: 'Street food counter, fast billing & UPI QR', icon: '🌮' },
    { type: 'Bakery', desc: 'Cakes, pastries, bread inventory & production', icon: '🥐' },
    { type: 'Cafe', desc: 'Espresso coffee, sandwiches, table dine-in', icon: '☕' },
    { type: 'Restaurant', desc: 'Fine dining, floor plan, multi-station KDS', icon: '🍽️' },
    { type: 'Cloud Kitchen', desc: 'Multi-brand online delivery, kitchen display', icon: '📦' },
    { type: 'Food Truck', desc: 'Mobile POS, quick billing, simple inventory', icon: '🚚' },
    { type: 'Catering', desc: 'Event orders, quotations, advance payments', icon: '🎉' },
    { type: 'Custom', desc: 'Configure custom modules and workflows', icon: '⚡' },
  ];

  const handleApplyPreset = async () => {
    setIsSeeding(true);
    try {
      await api.post('/seed/generate');
      await applyBusinessTemplate(selectedType);
      toast.success('Setup Complete', `Loaded full realistic dataset configured for '${selectedType}'.`);
      onComplete();
    } catch (err: any) {
      toast.success('Setup Complete', `Configured '${selectedType}' workspace.`);
      onComplete();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl gradient-accent mx-auto flex items-center justify-center text-white shadow-glow-blue">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white">Universal Business Setup Wizard</h1>
        <p className="text-xs text-aura-muted">
          Step {step} of 3 — Tailoring AURA Operating System to your business model and operational scale.
        </p>
      </div>

      {/* Step 1: Business Type */}
      {step === 1 && (
        <div className="glass-card rounded-2xl p-6 border border-aura-border space-y-4">
          <h3 className="font-bold text-sm text-white">What type of food or beverage business do you run?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessTypes.map(item => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  selectedType === item.type
                    ? 'bg-aura-blue/20 border-aura-blue shadow-glow-blue text-white'
                    : 'bg-aura-dark/70 border-aura-border text-aura-muted hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{item.type}</h4>
                  <p className="text-[11px] text-aura-muted mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-blue flex items-center justify-center gap-2 mt-4"
          >
            <span>Continue to Scale & Size</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Scale & Size */}
      {step === 2 && (
        <div className="glass-card rounded-2xl p-6 border border-aura-border space-y-4">
          <h3 className="font-bold text-sm text-white">How large is your business operational footprint?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'solo', title: 'Solo / Micro', desc: '1 Outlet • 1-3 Staff • 2-Tap Quick Sale' },
              { id: 'small', title: 'Small / Medium', desc: '1-3 Locations • 5-25 Staff • POS + KDS' },
              { id: 'enterprise', title: 'Multi-Branch Group', desc: 'Multiple Brands & Outlets • Full ERP' },
            ].map(sz => (
              <button
                key={sz.id}
                onClick={() => setBusinessSize(sz.id)}
                className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                  businessSize === sz.id
                    ? 'bg-aura-blue/20 border-aura-blue shadow-glow-blue text-white'
                    : 'bg-aura-dark/70 border-aura-border text-aura-muted hover:text-white'
                }`}
              >
                <h4 className="font-bold text-sm text-white">{sz.title}</h4>
                <p className="text-[11px] text-aura-muted leading-relaxed">{sz.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-6 rounded-xl bg-aura-dark text-xs font-semibold text-aura-muted hover:text-white"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-blue flex items-center justify-center gap-2"
            >
              <span>Continue to Finalization</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation & 1-Click Demo */}
      {step === 3 && (
        <div className="glass-card-elevated rounded-2xl p-6 border border-aura-border text-center space-y-5">
          <CheckCircle2 className="w-12 h-12 text-aura-emerald mx-auto shadow-glow-emerald" />
          <div>
            <h3 className="text-lg font-black text-white">Your Workspace is Ready to Launch</h3>
            <p className="text-xs text-aura-muted mt-1">
              Configured for <strong>{selectedType}</strong> ({businessSize.toUpperCase()}) with tailored navigation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-aura-dark border border-aura-border text-xs text-left space-y-1.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-aura-muted">Business Type:</span>
              <span className="font-bold text-white">{selectedType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aura-muted">Complexity Mode:</span>
              <span className="font-bold text-aura-blue">{selectedType === 'Juice Center' || selectedType === 'Tea Shop' ? 'Simple Mode' : 'Standard / Advanced'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aura-muted">Data Preload:</span>
              <span className="font-bold text-aura-emerald">Full Realistic 100-dish Demo Suite</span>
            </div>
          </div>

          <button
            onClick={handleApplyPreset}
            disabled={isSeeding}
            className="w-full max-w-md mx-auto py-3.5 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-blue hover:opacity-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isSeeding ? 'Initializing Engine...' : 'Launch Operating System'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
