import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, X, Zap, ChefHat, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('owner@aura.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'cashier' | 'chef' | 'admin'>('owner');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      onClose();
    }
  };

  const setPreset = (role: 'owner' | 'cashier' | 'chef' | 'admin', em: string) => {
    setSelectedRole(role);
    setEmail(em);
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-5 text-zinc-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-base shadow-sm">
              N
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Switch Enterprise Account</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Multi-tenant role-based access control</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1-Click Role Presets */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPreset('owner', 'owner@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedRole === 'owner'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Tenant Owner</span>
                <Building2 className="w-3.5 h-3.5 opacity-70" />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'owner' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                owner@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreset('cashier', 'cashier@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedRole === 'cashier'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">POS Cashier</span>
                <Zap className="w-3.5 h-3.5 opacity-70" />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'cashier' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                cashier@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreset('chef', 'chef@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedRole === 'chef'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Head Chef</span>
                <ChefHat className="w-3.5 h-3.5 opacity-70" />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'chef' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                chef@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreset('admin', 'admin@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedRole === 'admin'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Super Admin</span>
                <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'admin' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                admin@aura.io
              </p>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 mt-1"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
