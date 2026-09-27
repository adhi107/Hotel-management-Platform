import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Plus, Phone, MessageSquare, IndianRupee, ArrowDownRight, ArrowUpRight, Search, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { KhataRecord, Customer } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';
import { Pagination } from '../../components/Pagination';

interface CrmKhataViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const CrmKhataView: React.FC<CrmKhataViewProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'khata' | 'customers'>('khata');
  const [khataList, setKhataList] = useState<KhataRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedKhata, setSelectedKhata] = useState<KhataRecord | null>(null);
  const [entryAmount, setEntryAmount] = useState<number>(0);
  const [entryType, setEntryType] = useState<'payment' | 'credit'>('payment');
  const [entryNotes, setEntryNotes] = useState('');
  const [search, setSearch] = useState('');

  // Pagination states
  const [khataPage, setKhataPage] = useState(1);
  const [khataPageSize, setKhataPageSize] = useState(6);

  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(10);

  const fetchData = async () => {
    try {
      const [kRes, cRes] = await Promise.all([
        api.get('/crm/khata'),
        api.get('/crm/customers')
      ]);
      setKhataList(kRes.data.data || []);
      setCustomers(cRes.data.data || []);
    } catch (err) {
      console.error('CRM fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currency = tenant?.config?.currency_symbol || '₹';

  const totalOutstanding = khataList.reduce((sum, k) => sum + (k.current_balance > 0 ? k.current_balance : 0), 0);
  const totalCollections = khataList.reduce((sum, k) => sum + k.total_paid, 0);

  const handleAddKhataEntry = async () => {
    if (!selectedKhata || entryAmount <= 0) return;
    try {
      await api.post('/crm/khata/entry', {
        customer_id: selectedKhata.customer_id,
        entry_type: entryType,
        amount: entryAmount,
        payment_mode: 'upi',
        description: entryNotes || (entryType === 'payment' ? 'Payment received' : 'Credit purchase')
      });
      setEntryAmount(0);
      setEntryNotes('');
      fetchData();
      alert('Khata transaction recorded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Khata update failed');
    }
  };

  const [customerSearch, setCustomerSearch] = useState('');

  const filteredKhata = khataList.filter(k => k.customer_name.toLowerCase().includes(search.toLowerCase()) || k.customer_phone.includes(search));
  const paginatedKhata = filteredKhata.slice((khataPage - 1) * khataPageSize, khataPage * khataPageSize);

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch));
  const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * customerPageSize, customerPage * customerPageSize);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-aura-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-aura-text tracking-tight flex items-center gap-2">
                <span>Customer CRM & Khata (Credit Ledger)</span>
              </h1>
              <p className="text-xs text-aura-muted mt-0.5">
                Customer profiles, loyalty tiers and traditional Indian food business credit ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-aura-card p-1 rounded-xl border border-aura-border">
          <button
            onClick={() => setActiveTab('khata')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'khata'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'text-aura-muted hover:text-aura-text'
            }`}
          >
            Khata Credit Ledger ({khataList.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'text-aura-muted hover:text-aura-text'
            }`}
          >
            All Customers ({customers.length})
          </button>
        </div>
      </div>

      {/* KPI Cards for Khata */}
      {activeTab === 'khata' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setSearch('')}
            className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-aura-muted mb-1">
              <span className="font-semibold">Total Outstanding Credit Due</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{currency}{totalOutstanding.toLocaleString()}</h3>
            <p className="text-[11px] text-aura-muted mt-1">To be collected from regular customers</p>
          </div>
          <div 
            onClick={() => onNavigate && onNavigate('day-close')}
            className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-aura-muted mb-1">
              <span className="font-semibold">Total Khata Collections</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{currency}{totalCollections.toLocaleString()}</h3>
            <p className="text-[11px] text-aura-muted mt-1">Settled via UPI / Cash (Click for Day Close →)</p>
          </div>
          <div 
            onClick={() => setActiveTab('customers')}
            className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-aura-muted mb-1">
              <span className="font-semibold">Active Khata Accounts</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-2xl font-black text-aura-text font-mono">{khataList.length} Accounts</h3>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">Click to view all profiles →</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'khata' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Khata Accounts List */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-aura-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-aura-text">Khata Customers</h3>
              <input
                type="text"
                placeholder="Search by name or mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setKhataPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
              />
            </div>

            <div className="space-y-2.5">
              {paginatedKhata.length > 0 ? (
                paginatedKhata.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKhata(k)}
                    className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                      selectedKhata?.id === k.id
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-white shadow-sm ring-1 ring-zinc-900/10'
                        : 'bg-aura-card border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-aura-text">{k.customer_name}</h4>
                      <p className="text-xs text-aura-muted flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-aura-muted" /> {k.customer_phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-aura-muted">Balance Due</p>
                      <p className={`text-base font-black font-mono ${k.current_balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {currency}{k.current_balance}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-aura-muted text-xs">
                  No Khata accounts match your search.
                </div>
              )}
            </div>

            {/* Pagination for Khata */}
            {filteredKhata.length > 0 && (
              <div className="pt-2 border-t border-aura-border">
                <Pagination
                  currentPage={khataPage}
                  totalItems={filteredKhata.length}
                  pageSize={khataPageSize}
                  onPageChange={setKhataPage}
                  onPageSizeChange={(sz) => {
                    setKhataPageSize(sz);
                    setKhataPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            )}
          </div>

          {/* Account Ledger Details & Settlement Panel */}
          <div className="glass-card rounded-2xl p-5 border border-aura-border space-y-4 flex flex-col justify-between">
            {selectedKhata ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-aura-border">
                  <h3 className="font-extrabold text-base text-aura-text">{selectedKhata.customer_name}</h3>
                  <p className="text-xs text-aura-muted">{selectedKhata.customer_phone}</p>
                  <div className="mt-2 p-2.5 rounded-xl bg-aura-bg border border-aura-border flex justify-between items-center">
                    <span className="text-xs text-aura-secondary font-medium">Current Balance</span>
                    <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">{currency}{selectedKhata.current_balance}</span>
                  </div>
                </div>

                {/* Entry Action Form */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEntryType('payment')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        entryType === 'payment'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-aura-bg text-aura-muted border-aura-border'
                      }`}
                    >
                      Receive Payment
                    </button>
                    <button
                      onClick={() => setEntryType('credit')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        entryType === 'credit'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-aura-bg text-aura-muted border-aura-border'
                      }`}
                    >
                      Give Credit (Udhar)
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={entryAmount || ''}
                    onChange={(e) => setEntryAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-sm text-aura-text font-bold font-mono placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  />

                  <input
                    type="text"
                    placeholder="Notes (e.g. GPay / Cash paid)"
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  />

                  <button
                    onClick={handleAddKhataEntry}
                    disabled={entryAmount <= 0}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40"
                  >
                    Record Transaction
                  </button>
                </div>

                {/* Recent Transaction Log */}
                <div className="space-y-2 pt-2 border-t border-aura-border max-h-40 overflow-y-auto">
                  <p className="text-[11px] font-bold text-aura-muted uppercase">Recent Transactions</p>
                  {selectedKhata.entries?.slice(-4).map(e => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-aura-bg border border-aura-border text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-aura-text">{e.description}</p>
                        <p className="text-[10px] text-aura-muted">{new Date(e.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-mono font-black ${e.entry_type === 'payment' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {e.entry_type === 'payment' ? '-' : '+'}{currency}{e.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-aura-muted text-center">
                <BookOpen className="w-10 h-10 text-aura-muted/40 mb-2" />
                <p className="text-xs font-medium">Select a customer account to view ledger & record payments.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Customers CRM List */
        <div className="glass-card rounded-2xl p-5 border border-aura-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-aura-border">
            <div>
              <h3 className="text-sm font-extrabold text-aura-text">Customer Directory</h3>
              <p className="text-xs text-aura-muted">Profiles, visit counts, and lifetime value analytics</p>
            </div>
            <input
              type="text"
              placeholder="Search customer by name or phone..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCustomerPage(1);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-aura-border text-aura-muted uppercase text-[10px] tracking-wider font-bold">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Loyalty Tier</th>
                  <th className="pb-3">Total Visits</th>
                  <th className="pb-3">Total Spent</th>
                  <th className="pb-3">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-border/40">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 font-bold text-aura-text">{c.name}</td>
                      <td className="py-3 text-aura-muted font-mono">{c.phone}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3 text-aura-text font-medium font-mono">{c.total_visits || 1}</td>
                      <td className="py-3 text-aura-text font-black font-mono">{currency}{c.total_spent?.toLocaleString() || '0'}</td>
                      <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold font-mono">{c.loyalty_points || 50} pts</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-aura-muted text-xs">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for CRM Customers */}
          {filteredCustomers.length > 0 && (
            <div className="pt-2 border-t border-aura-border">
              <Pagination
                currentPage={customerPage}
                totalItems={filteredCustomers.length}
                pageSize={customerPageSize}
                onPageChange={setCustomerPage}
                onPageSizeChange={(sz) => {
                  setCustomerPageSize(sz);
                  setCustomerPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
