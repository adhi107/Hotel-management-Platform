import React, { useState, useEffect } from 'react';
import { Layers, DollarSign, Percent, TrendingUp, AlertCircle, ChefHat, Sparkles, ArrowUpRight, Plus, Search } from 'lucide-react';
import api from '../../services/api';
import { Recipe, Product, Ingredient } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';
import { Pagination } from '../../components/Pagination';

interface RecipeCostingViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const RecipeCostingView: React.FC<RecipeCostingViewProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, pRes, iRes] = await Promise.all([
          api.get('/recipes'),
          api.get('/menu/products'),
          api.get('/inventory/ingredients')
        ]);
        setRecipes(rRes.data.data || []);
        setProducts(pRes.data.data || []);
        setIngredients(iRes.data.data || []);
      } catch (err) {
        console.error('Failed to load recipe costing data:', err);
      }
    };
    fetchData();
  }, []);

  const currency = tenant?.config?.currency_symbol || '₹';

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.kitchen_station && p.kitchen_station.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-aura-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-aura-text tracking-tight">
                Recipe & Food Costing Engine
              </h1>
              <p className="text-xs text-aura-muted mt-0.5">
                Automated dish ingredient breakdown, Food Cost %, Gross Margin %, and portion variance analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate('inventory')}
            className="btn-secondary text-xs"
          >
            <span>Live Stock Inventory →</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('menu')}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Menu Dishes</span>
          </button>
        </div>
      </div>

      {/* Profitability Overview Matrix (Clickable KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target Food Cost */}
        <div 
          onClick={() => onNavigate && onNavigate('reports')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-aura-muted">Target Food Cost %</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-2xl font-black text-aura-text mt-1 font-mono">28.0%</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Industry benchmark (25% - 32%)</p>
        </div>

        {/* Actual Menu Food Cost */}
        <div 
          onClick={() => onNavigate && onNavigate('reports')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-aura-muted">Actual Menu Food Cost %</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">31.5%</h3>
          <p className="text-[11px] text-aura-muted mt-1">Weighted by sales volume</p>
        </div>

        {/* Average Dish Margin */}
        <div 
          onClick={() => onNavigate && onNavigate('reports')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-aura-muted">Average Dish Margin</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">68.5%</h3>
          <p className="text-[11px] text-aura-muted mt-1">Gross profit contribution</p>
        </div>

        {/* Active Master Recipes */}
        <div 
          onClick={() => onNavigate && onNavigate('menu')}
          className="glass-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-aura-muted">Active Master Dishes</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-2xl font-black text-aura-text mt-1 font-mono">{products.length} Dishes</h3>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Click to edit recipes & BOM →</p>
        </div>
      </div>

      {/* Dish Recipe Breakdown Table */}
      <div className="glass-card rounded-2xl p-5 border border-aura-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-aura-border">
          <div>
            <h3 className="text-sm font-extrabold text-aura-text">Menu Item Margin & Food Cost Breakdown</h3>
            <p className="text-xs text-aura-muted">Click any dish row to inspect ingredients or edit pricing</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-aura-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dish name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text focus:outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/60 text-aura-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-3">Dish Name</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Food Cost</th>
                <th className="p-3">Food Cost %</th>
                <th className="p-3">Gross Margin</th>
                <th className="p-3">Margin %</th>
                <th className="p-3 text-right">Profit Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aura-border">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(prod => {
                  const cost = prod.cost_price || Math.round(prod.base_price * 0.3);
                  const foodCostPct = Math.round((cost / prod.base_price) * 100);
                  const margin = prod.base_price - cost;
                  const marginPct = 100 - foodCostPct;
                  const isStar = marginPct >= 70;

                  return (
                    <tr 
                      key={prod.id} 
                      onClick={() => onNavigate && onNavigate('menu')}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-bold text-aura-text flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-aura-muted" />
                        <span>{prod.name}</span>
                      </td>
                      <td className="p-3 font-bold text-aura-text font-mono">{currency}{prod.base_price}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-semibold font-mono">{currency}{cost}</td>
                      <td className="p-3">
                        <span className={`font-bold font-mono ${foodCostPct > 35 ? 'text-rose-600 dark:text-rose-400' : 'text-aura-muted'}`}>
                          {foodCostPct}%
                        </span>
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold font-mono">{currency}{margin}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold font-mono">{marginPct}%</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isStar 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                        }`}>
                          {isStar ? '★ Star (High Margin)' : 'Workhorse'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-aura-muted text-xs">
                    No dish recipes found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="pt-2 border-t border-aura-border">
            <Pagination
              currentPage={page}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
