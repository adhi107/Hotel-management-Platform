export type BusinessType = 
  | 'Restaurant'
  | 'Cafe'
  | 'Juice Center'
  | 'Tea Shop'
  | 'Coffee Shop'
  | 'Bakery'
  | 'Sweet Shop'
  | 'Ice Cream Shop'
  | 'Tiffin Center'
  | 'Fast Food'
  | 'QSR'
  | 'Food Stall'
  | 'Food Truck'
  | 'Cloud Kitchen'
  | 'Home Kitchen'
  | 'Catering'
  | 'Bar'
  | 'Custom';

export type BusinessSize = 'solo' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type UiMode = 'simple' | 'standard' | 'advanced';

export interface FeatureFlags {
  quick_sale: boolean;
  counter_mode: boolean;
  pos: boolean;
  tables: boolean;
  floor_plan: boolean;
  kitchen_display: boolean;
  qr_ordering: boolean;
  online_ordering: boolean;
  reservations: boolean;
  delivery: boolean;
  simple_inventory: boolean;
  advanced_inventory: boolean;
  recipes: boolean;
  food_costing: boolean;
  procurement: boolean;
  crm: boolean;
  loyalty: boolean;
  khata_credit: boolean;
  day_close: boolean;
  expenses: boolean;
  employees: boolean;
  advanced_analytics: boolean;
  ai_features: boolean;
  catering?: boolean;
  multi_branch?: boolean;
  multi_brand?: boolean;
}

export interface WhiteLabelConfig {
  restaurant_name: string;
  tagline?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  currency: string;
  currency_symbol: string;
  decimal_precision: number;
  tax_percent: number;
  invoice_header?: string;
  invoice_footer?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: string;
  loyalty_points: number;
  total_spent: number;
  total_visits: number;
  average_order_value?: number;
  tags?: string[];
}


export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  assigned_branch_ids?: string[];
  tenant_id?: string;
  is_super_admin?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  business_type: BusinessType;
  business_size: BusinessSize;
  ui_mode: UiMode;
  plan: string;
  features: FeatureFlags;
  config: WhiteLabelConfig;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  table_count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
}

export interface Variant {
  id: string;
  name: string;
  price: number;
  cost_price?: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  base_price: number;
  cost_price?: number;
  tax_rate?: number;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan?: boolean;
  spice_level?: number;
  kitchen_station?: string;
  prep_time_minutes?: number;
  variants?: Variant[];
}

export interface CartItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  variant_id?: string;
  variant_name?: string;
  notes?: string;
  kitchen_station?: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'quick_sale' | 'qr_order';
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  items: Array<{
    id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    kitchen_station?: string;
    status?: string;
  }>;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  status: 'draft' | 'confirmed' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partially_paid' | 'paid';
  payments?: Array<{
    method: string;
    amount: number;
    transaction_ref?: string;
    created_at?: string;
  }>;
  created_at: string;
}

export interface TableItem {
  id: string;
  table_number: string;
  capacity: number;
  shape: 'square' | 'round' | 'rectangle';
  status: 'available' | 'occupied' | 'billing' | 'reserved' | 'cleaning';
  current_order_id?: string;
  pos_x: number;
  pos_y: number;
  section_id?: string;
  section_name?: string;
  floor_id?: string;
  floor_name?: string;
  is_active?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_cost: number;
  storage_location?: string;
  is_perishable?: boolean;
  expiry_days?: number;
  stock_status?: 'out_of_stock' | 'critical' | 'low' | 'good' | 'optimal';
  stock_percentage?: number;
  stock_value?: number;
  is_low_stock?: boolean;
  days_left_est?: number;
}

export interface InventoryTransaction {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  transaction_type: 'stock_in' | 'stock_out' | 'recipe_deduction' | 'wastage' | 'adjustment' | 'transfer';
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface InventoryAnalytics {
  total_skus: number;
  total_stock_value: number;
  out_of_stock_count: number;
  low_stock_count: number;
  healthy_stock_count: number;
  today_deductions_qty: number;
  today_stock_in_cost: number;
  today_waste_cost: number;
  critical_items?: Ingredient[];
}

export interface ReorderSuggestion {
  ingredient_id: string;
  ingredient_name: string;
  code: string;
  category: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  suggested_order_quantity: number;
  unit_cost: number;
  estimated_total_cost: number;
  urgency: string;
  storage_location: string;
}


export interface Recipe {
  id: string;
  product_id: string;
  product_name: string;
  yield_servings: number;
  total_food_cost: number;
  selling_price: number;
  food_cost_percentage: number;
  gross_margin_amount: number;
  gross_margin_percentage: number;
  ingredients: Array<{
    ingredient_name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    total_cost: number;
  }>;
}

export interface KhataRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  total_credit: number;
  total_paid: number;
  current_balance: number;
  entries: Array<{
    id: string;
    entry_type: 'credit' | 'payment';
    amount: number;
    payment_mode?: string;
    description?: string;
    created_at: string;
  }>;
}

export interface SmartAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}
