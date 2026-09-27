import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface PosState {
  cart: CartItem[];
  selectedTableId: string | null;
  selectedTableName: string | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'quick_sale';
  customerName: string;
  customerPhone: string;
  discountAmount: number;
  notes: string;
  heldOrders: Array<{
    id: string;
    cart: CartItem[];
    tableName?: string;
    timestamp: string;
  }>;

  // Actions
  addToCart: (product: Product, quantity?: number, variant?: { id?: string; name: string; price: number } | string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedTable: (tableId: string | null, tableName?: string | null) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery' | 'quick_sale') => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setDiscount: (amount: number) => void;
  holdCurrentOrder: () => void;
  restoreHeldOrder: (id: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedTableId: null,
  selectedTableName: null,
  orderType: 'dine_in',
  customerName: '',
  customerPhone: '',
  discountAmount: 0,
  notes: '',
  heldOrders: [],

  addToCart: (product: Product, quantity = 1, variant?: { id?: string; name: string; price: number } | string) => {
    const { cart } = get();
    const variantName = typeof variant === 'object' ? variant.name : variant;
    const variantId = typeof variant === 'object' ? variant.id : undefined;
    const unitPrice = typeof variant === 'object' && variant.price !== undefined ? variant.price : product.base_price;

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.variant_name === variantName
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      set({ cart: updated });
    } else {
      set({
        cart: [
          ...cart,
          {
            product_id: product.id,
            product_name: product.name,
            variant_id: variantId,
            variant_name: variantName,
            unit_price: unitPrice,
            quantity,
            kitchen_station: product.kitchen_station || 'Kitchen',
          },
        ],
      });
    }
  },

  removeFromCart: (productId: string) => {
    set({ cart: get().cart.filter((item) => item.product_id !== productId) });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({
      cart: [],
      selectedTableId: null,
      selectedTableName: null,
      customerName: '',
      customerPhone: '',
      discountAmount: 0,
      notes: '',
    });
  },

  setSelectedTable: (tableId, tableName) => {
    set({ selectedTableId: tableId, selectedTableName: tableName || null });
  },

  setOrderType: (type) => set({ orderType: type }),
  setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
  setDiscount: (amount) => set({ discountAmount: amount }),

  holdCurrentOrder: () => {
    const { cart, selectedTableName, heldOrders } = get();
    if (cart.length === 0) return;
    const newHeld = [
      ...heldOrders,
      {
        id: `held-${Date.now()}`,
        cart: [...cart],
        tableName: selectedTableName || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    set({ heldOrders: newHeld });
    get().clearCart();
  },

  restoreHeldOrder: (id: string) => {
    const target = get().heldOrders.find((h) => h.id === id);
    if (!target) return;
    set({
      cart: target.cart,
      selectedTableName: target.tableName || null,
      heldOrders: get().heldOrders.filter((h) => h.id !== id),
    });
  },
}));
