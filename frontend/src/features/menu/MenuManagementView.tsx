import React, { useState, useEffect, useRef } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X, 
  Edit3, 
  Trash2, 
  Check, 
  Tag, 
  Image as ImageIcon,
  Upload,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Flame,
  ChefHat,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../../utils/defaultCatalog';
import { Pagination } from '../../components/Pagination';

const FOOD_PRESET_IMAGES = [
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
  { label: 'Coffee', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80' },
  { label: 'Juice', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80' },
  { label: 'Chai', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810ef?w=500&q=80' },
  { label: 'Shake', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80' },
  { label: 'Tandoori Tikka', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80' },
  { label: 'Dessert & Cake', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80' },
  { label: 'South Tiffin / Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80' },
  { label: 'Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
];

export const MenuManagementView: React.FC = () => {
  const { tenant } = useAuthStore();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // Create Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(100);
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(30);
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdStation, setNewProdStation] = useState('Kitchen');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editCat, setEditCat] = useState('');
  const [editStation, setEditStation] = useState('Kitchen');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsVeg, setEditIsVeg] = useState(true);
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  // Image upload mode state for modals ('upload' | 'preset' | 'url')
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/menu/products'),
        api.get('/menu/categories')
      ]);
      const pList = pRes.data.data?.length > 0 ? pRes.data.data : DEFAULT_PRODUCTS;
      const cList = cRes.data.data?.length > 0 ? cRes.data.data : DEFAULT_CATEGORIES;
      setProducts(pList);
      setCategories(cList);
      if (cList.length > 0 && !newProdCat) {
        setNewProdCat(cList[0].id);
      }
    } catch (err) {
      setProducts(DEFAULT_PRODUCTS);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currency = tenant?.config?.currency_symbol || '₹';

  // Helper to convert uploaded File to Base64 data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    // Read and compress
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (isEdit) {
        setEditImageUrl(base64);
      } else {
        setNewProdImageUrl(base64);
      }
      toast.success('Photo Uploaded', `Image "${file.name}" loaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async () => {
    if (!newProdName.trim() || !newProdCat || newProdPrice <= 0) {
      toast.error('Missing Details', 'Please provide a valid dish name, category, and price.');
      return;
    }
    try {
      await api.post('/menu/products', {
        category_id: newProdCat,
        name: newProdName.trim(),
        base_price: Number(newProdPrice),
        cost_price: Number(newProdCostPrice) || Math.round(Number(newProdPrice) * 0.3),
        kitchen_station: newProdStation,
        image_url: newProdImageUrl || undefined,
        is_vegetarian: isVeg,
        is_available: true
      });
      setIsAddModalOpen(false);
      setNewProdName('');
      setNewProdPrice(100);
      setNewProdCostPrice(30);
      setNewProdImageUrl('');
      toast.success('Dish Created', `"${newProdName}" added to catalog.`);
      fetchData();
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.error?.message || 'Could not create dish.');
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditPrice(p.base_price);
    setEditCostPrice(p.cost_price || Math.round(p.base_price * 0.3));
    setEditCat(p.category_id);
    setEditStation(p.kitchen_station || 'Kitchen');
    setEditImageUrl(p.image_url || '');
    setEditIsVeg(p.is_vegetarian);
    setEditIsAvailable(p.is_available ?? true);
    setImageUploadMode('upload');
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !editName.trim() || editPrice <= 0) {
      toast.error('Missing Details', 'Please provide a valid dish name and price.');
      return;
    }
    try {
      await api.put(`/menu/products/${editingProduct.id}`, {
        name: editName.trim(),
        base_price: Number(editPrice),
        cost_price: Number(editCostPrice),
        category_id: editCat,
        kitchen_station: editStation,
        image_url: editImageUrl || undefined,
        is_vegetarian: editIsVeg,
        is_available: editIsAvailable
      });
      toast.success('Dish Updated', `"${editName}" updated successfully.`);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: editName,
        base_price: editPrice,
        cost_price: editCostPrice,
        category_id: editCat,
        kitchen_station: editStation,
        image_url: editImageUrl || p.image_url,
        is_vegetarian: editIsVeg,
        is_available: editIsAvailable
      } : p));
      toast.success('Dish Updated', `"${editName}" updated.`);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    try {
      await api.delete(`/menu/products/${id}`);
      toast.info('Dish Deleted', `"${name}" removed from catalog.`);
      fetchData();
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.info('Dish Deleted', `"${name}" removed.`);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.kitchen_station && p.kitchen_station.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-aura-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-aura-text tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-zinc-900 dark:text-white" />
            <span>Menu Dishes & Catalog</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-aura-text font-bold border border-aura-border">
              {products.length} Dishes
            </span>
          </h1>
          <p className="text-xs text-aura-muted mt-1">
            Manage dish details, upload custom food photos, configure pricing, and assign kitchen stations.
          </p>
        </div>

        <button
          onClick={() => {
            setNewProdName('');
            setNewProdPrice(120);
            setNewProdCostPrice(35);
            setNewProdImageUrl('');
            setImageUploadMode('upload');
            setIsAddModalOpen(true);
          }}
          className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Category Pills, View Mode & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-aura-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search dishes by name or station..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-aura-card p-1 rounded-xl border border-aura-border shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-aura-muted hover:text-aura-text'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-aura-muted hover:text-aura-text'
              }`}
              title="Table List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => {
                setActiveCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
              }`}
            >
              All Dishes ({products.length})
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                    : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dishes Display: Grid or Table with Pagination */}
      {viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedProducts.map(p => (
              <div 
                key={p.id} 
                className="bg-aura-card rounded-2xl p-4 border border-aura-border hover:border-zinc-400 dark:hover:border-zinc-600 flex flex-col justify-between transition-all shadow-xs group"
              >
                <div>
                  {/* Image thumbnail + Top Tags */}
                  <div className="relative mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-32 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    {p.image_url ? (
                      <img 
                        src={p.image_url} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-1">
                        <ChefHat className="w-8 h-8 opacity-60" />
                        <span className="text-[10px] font-semibold">{p.kitchen_station || 'Kitchen'}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] uppercase font-extrabold text-zinc-900 dark:text-white px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs border border-zinc-200 dark:border-zinc-700 shadow-xs">
                        {p.kitchen_station || 'Kitchen'}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${p.is_vegetarian ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {p.is_vegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-extrabold text-sm text-aura-text leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-aura-muted mt-0.5">
                    {categories.find(c => c.id === p.category_id)?.name || 'General Item'}
                  </p>
                </div>

                {/* Pricing & Quick Edit footer */}
                <div className="mt-4 pt-3 border-t border-aura-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-aura-muted block font-medium">Selling Price</span>
                    <span className="text-base font-black text-aura-text font-mono">
                      {currency}{p.base_price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="w-8 h-8 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Dish & Photo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="w-8 h-8 rounded-lg border border-aura-border text-aura-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[4, 8, 12, 24, 48]}
              itemLabel="dishes"
            />
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-xl border border-aura-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-aura-border bg-zinc-50 dark:bg-zinc-900/60 text-aura-muted uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3.5">Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Station</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Margin</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-border">
                {paginatedProducts.map(p => {
                  const margin = p.base_price > 0 ? Math.round(((p.base_price - (p.cost_price || p.base_price * 0.3)) / p.base_price) * 100) : 70;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-aura-border flex items-center justify-center">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ChefHat className="w-4 h-4 text-aura-muted" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-aura-text block">{p.name}</span>
                            <span className="text-[10px] text-aura-muted font-mono">#{p.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-aura-text">
                        {categories.find(c => c.id === p.category_id)?.name || 'General'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-aura-text border border-aura-border">
                          {p.kitchen_station || 'Kitchen'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.is_vegetarian ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                          {p.is_vegetarian ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-aura-text text-sm">{currency}{p.base_price}</td>
                      <td className="p-3.5 font-mono text-aura-muted">{currency}{p.cost_price || Math.round(p.base_price * 0.3)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{margin}%</td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-aura-border text-aura-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="dishes"
          />
        </div>
      )}

      {/* MODAL: ADD DISH WITH PHOTO UPLOADER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-aura-card rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-aura-text">Add New Menu Dish</h3>
                  <p className="text-xs text-aura-muted">Create dish with photo, pricing, and station routing</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-aura-muted hover:text-aura-text p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dish Name */}
              <div>
                <label className="font-semibold text-aura-text mb-1 block">Dish / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Hyderabadi Dum Biryani"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              {/* PHOTO UPLOAD & SELECTION SECTION */}
              <div className="p-3.5 rounded-xl bg-aura-bg/80 border border-aura-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-aura-text flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Dish Photo (Upload or Select)</span>
                  </label>
                  
                  {/* Mode switcher tabs */}
                  <div className="flex bg-aura-card p-0.5 rounded-lg border border-aura-border text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'upload' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('preset')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'preset' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Gallery Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'url' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {/* Upload from Device tab */}
                {imageUploadMode === 'upload' && (
                  <div>
                    <input 
                      type="file" 
                      ref={addFileInputRef} 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, false)} 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => addFileInputRef.current?.click()}
                      className="border-2 border-dashed border-aura-border hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer bg-aura-card/60 transition-colors flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <Upload className="w-6 h-6 text-aura-muted group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold text-xs text-aura-text">Click to browse or drop food photo here</span>
                      <span className="text-[10px] text-aura-muted">Supports JPG, PNG, WebP up to 5MB</span>
                    </div>
                  </div>
                )}

                {/* Gallery Presets tab */}
                {imageUploadMode === 'preset' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                    {FOOD_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewProdImageUrl(preset.url)}
                        className={`p-1 rounded-lg border text-left flex flex-col items-center transition-all ${newProdImageUrl === preset.url ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500' : 'border-aura-border bg-aura-card hover:border-zinc-400'}`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-md mb-1" />
                        <span className="text-[10px] font-bold text-aura-text truncate w-full text-center">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Web Link tab */}
                {imageUploadMode === 'url' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Paste direct image URL (https://...)"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text font-mono focus:outline-none"
                    />
                  </div>
                )}

                {/* Live Image Preview */}
                {newProdImageUrl && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-aura-card border border-aura-border">
                    <div className="flex items-center gap-2">
                      <img src={newProdImageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-aura-border" />
                      <div>
                        <span className="text-xs font-bold text-aura-text block">Photo Selected</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready to save
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl('')}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Selling Price ({currency}) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm text-aura-text font-black font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Estimated Food Cost ({currency})</label>
                  <input
                    type="number"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm text-aura-text font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Station */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Category *</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Kitchen Station</label>
                  <select
                    value={newProdStation}
                    onChange={(e) => setNewProdStation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none"
                  >
                    <option value="Kitchen">Main Kitchen</option>
                    <option value="Grill">Grill / Tandoor</option>
                    <option value="Bar">Bar & Juices</option>
                    <option value="Bakery">Bakery & Oven</option>
                  </select>
                </div>
              </div>

              {/* Dietary Checkbox */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-aura-bg border border-aura-border">
                <input
                  type="checkbox"
                  id="addVegCheck"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="rounded border-zinc-300 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="addVegCheck" className="text-aura-text font-bold cursor-pointer">
                  Vegetarian Preparation
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-aura-border">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProduct}
                className="btn-primary px-5 py-2 font-bold"
              >
                Save & Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DISH WITH PHOTO UPLOADER */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-aura-card rounded-2xl p-6 border border-aura-border shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-aura-text">Edit Dish & Photo</h3>
                  <p className="text-xs text-aura-muted">Update details, photo, and pricing for {editingProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-aura-muted hover:text-aura-text p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dish Name */}
              <div>
                <label className="font-semibold text-aura-text mb-1 block">Dish / Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none"
                />
              </div>

              {/* PHOTO UPLOAD & SELECTION SECTION */}
              <div className="p-3.5 rounded-xl bg-aura-bg/80 border border-aura-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-aura-text flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Dish Photo (Upload or Select)</span>
                  </label>
                  
                  {/* Mode switcher tabs */}
                  <div className="flex bg-aura-card p-0.5 rounded-lg border border-aura-border text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'upload' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('preset')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'preset' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Gallery Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all ${imageUploadMode === 'url' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' : 'text-aura-muted'}`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {/* Upload from Device tab */}
                {imageUploadMode === 'upload' && (
                  <div>
                    <input 
                      type="file" 
                      ref={editFileInputRef} 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, true)} 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => editFileInputRef.current?.click()}
                      className="border-2 border-dashed border-aura-border hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer bg-aura-card/60 transition-colors flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <Upload className="w-6 h-6 text-aura-muted group-hover:text-amber-500 transition-colors" />
                      <span className="font-bold text-xs text-aura-text">Click to browse or drop new food photo</span>
                      <span className="text-[10px] text-aura-muted">Supports JPG, PNG, WebP up to 5MB</span>
                    </div>
                  </div>
                )}

                {/* Gallery Presets tab */}
                {imageUploadMode === 'preset' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                    {FOOD_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditImageUrl(preset.url)}
                        className={`p-1 rounded-lg border text-left flex flex-col items-center transition-all ${editImageUrl === preset.url ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500' : 'border-aura-border bg-aura-card hover:border-zinc-400'}`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-md mb-1" />
                        <span className="text-[10px] font-bold text-aura-text truncate w-full text-center">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Web Link tab */}
                {imageUploadMode === 'url' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Paste direct image URL (https://...)"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text font-mono focus:outline-none"
                    />
                  </div>
                )}

                {/* Live Image Preview */}
                {editImageUrl && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-aura-card border border-aura-border">
                    <div className="flex items-center gap-2">
                      <img src={editImageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-aura-border" />
                      <div>
                        <span className="text-xs font-bold text-aura-text block">Current Photo</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Selling Price ({currency}) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm text-aura-text font-black font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Cost Price ({currency})</label>
                  <input
                    type="number"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm text-aura-text font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Station */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Category</label>
                  <select
                    value={editCat}
                    onChange={(e) => setEditCat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-aura-text mb-1 block">Kitchen Station</label>
                  <select
                    value={editStation}
                    onChange={(e) => setEditStation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-xs text-aura-text font-bold focus:outline-none"
                  >
                    <option value="Kitchen">Main Kitchen</option>
                    <option value="Grill">Grill / Tandoor</option>
                    <option value="Bar">Bar & Juices</option>
                    <option value="Bakery">Bakery & Oven</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-aura-bg border border-aura-border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editVegCheck"
                    checked={editIsVeg}
                    onChange={(e) => setEditIsVeg(e.target.checked)}
                    className="rounded border-zinc-300 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="editVegCheck" className="text-aura-text font-bold cursor-pointer">
                    Vegetarian
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editAvailableCheck"
                    checked={editIsAvailable}
                    onChange={(e) => setEditIsAvailable(e.target.checked)}
                    className="rounded border-zinc-300 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="editAvailableCheck" className="text-aura-text font-bold cursor-pointer">
                    Available in POS
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-aura-border">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn-primary px-5 py-2 font-bold"
              >
                Update Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
