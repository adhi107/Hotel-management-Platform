import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  Utensils, 
  Clock,
  Sparkles,
  ShoppingBag,
  X,
  ChevronRight,
  ArrowLeft,
  Users,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { usePosStore } from '../../stores/posStore';
import { useToast } from '../../context/ToastContext';
import { Product, Category, TableItem } from '../../types';

import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../../utils/defaultCatalog';

export const PosView: React.FC = () => {
  const { tenant } = useAuthStore();
  const toast = useToast();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    clearCart, 
    selectedTableId, 
    selectedTableName, 
    setSelectedTable, 
    orderType, 
    setOrderType,
    customerName,
    customerPhone,
    setCustomerInfo,
    heldOrders,
    holdCurrentOrder,
    restoreHeldOrder
  } = usePosStore();

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [mobilePosView, setMobilePosView] = useState<'catalog' | 'cart'>('catalog');
  
  // Split payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cashTender, setCashTender] = useState<number>(0);
  const [upiTender, setUpiTender] = useState<number>(0);
  const [cardTender, setCardTender] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, tRes] = await Promise.all([
          api.get('/menu/products'),
          api.get('/menu/categories'),
          api.get('/tables/')
        ]);
        const pList = pRes.data.data?.length > 0 ? pRes.data.data : DEFAULT_PRODUCTS;
        const cList = cRes.data.data?.length > 0 ? cRes.data.data : DEFAULT_CATEGORIES;
        setProducts(pList);
        setCategories(cList);
        setTables(tRes.data.data || []);
      } catch (err) {
        setProducts(DEFAULT_PRODUCTS);
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    fetchData();
  }, []);

  // Keyboard shortcuts (F1-F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setOrderType('dine_in');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setOrderType('takeaway');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setOrderType('delivery');
      } else if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsPaymentModalOpen(false);
        setSelectedProductForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, setOrderType]);

  const currency = tenant?.config?.currency_symbol || '₹';

  // Subtotals
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const taxPct = tenant?.config?.tax_percent ?? 5.0;
  const taxAmount = Math.round(subtotal * (taxPct / 100) * 100) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleOpenPayment = () => {
    setUpiTender(grandTotal);
    setCashTender(0);
    setCardTender(0);
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payments = [];
      if (upiTender > 0) payments.push({ method: 'upi', amount: upiTender, transaction_ref: `UPI-${Date.now()}` });
      if (cashTender > 0) payments.push({ method: 'cash', amount: cashTender, transaction_ref: `CASH-${Date.now()}` });
      if (cardTender > 0) payments.push({ method: 'card', amount: cardTender, transaction_ref: `CARD-${Date.now()}` });

      const payload = {
        order_type: orderType,
        table_id: selectedTableId || undefined,
        table_number: selectedTableName || undefined,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        items: cart.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          product_id: item.product_id,
          product_name: item.product_name,
          variant_id: item.variant_id || undefined,
          variant_name: item.variant_name || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          kitchen_station: item.kitchen_station || 'Kitchen',
          status: 'pending',
          notes: item.notes || ''
        })),
        payments: payments.length > 0 ? payments : [{ method: 'cash', amount: grandTotal }]
      };

      const res = await api.post('/pos/orders', payload);
      setLastOrder(res.data.data);
      clearCart();
      setIsPaymentModalOpen(false);
      setMobilePosView('catalog');
      toast.success('Order Completed', `Bill #${res.data.data?.order_number || '101'} paid ${currency}${grandTotal.toFixed(2)}`);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      toast.error('Checkout Failed', err.response?.data?.error?.message || 'Order submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        order_type: orderType,
        table_id: selectedTableId || undefined,
        table_number: selectedTableName || undefined,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        items: cart.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          product_id: item.product_id,
          product_name: item.product_name,
          variant_id: item.variant_id || undefined,
          variant_name: item.variant_name || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          kitchen_station: item.kitchen_station || 'Kitchen',
          status: 'pending',
          notes: item.notes || ''
        })),
        payments: []
      };

      const res = await api.post('/pos/orders', payload);
      setLastOrder(res.data.data);
      clearCart();
      setMobilePosView('catalog');
      toast.success('Sent to Kitchen', `Ticket #${res.data.data?.order_number || '101'} sent to KDS for ${selectedTableName ? `Table ${selectedTableName}` : orderType}.`);
    } catch (err: any) {
      console.error('KDS dispatch failed:', err);
      toast.error('Error', err.response?.data?.error?.message || 'Failed to dispatch ticket to kitchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto font-sans relative pb-36 lg:pb-4 min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden">
      
      {/* Mobile Top Segmented Tab Switcher (Catalog vs Cart) */}
      <div className="flex lg:hidden items-center justify-between bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shrink-0">
        <button
          onClick={() => setMobilePosView('catalog')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobilePosView === 'catalog'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md ring-1 ring-zinc-900/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu Catalog</span>
        </button>

        <button
          onClick={() => setMobilePosView('cart')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobilePosView === 'cart'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md ring-1 ring-zinc-900/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ticket ({totalItemsCount})</span>
          {totalItemsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-tight">
              {currency}{grandTotal.toFixed(0)}
            </span>
          )}
        </button>
      </div>

      {/* Left Area: Mode selector, Search, Products Catalog */}
      <div className={`flex-1 flex flex-col min-w-0 space-y-3 overflow-hidden ${
        mobilePosView === 'cart' ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Order Type & Table Selection Bar */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Order Type Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto">
              {[
                { id: 'dine_in', label: 'Dine-In' },
                { id: 'takeaway', label: 'Takeaway' },
                { id: 'delivery', label: 'Delivery' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setOrderType(t.id as any)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderType === t.id
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Selected summary badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span>Station: <strong className="text-zinc-800 dark:text-zinc-200">Main Counter</strong></span>
            </div>
          </div>

          {/* Dedicated Table Picker if Dine-In */}
          {orderType === 'dine_in' && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Tables:
              </span>
              
              <button
                onClick={() => setSelectedTable(null, null)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  !selectedTableId
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                Auto / Walk-in
              </button>

              {tables.map(tbl => {
                const isSelected = selectedTableId === tbl.id;
                const isOccupied = tbl.status === 'occupied';
                return (
                  <button
                    key={tbl.id}
                    onClick={() => setSelectedTable(tbl.id, tbl.table_number)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                        : isOccupied
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : isOccupied ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>Table {tbl.table_number}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search & Category Filter Chips */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes, drinks, combos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with Food Images & Safe Mobile Scroll Clearance */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1 pb-36 sm:pb-32 lg:pb-6">
          {filteredProducts.map(p => {
            const itemInCart = cart.find(i => i.product_id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.variants && p.variants.length > 0) {
                    setSelectedProductForModal(p);
                  } else {
                    addToCart(p);
                  }
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[190px] transition-all group shadow-xs cursor-pointer active:scale-[0.97] relative overflow-hidden ${
                  itemInCart
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-950 dark:border-white shadow-md ring-2 ring-zinc-950 dark:ring-white'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm'
                }`}
              >
                <div className="w-full">
                  {/* Dish Image Thumbnail with Overlay Badges */}
                  <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2.5 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
                    {p.image_url ? (
                      <img 
                        src={p.image_url} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}

                    {/* Fallback Icon when no image */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 -z-0">
                      <Utensils className="w-7 h-7 opacity-70" />
                      <span className="text-[9px] font-bold uppercase mt-1 tracking-wider opacity-60">
                        {p.kitchen_station || 'Dish'}
                      </span>
                    </div>

                    {/* Station badge (top-left) */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className="backdrop-blur-md bg-black/70 text-white border border-white/20 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        {p.kitchen_station || 'Kitchen'}
                      </span>
                    </div>

                    {/* Dietary / In-Cart counter (top-right) */}
                    <div className="absolute top-1.5 right-1.5 z-10">
                      {itemInCart ? (
                        <span className="w-5 h-5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-[10px] flex items-center justify-center shadow-md ring-1 ring-white">
                          {itemInCart.quantity}
                        </span>
                      ) : (
                        <span className={`w-3 h-3 rounded-full block shadow-sm ring-2 ring-white dark:ring-zinc-900 ${p.is_vegetarian ? 'bg-emerald-500' : 'bg-rose-500'}`} title={p.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'} />
                      )}
                    </div>
                  </div>

                  {/* Dish Name */}
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-2 leading-tight">
                    {p.name}
                  </h4>
                </div>

                {/* Price and Add action */}
                <div className="flex items-baseline justify-between mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full">
                  <span className="text-sm sm:text-base font-black text-zinc-950 dark:text-white font-mono">
                    {currency}{p.base_price}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                    itemInCart 
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950'
                  }`}>
                    {itemInCart ? `+${itemInCart.quantity}` : '+ Add'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Floating Checkout Pill Bar (Always visible and positioned cleanly) */}
        {totalItemsCount > 0 && mobilePosView === 'catalog' && (
          <div className="fixed bottom-[74px] left-3.5 right-3.5 z-30 lg:hidden animate-in slide-in-from-bottom-3 duration-200">
            <button
              onClick={() => setMobilePosView('cart')}
              className="w-full h-13 px-4 rounded-2xl bg-zinc-950/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-950 shadow-2xl border border-zinc-800 dark:border-zinc-200 flex items-center justify-between font-extrabold text-xs cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white/20 dark:bg-zinc-950/20 flex items-center justify-center text-xs font-black">
                  {totalItemsCount}
                </span>
                <span className="tracking-wide">View Current Ticket</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="font-black">{currency}{grandTotal.toFixed(2)}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Cart & Billing Checkout Panel (Right / Mobile Full View) */}
      <div className={`w-full lg:w-96 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col p-4 sm:p-5 shrink-0 justify-between space-y-3 lg:h-full ${
        mobilePosView === 'catalog' ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
            <div>
              <div className="flex items-center gap-2">
                {mobilePosView === 'cart' && (
                  <button
                    onClick={() => setMobilePosView('catalog')}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-zinc-900 dark:text-white" />
                  </button>
                )}
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Current Ticket</h3>
              </div>
              <p className="text-[11px] text-zinc-500 uppercase font-medium mt-0.5">
                {orderType.replace('_', ' ')} {selectedTableName ? `• Table ${selectedTableName}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {cart.length > 0 && (
                <button
                  onClick={holdCurrentOrder}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Hold Order"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Hold
                </button>
              )}
              {cart.length > 0 && (
                <button 
                  onClick={clearCart} 
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Held Orders quick banner */}
          {heldOrders.length > 0 && (
            <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5" /> {heldOrders.length} Held Order(s)
              </span>
              <button
                onClick={() => restoreHeldOrder(heldOrders[0].id)}
                className="text-[11px] text-zinc-900 dark:text-white font-bold hover:underline cursor-pointer"
              >
                Resume #{heldOrders[0].id.slice(-4)}
              </button>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.product_id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.product_name}</p>
                    {item.variant_name && <p className="text-[10px] text-zinc-500 font-semibold">{item.variant_name}</p>}
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{currency}{item.unit_price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-zinc-900 dark:text-white font-bold cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-400 text-xs text-center p-4">
                <ShoppingBag className="w-10 h-10 opacity-30 mb-2" />
                <p className="font-bold text-zinc-600 dark:text-zinc-300">Ticket is currently empty</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Click dishes from the catalog to add to ticket.</p>
                {mobilePosView === 'cart' && (
                  <button
                    onClick={() => setMobilePosView('catalog')}
                    className="mt-3 px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs"
                  >
                    Open Menu Catalog
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Subtotal</span>
              <span className="font-mono">{currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Taxes ({taxPct}%)</span>
              <span className="font-mono">{currency}{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-zinc-950 dark:text-white pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
              <span>Grand Total</span>
              <span className="font-mono text-xl">{currency}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons: KDS & Pay */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || isSubmitting}
              className="h-11 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Send KDS</span>
            </button>

            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0 || isSubmitting}
              className="h-11 px-3 rounded-xl bg-zinc-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay (F4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 text-zinc-900 dark:text-white font-sans my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-sm">{selectedProductForModal.name}</h3>
                <p className="text-xs text-zinc-500">Choose size or portion</p>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedProductForModal.variants?.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    addToCart(selectedProductForModal, 1, v);
                    setSelectedProductForModal(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between hover:border-zinc-400 dark:hover:border-zinc-500 transition-all cursor-pointer text-left"
                >
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">{v.name}</span>
                  <span className="font-mono font-black text-xs text-zinc-950 dark:text-white">{currency}{v.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-5 text-zinc-900 dark:text-white font-sans my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-sm">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Settle Payment</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Bill Total: {currency}{grandTotal.toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>UPI / QR Payment</span>
                  <button 
                    type="button" 
                    onClick={() => { setUpiTender(grandTotal); setCashTender(0); setCardTender(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium"
                  >
                    Set Full
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-zinc-400">{currency}</span>
                  <input
                    type="number"
                    value={upiTender}
                    onChange={(e) => setUpiTender(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Cash Tendered</span>
                  <button 
                    type="button" 
                    onClick={() => { setCashTender(grandTotal); setUpiTender(0); setCardTender(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium"
                  >
                    Set Full
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-zinc-400">{currency}</span>
                  <input
                    type="number"
                    value={cashTender}
                    onChange={(e) => setCashTender(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Card / POS Swipe</span>
                  <button 
                    type="button" 
                    onClick={() => { setCardTender(grandTotal); setUpiTender(0); setCashTender(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-medium"
                  >
                    Set Full
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-zinc-400">{currency}</span>
                  <input
                    type="number"
                    value={cardTender}
                    onChange={(e) => setCardTender(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : `Complete ${currency}${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

