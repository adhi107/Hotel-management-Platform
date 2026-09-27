import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Utensils, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Bell, 
  ArrowRight,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../../utils/defaultCatalog';

export const CustomerOrderingView: React.FC = () => {
  const { tenant } = useAuthStore();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [tableNumber, setTableNumber] = useState('T-04');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
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
    fetchMenu();
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
    toast.success('Added to Order', `${product.name} added`);
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

  const total = cart.reduce((sum, item) => sum + item.product.base_price * item.quantity, 0);
  const currency = tenant?.config?.currency_symbol || '₹';

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      const itemsPayload = cart.map(i => ({
        id: `cust-item-${Date.now()}-${Math.random()}`,
        product_id: i.product.id,
        product_name: i.product.name,
        unit_price: i.product.base_price,
        quantity: i.quantity,
        total_price: i.product.base_price * i.quantity,
        kitchen_station: i.product.kitchen_station || 'Kitchen',
        status: 'pending'
      }));

      await api.post('/pos/orders', {
        order_type: 'qr_order',
        customer_name: `Table ${tableNumber} Guest`,
        items: itemsPayload,
        notes: `QR Table Order from ${tableNumber}`
      });

      setOrderPlaced(true);
      setCart([]);
      toast.success('Order Sent to Kitchen', 'Your order is being freshly prepared!');
    } catch (err: any) {
      toast.error('Order Failed', err.response?.data?.error?.message || 'Failed to place QR order');
    }
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    toast.info('Waiter Alerted', 'A staff member is on the way to your table.');
    setTimeout(() => setWaiterCalled(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5 pb-32 font-sans">
      {/* Branded Restaurant Cover */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 text-center space-y-2 relative overflow-hidden shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 mx-auto flex items-center justify-center font-black text-xl shadow-md">
          {tenant?.name?.charAt(0) || 'N'}
        </div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
          {tenant?.name || 'NOVAFOOD RESTAURANT'}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {tenant?.config?.tagline || 'Curated Hospitality & Fresh Flavors'}
        </p>
        
        {/* Table & Call Waiter Action */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
            Table: {tableNumber}
          </span>
          <button
            onClick={handleCallWaiter}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              waiterCalled 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{waiterCalled ? 'Staff Notified!' : 'Call Waiter'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeCategory === c.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {products
          .filter(p => activeCategory === 'all' || p.category_id === activeCategory)
          .map(p => {
            const inCart = cart.find(i => i.product.id === p.id);
            return (
              <div 
                key={p.id} 
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-100 dark:border-zinc-800" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <Utensils className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.is_vegetarian ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white truncate">{p.name}</h4>
                    </div>
                    <p className="text-xs font-black text-zinc-900 dark:text-white font-mono">{currency}{p.base_price}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{p.kitchen_station || 'Kitchen'}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(p.id, -1)}
                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 flex items-center justify-center text-zinc-900 dark:text-white font-bold cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-extrabold hover:bg-black dark:hover:bg-zinc-100 transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Floating Cart Drawer */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-2xl p-4 shadow-2xl flex items-center justify-between z-40 animate-in slide-in-from-bottom">
          <div>
            <p className="text-[11px] font-medium opacity-80">{cart.reduce((s, i) => s + i.quantity, 0)} items selected</p>
            <p className="text-base font-black font-mono">{currency}{total.toFixed(2)}</p>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Modal */}
      {orderPlaced && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 text-center space-y-4 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Order Sent to Kitchen!</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your items have been sent directly to the chef. We will bring them to Table {tableNumber} as soon as they are ready.
            </p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
