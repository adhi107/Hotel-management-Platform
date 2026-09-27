import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  Search,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Utensils,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../context/ToastContext';
import { Product, Category } from '../../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../../utils/defaultCatalog';

export const QuickSaleView: React.FC = () => {
  const { tenant } = useAuthStore();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');
  
  // Quick sale cart
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'khata'>('upi');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get('/menu/products'),
          api.get('/menu/categories')
        ]);
        const pList = pRes.data.data?.length > 0 ? pRes.data.data : DEFAULT_PRODUCTS;
        const cList = cRes.data.data?.length > 0 ? cRes.data.data : DEFAULT_CATEGORIES;
        setProducts(pList);
        setCategories(cList);
      } catch (err) {
        setProducts(DEFAULT_PRODUCTS);
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    loadData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number }>;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.base_price * item.quantity, 0);
  const taxRate = tenant?.config?.tax_percent ?? 5.0;
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const grandTotal = subtotal + tax;
  const currency = tenant?.config?.currency_symbol || '₹';

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        order_type: 'quick_sale',
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: item.product.base_price,
          total_price: item.product.base_price * item.quantity,
          quantity: item.quantity,
          kitchen_station: item.product.kitchen_station || 'Kitchen',
          status: 'completed',
          notes: ''
        })),
        payments: [
          {
            method: paymentMethod,
            amount: grandTotal,
            transaction_ref: `QS-${Date.now()}`
          }
        ]
      };

      const res = await api.post('/pos/orders', payload);
      setCompletedOrder(res.data.data);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setMobileView('catalog');
      toast.success('Sale Recorded', `Receipt #${res.data.data?.order_number || '101'} created for ${currency}${grandTotal.toFixed(2)}`);
    } catch (err: any) {
      console.error('Quick Sale checkout failed:', err);
      toast.error('Sale Failed', err.response?.data?.error?.message || 'Order creation failed.');
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
          onClick={() => setMobileView('catalog')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobileView === 'catalog'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md ring-1 ring-zinc-900/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobileView === 'cart'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md ring-1 ring-zinc-900/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({totalItemsCount})</span>
          {totalItemsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-tight">
              {currency}{grandTotal.toFixed(0)}
            </span>
          )}
        </button>
      </div>

      {/* Product Catalog Grid (Left) */}
      <div className={`flex-1 flex flex-col min-w-0 space-y-3.5 overflow-hidden ${
        mobileView === 'cart' ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-colors"
            />
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

        {/* Large Visual Touch Tiles with Dish Images */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1 pb-36 sm:pb-32 lg:pb-6">
          {filteredProducts.map(p => {
            const inCart = cart.find(i => i.product.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className={`p-3 rounded-2xl text-left flex flex-col justify-between min-h-[190px] transition-all relative overflow-hidden group border cursor-pointer active:scale-[0.97] shadow-xs ${
                  inCart 
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
                          // If image fails, replace with stylized fallback placeholder
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
                      {inCart ? (
                        <span className="w-5 h-5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-[10px] flex items-center justify-center shadow-md ring-1 ring-white">
                          {inCart.quantity}
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

                <div className="flex items-baseline justify-between mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full">
                  <span className="text-sm sm:text-base font-black text-zinc-950 dark:text-white font-mono">
                    {currency}{p.base_price}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                    inCart 
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950'
                  }`}>
                    {inCart ? `+${inCart.quantity}` : '+ Add'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Floating Checkout Pill */}
        {totalItemsCount > 0 && mobileView === 'catalog' && (
          <div className="fixed bottom-[74px] left-3.5 right-3.5 z-30 lg:hidden animate-in slide-in-from-bottom-3 duration-200">
            <button
              onClick={() => setMobileView('cart')}
              className="w-full h-13 px-4 rounded-2xl bg-zinc-950/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-950 shadow-2xl border border-zinc-800 dark:border-zinc-200 flex items-center justify-between font-extrabold text-xs cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-white/20 dark:bg-zinc-950/20 flex items-center justify-center text-xs font-black">
                  {totalItemsCount}
                </span>
                <span className="tracking-wide">View Cart & Charge</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="font-black">{currency}{grandTotal.toFixed(2)}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Quick Billing & Instant Tender Panel (Right / Mobile Full View) */}
      <div className={`w-full lg:w-96 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col p-4 sm:p-5 shrink-0 justify-between space-y-3 lg:h-full ${
        mobileView === 'catalog' ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border mb-3">
            <div className="flex items-center gap-2">
              {mobileView === 'cart' && (
                <button
                  onClick={() => setMobileView('catalog')}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-aura-text" />
                </button>
              )}
              <Zap className="w-4 h-4 text-zinc-900 dark:text-white" />
              <h3 className="font-extrabold text-sm text-aura-text">Quick Cart</h3>
              {cart.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-aura-text">
                  {totalItemsCount} items
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.product.id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.product.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{currency}{item.product.base_price} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 flex items-center justify-center text-zinc-900 dark:text-white font-bold cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-zinc-400 text-xs text-center p-4">
                <ShoppingBag className="w-9 h-9 opacity-30 mb-2" />
                <p className="font-bold text-zinc-600 dark:text-zinc-300">Cart is empty</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Tap dishes from the catalog to add.</p>
                {mobileView === 'cart' && (
                  <button
                    onClick={() => setMobileView('catalog')}
                    className="mt-3 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs"
                  >
                    Open Menu Catalog
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Optional Khata / Customer Details */}
          <div className="pt-3 border-t border-aura-border mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white"
              />
              <input
                type="text"
                placeholder="Phone (For Khata/Bill)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Totals & Instant Tender Selection */}
        <div className="pt-3 border-t border-aura-border space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Subtotal</span>
              <span className="font-mono">{currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-medium">
              <span>GST ({taxRate}%)</span>
              <span className="font-mono">{currency}{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-zinc-950 dark:text-white pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
              <span>Grand Total</span>
              <span className="font-mono text-xl">{currency}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'upi'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[10px] font-bold">UPI</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-[10px] font-bold">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] font-bold">Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('khata')}
              className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'khata'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-bold">Khata</span>
            </button>
          </div>

          {/* 1-Tap Instant Checkout CTA */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Recording Sale...' : `Charge ${currency}${grandTotal.toFixed(2)} (${paymentMethod.toUpperCase()})`}
            </span>
          </button>
        </div>
      </div>

      {/* Completed Order Modal / Printable Receipt */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Sale Completed!</h3>
              <p className="text-xs text-zinc-500">Receipt #{completedOrder.order_number}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-zinc-500">Order Total</span>
                <span className="font-bold text-zinc-950 dark:text-white font-mono">{currency}{completedOrder.grand_total}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-zinc-500">Payment Mode</span>
                <span className="font-bold uppercase text-zinc-950 dark:text-white">{completedOrder.payments?.[0]?.method || 'Paid'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-zinc-500">Items Count</span>
                <span className="text-zinc-900 dark:text-white font-mono">{completedOrder.items?.length || 0} items</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-4 h-4" /> Print Bill
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-black font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                Next Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
