import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Search,
  RotateCcw,
  X,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Layers,
  History,
  Sparkles,
  RefreshCw,
  FileText,
  BarChart3,
  ChefHat,
  ShoppingCart,
  ShieldAlert,
  Edit3,
  Sliders,
  Download,
  Zap,
  Check,
  Boxes,
  Flame,
  UtensilsCrossed,
  ArrowRight,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import api from '../../services/api';
import { realtimeWS } from '../../services/websocket';
import { Ingredient, InventoryTransaction, InventoryAnalytics, ReorderSuggestion } from '../../types';
import { useAuthStore } from '../../stores/authStore';

import { ActiveTab } from '../../components/Sidebar';
import { Pagination } from '../../components/Pagination';

interface InventoryViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigate }) => {
  const { tenant, user } = useAuthStore();
  const currency = tenant?.config?.currency_symbol || '₹';

  // State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [reorders, setReorders] = useState<ReorderSuggestion[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'ledger' | 'wastage' | 'reorder'>('stock');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination states for all tabs
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);

  const [recipePage, setRecipePage] = useState(1);
  const [recipePageSize, setRecipePageSize] = useState(10);

  const [reorderPage, setReorderPage] = useState(1);
  const [reorderPageSize, setReorderPageSize] = useState(10);

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  const [wastagePage, setWastagePage] = useState(1);
  const [wastagePageSize, setWastagePageSize] = useState(10);

  // Real-time live status
  const [lastEvent, setLastEvent] = useState<{ message: string; timestamp: Date } | null>(null);
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<Set<string>>(new Set());

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out_of_stock' | 'optimal'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showWastageModal, setShowWastageModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedIng, setSelectedIng] = useState<Ingredient | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Produce',
    unit: 'kg',
    current_stock: 10,
    minimum_stock: 5,
    maximum_stock: 50,
    unit_cost: 0,
    storage_location: 'Main Pantry',
    is_perishable: true,
    expiry_days: 7
  });

  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    transaction_type: 'stock_in' as 'stock_in' | 'stock_out' | 'adjustment',
    unit_cost: 0,
    notes: ''
  });

  const [wastageData, setWastageData] = useState({
    quantity: 0,
    reason: 'damaged',
    notes: ''
  });

  const [bulkItems, setBulkItems] = useState<Array<{ ingredient_id: string; quantity: number; unit_cost: number }>>([
    { ingredient_id: '', quantity: 10, unit_cost: 0 }
  ]);

  // Categories list
  const categories = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Dry Grocery', 'Spices', 'Packaging'];

  // Fetch all primary data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ingRes, txRes, analyticsRes, reorderRes, recipesRes] = await Promise.all([
        api.get('/inventory/ingredients'),
        api.get('/inventory/transactions?limit=60'),
        api.get('/inventory/analytics'),
        api.get('/inventory/reorder-suggestions'),
        api.get('/recipes')
      ]);

      setIngredients(ingRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setReorders(reorderRes.data.data || []);
      setRecipes(recipesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flash updated items
  const flashItem = (id: string) => {
    setRecentlyUpdatedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setRecentlyUpdatedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);
  };

  // Real-time WebSocket subscriptions
  useEffect(() => {
    const branchId = localStorage.getItem('aura_branch_id') || 'branch-indiranagar-flagship';
    const tenantId = tenant?.id || localStorage.getItem('aura_tenant_id') || 'tenant-aura-enterprise-001';

    const handleEvent = (payload: any) => {
      if (!payload || !payload.event) return;

      const eventType = payload.event;
      const data = payload.data;

      if (eventType === 'STOCK_ADJUSTED' || eventType === 'INGREDIENT_UPDATED') {
        const updated = data as Ingredient;
        setIngredients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        flashItem(updated.id);
        setLastEvent({
          message: `Real-time sync: ${updated.name} updated (${updated.current_stock} ${updated.unit} remaining)`,
          timestamp: new Date()
        });
        // refresh stats
        api.get('/inventory/analytics').then((r) => setAnalytics(r.data.data)).catch(() => {});
        api.get('/inventory/transactions?limit=60').then((r) => setTransactions(r.data.data)).catch(() => {});
      } else if (eventType === 'INGREDIENT_CREATED') {
        const created = data as Ingredient;
        setIngredients((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
        flashItem(created.id);
        setLastEvent({
          message: `New raw material added: ${created.name}`,
          timestamp: new Date()
        });
      } else if (eventType === 'INGREDIENT_DELETED') {
        const { id } = data;
        setIngredients((prev) => prev.filter((i) => i.id !== id));
      } else if (eventType === 'INVENTORY_RECIPE_DEDUCTED') {
        const { order_number, deducted_items } = data;
        if (Array.isArray(deducted_items)) {
          setIngredients((prev) => {
            const map = new Map(deducted_items.map((it: Ingredient) => [it.id, it]));
            return prev.map((item) => (map.has(item.id) ? (map.get(item.id) as Ingredient) : item));
          });
          deducted_items.forEach((it: Ingredient) => flashItem(it.id));
        }
        setLastEvent({
          message: `⚡ Live POS Order ${order_number || ''}: Stock automatically deducted via Recipe Engine`,
          timestamp: new Date()
        });
        // refresh ledger & analytics
        api.get('/inventory/transactions?limit=60').then((r) => setTransactions(r.data.data)).catch(() => {});
        api.get('/inventory/analytics').then((r) => setAnalytics(r.data.data)).catch(() => {});
      } else if (eventType === 'WASTAGE_LOGGED') {
        const { updated_ingredient, wastage } = data;
        if (updated_ingredient) {
          setIngredients((prev) => prev.map((item) => (item.id === updated_ingredient.id ? updated_ingredient : item)));
          flashItem(updated_ingredient.id);
        }
        setLastEvent({
          message: `Wastage logged: ${wastage?.ingredient_name} (-${wastage?.quantity} ${wastage?.unit})`,
          timestamp: new Date()
        });
        api.get('/inventory/transactions?limit=60').then((r) => setTransactions(r.data.data)).catch(() => {});
        api.get('/inventory/analytics').then((r) => setAnalytics(r.data.data)).catch(() => {});
      } else if (eventType === 'INVENTORY_BULK_UPDATED') {
        if (Array.isArray(data)) {
          setIngredients((prev) => {
            const map = new Map(data.map((it: Ingredient) => [it.id, it]));
            return prev.map((item) => (map.has(item.id) ? (map.get(item.id) as Ingredient) : item));
          });
          data.forEach((it: Ingredient) => flashItem(it.id));
        }
        setLastEvent({
          message: `Bulk replenishment completed for ${data.length} ingredients`,
          timestamp: new Date()
        });
      }
    };

    const unsubBranch = realtimeWS.subscribe(`branch:${branchId}:inventory`, handleEvent);
    const unsubTenant = realtimeWS.subscribe(`tenant:${tenantId}:inventory`, handleEvent);

    return () => {
      unsubBranch();
      unsubTenant();
    };
  }, [tenant?.id]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchSearch =
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.code.toLowerCase().includes(search.toLowerCase()) ||
        ing.category.toLowerCase().includes(search.toLowerCase()) ||
        (ing.storage_location && ing.storage_location.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory === 'All' || ing.category.toLowerCase() === selectedCategory.toLowerCase();

      let matchStatus = true;
      if (stockStatusFilter === 'low') {
        matchStatus = ing.current_stock <= ing.minimum_stock;
      } else if (stockStatusFilter === 'out_of_stock') {
        matchStatus = ing.current_stock <= 0;
      } else if (stockStatusFilter === 'optimal') {
        matchStatus = ing.current_stock > ing.minimum_stock;
      }

      return matchSearch && matchCat && matchStatus;
    });
  }, [ingredients, search, selectedCategory, stockStatusFilter]);

  // Paginated Slices
  const paginatedIngredients = useMemo(() => {
    return filteredIngredients.slice((stockPage - 1) * stockPageSize, stockPage * stockPageSize);
  }, [filteredIngredients, stockPage, stockPageSize]);

  const paginatedRecipes = useMemo(() => {
    return recipes.slice((recipePage - 1) * recipePageSize, recipePage * recipePageSize);
  }, [recipes, recipePage, recipePageSize]);

  const paginatedReorders = useMemo(() => {
    return reorders.slice((reorderPage - 1) * reorderPageSize, reorderPage * reorderPageSize);
  }, [reorders, reorderPage, reorderPageSize]);

  const paginatedTransactions = useMemo(() => {
    return transactions.slice((ledgerPage - 1) * ledgerPageSize, ledgerPage * ledgerPageSize);
  }, [transactions, ledgerPage, ledgerPageSize]);

  const wastageTransactions = useMemo(() => {
    return transactions.filter(t => t.transaction_type === 'wastage');
  }, [transactions]);

  const paginatedWastage = useMemo(() => {
    return wastageTransactions.slice((wastagePage - 1) * wastagePageSize, wastagePage * wastagePageSize);
  }, [wastageTransactions, wastagePage, wastagePageSize]);

  // Add / Edit Handlers
  const openAddModal = () => {
    setEditingIngredient(null);
    setFormData({
      name: '',
      code: `ING-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Produce',
      unit: 'kg',
      current_stock: 10,
      minimum_stock: 5,
      maximum_stock: 50,
      unit_cost: 50,
      storage_location: 'Main Pantry',
      is_perishable: true,
      expiry_days: 7
    });
    setShowAddModal(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setFormData({
      name: ing.name,
      code: ing.code,
      category: ing.category,
      unit: ing.unit,
      current_stock: ing.current_stock,
      minimum_stock: ing.minimum_stock,
      maximum_stock: ing.maximum_stock || 100,
      unit_cost: ing.unit_cost,
      storage_location: ing.storage_location || 'Main Pantry',
      is_perishable: ing.is_perishable ?? true,
      expiry_days: ing.expiry_days || 7
    });
    setShowAddModal(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIngredient) {
        const res = await api.put(`/inventory/ingredients/${editingIngredient.id}`, formData);
        const updated = res.data.data;
        setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const res = await api.post('/inventory/ingredients', formData);
        const created = res.data.data;
        setIngredients((prev) => [created, ...prev]);
      }
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save ingredient');
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive "${name}" from inventory?`)) return;
    try {
      await api.delete(`/inventory/ingredients/${id}`);
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to archive ingredient');
    }
  };

  // Quick Stock Adjust (+10, +50)
  const handleQuickAdd = async (ing: Ingredient, amount: number) => {
    try {
      const res = await api.post('/inventory/adjust-stock', {
        ingredient_id: ing.id,
        quantity: amount,
        transaction_type: 'stock_in',
        notes: `Quick Stock In (+${amount} ${ing.unit})`
      });
      const updated = res.data.data;
      setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      flashItem(ing.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Quick add failed');
    }
  };

  // Stock Adjustment Submit
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || adjustData.quantity <= 0) return;
    try {
      const res = await api.post('/inventory/adjust-stock', {
        ingredient_id: selectedIng.id,
        quantity: Number(adjustData.quantity),
        transaction_type: adjustData.transaction_type,
        unit_cost: adjustData.unit_cost || selectedIng.unit_cost,
        notes: adjustData.notes || `Manual ${adjustData.transaction_type.replace('_', ' ')}`
      });
      const updated = res.data.data;
      setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      flashItem(selectedIng.id);
      setShowAdjustModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Stock adjustment failed');
    }
  };

  // Wastage Submit
  const handleWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || wastageData.quantity <= 0) return;
    try {
      await api.post('/inventory/wastage', {
        ingredient_id: selectedIng.id,
        quantity: Number(wastageData.quantity),
        reason: wastageData.reason,
        notes: wastageData.notes || 'Kitchen Reported Waste'
      });
      setShowWastageModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to log wastage');
    }
  };

  // Reorder 1-Click Replenish
  const handleReplenishReorder = async (r: ReorderSuggestion) => {
    try {
      const res = await api.post('/inventory/adjust-stock', {
        ingredient_id: r.ingredient_id,
        quantity: r.suggested_order_quantity,
        transaction_type: 'stock_in',
        notes: `1-Click Auto Replenish (Safety Level Reached)`
      });
      const updated = res.data.data;
      setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      flashItem(r.ingredient_id);
      setReorders((prev) => prev.filter((item) => item.ingredient_id !== r.ingredient_id));
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Replenishment failed');
    }
  };

  // Simulate recipe test deduction
  const handleSimulateCook = async (recipe: any) => {
    try {
      // Mock order to trigger recipe deduction
      const dummyOrder = {
        id: `sim-${Date.now()}`,
        order_number: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        tenant_id: tenant?.id || 'tenant-aura-enterprise-001',
        branch_id: localStorage.getItem('aura_branch_id') || 'branch-indiranagar-flagship',
        items: [
          {
            product_id: recipe.product_id,
            product_name: recipe.product_name,
            quantity: 1
          }
        ]
      };
      // We can adjust the stock directly for each ingredient in the recipe
      for (const item of recipe.ingredients) {
        await api.post('/inventory/adjust-stock', {
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          transaction_type: 'stock_out',
          notes: `Simulated Cook: 1x ${recipe.product_name}`
        });
      }
      loadData();
      alert(`✅ Simulated portion prepared! Ingredients deducted for "${recipe.product_name}".`);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Simulation deduction failed');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Category', 'Current Stock', 'Unit', 'Safety Min', 'Max Stock', 'Unit Cost', 'Total Value', 'Status'];
    const rows = ingredients.map((i) => [
      i.code,
      `"${i.name}"`,
      i.category,
      i.current_stock,
      i.unit,
      i.minimum_stock,
      i.maximum_stock || 100,
      i.unit_cost,
      (i.current_stock * i.unit_cost).toFixed(2),
      i.stock_status || 'normal'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-aura-text tracking-tight">
                  Inventory & Stock Intelligence
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-aura-muted mt-0.5">
                Real-time stock depletion, recipe costing engine, batch ledger, and intelligent safety reordering.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Live Data"
            className="p-2 rounded-lg bg-aura-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-aura-muted hover:text-aura-text border border-aura-border transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Raw Material</span>
          </button>
        </div>
      </div>

      {/* Live Broadcast Ticker */}
      {lastEvent && (
        <div className="p-2.5 px-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
            <span className="font-semibold">{lastEvent.message}</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 opacity-80 font-mono">
            {lastEvent.timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {/* Total Valuation */}
        <div className="glass-card p-4 rounded-xl border border-aura-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Total Stock Value</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-aura-text font-mono">
              {currency}{analytics?.total_stock_value?.toLocaleString() || '0'}
            </span>
          </div>
          <p className="text-[10px] text-aura-muted mt-1">Across all raw pantry goods</p>
        </div>

        {/* Total SKUs */}
        <div className="glass-card p-4 rounded-xl border border-aura-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Active Materials</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-aura-text font-mono">
              {ingredients.length}
            </span>
            <span className="text-xs text-aura-muted">SKUs</span>
          </div>
          <p className="text-[10px] text-aura-muted mt-1">{analytics?.healthy_stock_count || 0} in optimal range</p>
        </div>

        {/* Low Stock Alerts */}
        <div className={`glass-card p-4 rounded-xl border transition-colors ${
          (analytics?.low_stock_count || 0) > 0
            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-aura-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Low Stock Warnings</span>
            <div className={`p-1.5 rounded-lg ${
              (analytics?.low_stock_count || 0) > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 animate-pulse'
                : 'bg-zinc-100 dark:bg-zinc-800 text-aura-muted'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-xl md:text-2xl font-black font-mono ${
              (analytics?.low_stock_count || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-aura-text'
            }`}>
              {analytics?.low_stock_count || 0}
            </span>
            <span className="text-xs text-rose-500 font-medium">Reorder needed</span>
          </div>
          <p className="text-[10px] text-aura-muted mt-1">{analytics?.out_of_stock_count || 0} completely out</p>
        </div>

        {/* Today's Auto Deductions */}
        <div className="glass-card p-4 rounded-xl border border-aura-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Today's Consumption</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-aura-text font-mono">
              {analytics?.today_deductions_qty || 0}
            </span>
            <span className="text-xs text-aura-muted">Units</span>
          </div>
          <p className="text-[10px] text-aura-muted mt-1">Real-time POS Recipe Depletions</p>
        </div>

        {/* Today's Wastage Loss */}
        <div className="glass-card p-4 rounded-xl border border-aura-border relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Wastage / Spoilage</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {currency}{analytics?.today_waste_cost?.toLocaleString() || '0'}
            </span>
          </div>
          <p className="text-[10px] text-aura-muted mt-1">Logged today from kitchen/bar</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-aura-border space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'stock'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-aura-muted hover:text-aura-text'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Live Stock Tracker</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-aura-muted">
            {ingredients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'recipes'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-aura-muted hover:text-aura-text'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Recipe Stock Depletion Linkage</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-aura-muted">
            {recipes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reorder')}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'reorder'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-aura-muted hover:text-aura-text'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Smart Reorder Forecast</span>
          {reorders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
              {reorders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-aura-muted hover:text-aura-text'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Real-Time Audit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('wastage')}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'wastage'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-aura-muted hover:text-aura-text'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Wastage & Loss Prevention</span>
        </button>
      </div>

      {/* TAB 1: LIVE STOCK TRACKER */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="glass-card p-3 md:p-4 rounded-xl border border-aura-border space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-aura-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ingredient by name, code, storage..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-amber-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-aura-muted hover:text-aura-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    stockStatusFilter === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
                  }`}
                >
                  All ({ingredients.length})
                </button>
                <button
                  onClick={() => setStockStatusFilter('low')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    stockStatusFilter === 'low'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Low Stock ({ingredients.filter((i) => i.current_stock <= i.minimum_stock).length})</span>
                </button>
                <button
                  onClick={() => setStockStatusFilter('out_of_stock')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    stockStatusFilter === 'out_of_stock'
                      ? 'bg-zinc-800 text-rose-300 font-bold shadow-sm'
                      : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
                  }`}
                >
                  Out of Stock ({ingredients.filter((i) => i.current_stock <= 0).length})
                </button>

                {/* Grid / Table switch */}
                <div className="hidden sm:flex items-center border border-aura-border rounded-lg overflow-hidden ml-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 ${viewMode === 'table' ? 'bg-zinc-200 dark:bg-zinc-800 text-aura-text' : 'text-aura-muted'}`}
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'bg-zinc-200 dark:bg-zinc-800 text-aura-text' : 'text-aura-muted'}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                      : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/70 text-aura-muted uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-3">SKU / Item</th>
                      <th className="p-3">Category & Location</th>
                      <th className="p-3">Stock Left & Visual Level</th>
                      <th className="p-3">Safety Min / Max</th>
                      <th className="p-3">Unit Cost & Asset Value</th>
                      <th className="p-3">Est. Runout</th>
                      <th className="p-3 text-right">Instant Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aura-border">
                    {filteredIngredients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-aura-muted">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="font-semibold">No raw materials match your criteria</p>
                          <p className="text-[11px] mt-1">Try resetting the filter or add a new ingredient</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedIngredients.map((item) => {
                        const isFlashing = recentlyUpdatedIds.has(item.id);
                        const isLow = item.current_stock <= item.minimum_stock;
                        const isOut = item.current_stock <= 0;
                        const maxCap = item.maximum_stock || 100;
                        const pct = Math.min(100, Math.round((item.current_stock / maxCap) * 100));

                        let progressColor = 'bg-emerald-500';
                        if (isOut) progressColor = 'bg-zinc-400';
                        else if (isLow) progressColor = 'bg-rose-500';
                        else if (pct < 40) progressColor = 'bg-amber-500';

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-all ${
                              isFlashing ? 'bg-amber-100/50 dark:bg-amber-950/40 ring-1 ring-amber-400' : ''
                            }`}
                          >
                            {/* Name & Code */}
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-bold text-aura-text flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    {isOut ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-rose-600 text-white">
                                        OUT OF STOCK
                                      </span>
                                    ) : isLow ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                        LOW STOCK
                                      </span>
                                    ) : null}
                                  </div>
                                  <span className="text-[10px] font-mono text-aura-muted">{item.code}</span>
                                </div>
                              </div>
                            </td>

                            {/* Category & Location */}
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-aura-secondary">
                                {item.category}
                              </span>
                              <div className="text-[10px] text-aura-muted mt-0.5">{item.storage_location || 'Main Pantry'}</div>
                            </td>

                            {/* Stock Left & Visual Meter */}
                            <td className="p-3 min-w-[180px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-mono text-xs font-bold ${
                                  isOut ? 'text-rose-600 font-extrabold' : isLow ? 'text-rose-500 font-bold' : 'text-aura-text'
                                }`}>
                                  {item.current_stock} {item.unit} left
                                </span>
                                <span className="text-[10px] font-mono text-aura-muted">{pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>

                            {/* Safety Min / Max */}
                            <td className="p-3 font-mono text-[11px] text-aura-muted">
                              <div>Min: <span className="text-aura-text font-semibold">{item.minimum_stock} {item.unit}</span></div>
                              <div>Max: {maxCap} {item.unit}</div>
                            </td>

                            {/* Unit Cost & Total Value */}
                            <td className="p-3 font-mono text-[11px]">
                              <div className="font-semibold text-aura-text">
                                {currency}{item.unit_cost} / {item.unit}
                              </div>
                              <div className="text-[10px] text-aura-muted">
                                Value: {currency}{(item.current_stock * item.unit_cost).toLocaleString()}
                              </div>
                            </td>

                            {/* Estimated Runout */}
                            <td className="p-3 text-[11px]">
                              {isOut ? (
                                <span className="text-rose-600 font-bold">Depleted</span>
                              ) : isLow ? (
                                <span className="text-rose-500 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  ~{item.days_left_est || '1.2'} days left
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  ~{item.days_left_est || '6.5'} days left
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick +10 */}
                                <button
                                  onClick={() => handleQuickAdd(item, 10)}
                                  title={`Quick Add 10 ${item.unit}`}
                                  className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100"
                                >
                                  +10
                                </button>

                                {/* Adjust */}
                                <button
                                  onClick={() => {
                                    setSelectedIng(item);
                                    setAdjustData({
                                      quantity: 0,
                                      transaction_type: 'stock_in',
                                      unit_cost: item.unit_cost,
                                      notes: ''
                                    });
                                    setShowAdjustModal(true);
                                  }}
                                  className="btn-secondary py-1 px-2 text-[10px]"
                                >
                                  Adjust
                                </button>

                                {/* Wastage */}
                                <button
                                  onClick={() => {
                                    setSelectedIng(item);
                                    setWastageData({
                                      quantity: 0,
                                      reason: 'damaged',
                                      notes: ''
                                    });
                                    setShowWastageModal(true);
                                  }}
                                  className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Log Waste"
                                >
                                  <Flame className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1 rounded-md text-aura-muted hover:text-aura-text hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Edit Material"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteIngredient(item.id, item.name)}
                                  className="p-1 rounded-md text-aura-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Archive Material"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              <Pagination
                currentPage={stockPage}
                totalItems={filteredIngredients.length}
                pageSize={stockPageSize}
                onPageChange={setStockPage}
                onPageSizeChange={setStockPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="ingredients"
              />
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedIngredients.map((item) => {
                  const isFlashing = recentlyUpdatedIds.has(item.id);
                  const isLow = item.current_stock <= item.minimum_stock;
                  const isOut = item.current_stock <= 0;
                  const maxCap = item.maximum_stock || 100;
                  const pct = Math.min(100, Math.round((item.current_stock / maxCap) * 100));

                  let progressColor = 'bg-emerald-500';
                  if (isOut) progressColor = 'bg-zinc-400';
                  else if (isLow) progressColor = 'bg-rose-500';
                  else if (pct < 40) progressColor = 'bg-amber-500';

                  return (
                    <div
                      key={item.id}
                      className={`glass-card p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                        isFlashing
                          ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/30'
                          : isLow
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/10'
                          : 'border-aura-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-aura-muted">{item.code}</span>
                            <h3 className="font-bold text-sm text-aura-text">{item.name}</h3>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-aura-secondary">
                              {item.category} • {item.storage_location || 'Main Pantry'}
                            </span>
                          </div>
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                              OUT
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                              LOW
                            </span>
                          ) : null}
                        </div>

                        {/* Stock Left Big Numbers */}
                        <div className="mt-3 p-3 rounded-lg bg-aura-bg/60 border border-aura-border space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-aura-muted font-medium">Stock Left:</span>
                            <span className={`text-lg font-black font-mono ${
                              isOut ? 'text-rose-600' : isLow ? 'text-rose-500' : 'text-aura-text'
                            }`}>
                              {item.current_stock} <span className="text-xs font-normal">{item.unit}</span>
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor} transition-all`} style={{ width: `${pct}%` }} />
                          </div>

                          <div className="flex justify-between text-[10px] text-aura-muted font-mono">
                            <span>Min: {item.minimum_stock} {item.unit}</span>
                            <span>Max: {maxCap} {item.unit} ({pct}%)</span>
                          </div>
                        </div>

                        {/* Cost Info */}
                        <div className="mt-2 flex justify-between text-xs text-aura-secondary font-mono">
                          <span>Cost: {currency}{item.unit_cost}/{item.unit}</span>
                          <span>Total: {currency}{(item.current_stock * item.unit_cost).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-aura-border flex items-center justify-between">
                        <button
                          onClick={() => handleQuickAdd(item, 10)}
                          className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100"
                        >
                          +10 {item.unit}
                        </button>

                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedIng(item);
                              setAdjustData({
                                quantity: 0,
                                transaction_type: 'stock_in',
                                unit_cost: item.unit_cost,
                                notes: ''
                              });
                              setShowAdjustModal(true);
                            }}
                            className="btn-secondary py-1 px-2.5 text-xs"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIng(item);
                              setShowWastageModal(true);
                            }}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <Flame className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Pagination */}
              <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
                <Pagination
                  currentPage={stockPage}
                  totalItems={filteredIngredients.length}
                  pageSize={stockPageSize}
                  onPageChange={setStockPage}
                  onPageSizeChange={setStockPageSize}
                  pageSizeOptions={[6, 9, 12, 24]}
                  itemLabel="ingredients"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECIPE STOCK DEPLETION & DISH LINKAGE */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl border border-aura-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <span>Automatic Recipe Depletion Engine</span>
                </h3>
                <p className="text-xs text-aura-muted mt-0.5">
                  Every POS order automatically subtracts the exact ingredient ratios configured here in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.length === 0 ? (
              <div className="glass-card p-8 rounded-xl border border-aura-border text-center text-aura-muted col-span-2">
                <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold">No recipes configured yet</p>
                <p className="text-xs mt-1">Configure recipes in the Recipe Management tab to link menu items to stock.</p>
              </div>
            ) : (
              paginatedRecipes.map((r) => (
                <div key={r.id} className="glass-card p-4 rounded-xl border border-aura-border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-aura-text">{r.product_name}</h4>
                      <p className="text-[11px] text-aura-muted">Portion Yield: {r.yield_servings} serving(s)</p>
                    </div>
                    <button
                      onClick={() => handleSimulateCook(r)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-semibold flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Simulate Cook Portion</span>
                    </button>
                  </div>

                  {/* Financial Ratios */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-aura-bg border border-aura-border text-center text-[11px]">
                    <div>
                      <span className="text-aura-muted block text-[10px]">Selling Price</span>
                      <span className="font-bold text-aura-text font-mono">{currency}{r.selling_price}</span>
                    </div>
                    <div>
                      <span className="text-aura-muted block text-[10px]">Food Cost</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{currency}{r.total_food_cost}</span>
                    </div>
                    <div>
                      <span className="text-aura-muted block text-[10px]">Gross Margin</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{r.gross_margin_percentage}%</span>
                    </div>
                  </div>

                  {/* Ingredients Breakdown */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-aura-muted uppercase tracking-wider mb-1.5">
                      Required Stock Depletions Per Order:
                    </h5>
                    <div className="space-y-1">
                      {r.ingredients.map((ing: any, idx: number) => {
                        const match = ingredients.find((i) => i.id === ing.ingredient_id || i.name === ing.ingredient_name);
                        const hasStock = match ? match.current_stock >= ing.quantity : true;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-900/60 text-xs"
                          >
                            <span className="font-medium text-aura-text flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${hasStock ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                              {ing.ingredient_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                                -{ing.quantity} {ing.unit}
                              </span>
                              {match && (
                                <span className="text-[10px] text-aura-muted font-mono">
                                  (Left: {match.current_stock} {match.unit})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {recipes.length > 0 && (
            <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
              <Pagination
                currentPage={recipePage}
                totalItems={recipes.length}
                pageSize={recipePageSize}
                onPageChange={setRecipePage}
                onPageSizeChange={setRecipePageSize}
                pageSizeOptions={[4, 8, 12, 24]}
                itemLabel="recipes"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SMART REORDER FORECAST */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl border border-aura-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-rose-500" />
                <span>AI Reorder & Safety Stock Recommendations</span>
              </h3>
              <p className="text-xs text-aura-muted mt-0.5">
                Automatically calculated based on minimum safety thresholds and maximum storage capacity.
              </p>
            </div>
            {reorders.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
                {reorders.length} materials need immediate procurement
              </span>
            )}
          </div>

          <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/70 text-aura-muted uppercase text-[10px] tracking-wider font-semibold">
                    <th className="p-3">Material</th>
                    <th className="p-3">Category / Store</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Safety Threshold</th>
                    <th className="p-3">Suggested Order Qty</th>
                    <th className="p-3">Estimated Cost</th>
                    <th className="p-3">Urgency Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border">
                  {reorders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-aura-muted">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">All Stock Levels are Healthy!</p>
                        <p className="text-[11px] mt-1">No ingredients are currently below safety threshold levels.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedReorders.map((r) => (
                      <tr key={r.ingredient_id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="p-3">
                          <div className="font-bold text-aura-text">{r.ingredient_name}</div>
                          <span className="text-[10px] font-mono text-aura-muted">{r.code}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-aura-secondary">{r.category}</span>
                          <div className="text-[10px] text-aura-muted">{r.storage_location}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {r.current_stock} {r.unit}
                        </td>
                        <td className="p-3 font-mono text-aura-muted">
                          Min: {r.minimum_stock} {r.unit}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{r.suggested_order_quantity} {r.unit}
                        </td>
                        <td className="p-3 font-mono font-semibold text-aura-text">
                          {currency}{r.estimated_total_cost?.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.current_stock <= 0 ? 'bg-rose-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {r.urgency}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleReplenishReorder(r)}
                            className="btn-primary py-1 px-3 text-xs font-semibold cursor-pointer"
                          >
                            1-Click Restock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {reorders.length > 0 && (
              <Pagination
                currentPage={reorderPage}
                totalItems={reorders.length}
                pageSize={reorderPageSize}
                onPageChange={setReorderPage}
                onPageSizeChange={setReorderPageSize}
                pageSizeOptions={[5, 10, 20]}
                itemLabel="reorder items"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-TIME AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl border border-aura-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>Live Inventory Movement & Audit Ledger</span>
              </h3>
              <p className="text-xs text-aura-muted mt-0.5">
                Complete tamper-proof audit trail of stock-ins, recipe depletions from POS, kitchen wastage, and manual counts.
              </p>
            </div>
            <span className="text-xs text-aura-muted font-mono">{transactions.length} entries recorded</span>
          </div>

          <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/70 text-aura-muted uppercase text-[10px] tracking-wider font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Material</th>
                    <th className="p-3">Movement Type</th>
                    <th className="p-3">Quantity Changed</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Total Value Impact</th>
                    <th className="p-3">Reference / Order ID</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border font-mono text-[11px]">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-aura-muted font-sans">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold">No transaction ledger history yet</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => {
                      const isPositive = tx.transaction_type === 'stock_in';
                      const isRecipe = tx.transaction_type === 'recipe_deduction';
                      const isWastage = tx.transaction_type === 'wastage';

                      return (
                        <tr key={tx.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                          <td className="p-3 text-aura-muted">
                            {new Date(tx.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="p-3 font-sans font-bold text-aura-text">
                            {tx.ingredient_name}
                          </td>
                          <td className="p-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPositive
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : isRecipe
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                : isWastage
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-aura-muted'
                            }`}>
                              {tx.transaction_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-bold">
                            <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {isPositive ? '+' : '-'}{tx.quantity} {tx.unit}
                            </span>
                          </td>
                          <td className="p-3 text-aura-muted">
                            {currency}{tx.unit_cost}
                          </td>
                          <td className="p-3 font-bold text-aura-text">
                            {currency}{tx.total_cost}
                          </td>
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">
                            {tx.reference_id || '—'}
                          </td>
                          <td className="p-3 font-sans text-aura-muted text-[10px]">
                            {tx.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {transactions.length > 0 && (
              <Pagination
                currentPage={ledgerPage}
                totalItems={transactions.length}
                pageSize={ledgerPageSize}
                onPageChange={setLedgerPage}
                onPageSizeChange={setLedgerPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="transactions"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WASTAGE & LOSS PREVENTION */}
      {activeTab === 'wastage' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl border border-aura-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-aura-text flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Kitchen Wastage & Shrinkage Tracker</span>
              </h3>
              <p className="text-xs text-aura-muted mt-0.5">
                Track food preparation losses, expired stocks, and burn rates to optimize gross margins.
              </p>
            </div>
            <button
              onClick={() => {
                if (ingredients.length > 0) {
                  setSelectedIng(ingredients[0]);
                  setShowWastageModal(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Wastage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl border border-aura-border space-y-2">
              <span className="text-xs font-semibold text-aura-muted">Today's Wastage Total</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {currency}{analytics?.today_waste_cost || 0}
              </div>
              <p className="text-[10px] text-aura-muted">Logged from kitchen stations today</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-aura-border space-y-2">
              <span className="text-xs font-semibold text-aura-muted">Top Wastage Reasons</span>
              <div className="space-y-1 text-xs text-aura-secondary">
                <div className="flex justify-between"><span>Expired Stock</span> <span className="font-mono font-bold">45%</span></div>
                <div className="flex justify-between"><span>Prep Burns & Spillage</span> <span className="font-mono font-bold">35%</span></div>
                <div className="flex justify-between"><span>Over-prepped Surplus</span> <span className="font-mono font-bold">20%</span></div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-aura-border space-y-2">
              <span className="text-xs font-semibold text-aura-muted">AI Prevention Tip</span>
              <p className="text-xs text-aura-text leading-relaxed">
                💡 Full cream milk & Alphonso mango pulp have high velocity on weekends. Stagger procurements on Tuesday/Friday to cut spoilage by 18%.
              </p>
            </div>
          </div>

          {/* Wastage Logs Table */}
          <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
            <div className="p-3 border-b border-aura-border font-bold text-xs text-aura-text">
              Historical Wastage Ledger
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/70 text-aura-muted uppercase text-[10px] tracking-wider font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Material</th>
                    <th className="p-3">Wasted Qty</th>
                    <th className="p-3">Loss Cost</th>
                    <th className="p-3">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border font-mono text-[11px]">
                  {wastageTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-aura-muted font-sans">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p className="font-semibold">No food wastage recorded</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedWastage.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="p-3 text-aura-muted font-mono">
                          {new Date(w.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3 font-sans font-bold text-aura-text">{w.ingredient_name}</td>
                        <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">
                          -{w.quantity} {w.unit}
                        </td>
                        <td className="p-3 font-black text-rose-600 dark:text-rose-400">
                          {currency}{w.total_cost}
                        </td>
                        <td className="p-3 font-sans text-aura-secondary text-xs">{w.notes || 'Kitchen prep waste'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {wastageTransactions.length > 0 && (
              <Pagination
                currentPage={wastagePage}
                totalItems={wastageTransactions.length}
                pageSize={wastagePageSize}
                onPageChange={setWastagePage}
                onPageSizeChange={setWastagePageSize}
                pageSizeOptions={[5, 10, 20]}
                itemLabel="wastage logs"
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT RAW MATERIAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-aura-text">
                  {editingIngredient ? 'Edit Raw Material' : 'Add New Raw Material'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-aura-muted hover:text-aura-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Material Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buffalo Mozzarella"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ING-MOZZ"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Unit of Measurement</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="g">g (Grams)</option>
                    <option value="l">l (Litres)</option>
                    <option value="ml">ml (Millilitres)</option>
                    <option value="pcs">pcs (Pieces / Units)</option>
                    <option value="packet">packet (Packets)</option>
                    <option value="box">box (Boxes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Opening / Current Stock</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-rose-500 mb-1 block">Safety Min (Reorder)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Max Storage Capacity</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.maximum_stock}
                    onChange={(e) => setFormData({ ...formData, maximum_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Unit Cost ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-aura-muted mb-1 block">Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in Chiller 2"
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-aura-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 font-semibold"
                >
                  {editingIngredient ? 'Save Changes' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK IN / ADJUSTMENT */}
      {showAdjustModal && selectedIng && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div>
                <h3 className="font-bold text-base text-aura-text">Adjust Stock: {selectedIng.name}</h3>
                <p className="text-xs text-aura-muted">Current Stock Left: <span className="font-bold text-aura-text font-mono">{selectedIng.current_stock} {selectedIng.unit}</span></p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 text-aura-muted hover:text-aura-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Adjustment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, transaction_type: 'stock_in' })}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      adjustData.transaction_type === 'stock_in'
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-aura-bg text-aura-muted border-aura-border'
                    }`}
                  >
                    + Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, transaction_type: 'stock_out' })}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      adjustData.transaction_type === 'stock_out'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-aura-bg text-aura-muted border-aura-border'
                    }`}
                  >
                    - Stock Out
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, transaction_type: 'adjustment' })}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      adjustData.transaction_type === 'adjustment'
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-aura-bg text-aura-muted border-aura-border'
                    }`}
                  >
                    Physical Audit
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-aura-muted mb-1 block">
                  {adjustData.transaction_type === 'adjustment'
                    ? `Set Exact Verified Stock Quantity (${selectedIng.unit})`
                    : `Quantity to ${adjustData.transaction_type === 'stock_in' ? 'Add' : 'Deduct'} (${selectedIng.unit})`}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={adjustData.quantity || ''}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-base text-aura-text font-black font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Unit Cost ({currency})</label>
                <input
                  type="number"
                  step="any"
                  value={adjustData.unit_cost || ''}
                  onChange={(e) => setAdjustData({ ...adjustData, unit_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Audit Notes / Supplier Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice INV-8492 or Monthly Physical Audit"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-aura-border">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustData.quantity <= 0}
                  className="btn-primary px-5 py-2 font-semibold disabled:opacity-50"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG WASTAGE */}
      {showWastageModal && selectedIng && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="font-bold text-base text-aura-text">Log Wastage / Spoilage</h3>
                  <p className="text-xs text-aura-muted">{selectedIng.name} (Stock: {selectedIng.current_stock} {selectedIng.unit})</p>
                </div>
              </div>
              <button onClick={() => setShowWastageModal(false)} className="p-1 text-aura-muted hover:text-aura-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWastageSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Wasted Quantity ({selectedIng.unit})</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={wastageData.quantity || ''}
                  onChange={(e) => setWastageData({ ...wastageData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-rose-300 dark:border-rose-800 text-base text-rose-600 font-black font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Wastage Reason</label>
                <select
                  value={wastageData.reason}
                  onChange={(e) => setWastageData({ ...wastageData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                >
                  <option value="expired">Expired Shelf Life</option>
                  <option value="damaged">Damaged in Transit / Storage</option>
                  <option value="burnt">Kitchen Cooking Burn / Overcooked</option>
                  <option value="spillage">Accidental Spillage / Dropped</option>
                  <option value="over_prepped">Over Prepped Surplus</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex justify-between items-center text-xs">
                <span className="text-rose-700 dark:text-rose-400 font-semibold">Estimated Loss Cost:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {currency}{(wastageData.quantity * selectedIng.unit_cost).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="font-semibold text-aura-muted mb-1 block">Chef / Kitchen Staff Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Burnt during 8pm dinner peak rush"
                  value={wastageData.notes}
                  onChange={(e) => setWastageData({ ...wastageData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-aura-border">
                <button
                  type="button"
                  onClick={() => setShowWastageModal(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wastageData.quantity <= 0}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50"
                >
                  Confirm Wastage Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
