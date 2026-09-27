import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Zap, 
  ChefHat, 
  Eye, 
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('owner@aura.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'cashier' | 'chef' | 'admin'>('owner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const selectPreset = (role: 'owner' | 'cashier' | 'chef' | 'admin', em: string) => {
    setSelectedRole(role);
    setEmail(em);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen w-screen bg-[#F4F4F5] dark:bg-[#09090B] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* Clean Single Minimal Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Simple Brand Header: Logo with Name Only */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-xl shadow-md">
            N
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              NOVAFOOD OS
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Sign in to your food & beverage workspace
            </p>
          </div>
        </div>

        {/* Error Alert Toast */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Fast Role Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Password: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectPreset('owner', 'owner@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'owner'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Tenant Owner</span>
                <Building2 className={`w-3.5 h-3.5 ${selectedRole === 'owner' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'owner' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                owner@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('cashier', 'cashier@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'cashier'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">POS Cashier</span>
                <Zap className={`w-3.5 h-3.5 ${selectedRole === 'cashier' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'cashier' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                cashier@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('chef', 'chef@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'chef'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Head Chef</span>
                <ChefHat className={`w-3.5 h-3.5 ${selectedRole === 'chef' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'chef' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                chef@aura.io
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('admin', 'admin@aura.io')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Super Admin</span>
                <ShieldCheck className={`w-3.5 h-3.5 ${selectedRole === 'admin' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${selectedRole === 'admin' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                admin@aura.io
              </p>
            </button>
          </div>
        </div>

        {/* Credential Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:bg-white text-xs transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Password
              </label>
              <span className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:bg-white text-xs font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
