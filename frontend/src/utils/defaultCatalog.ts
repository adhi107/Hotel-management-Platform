import { Product, Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-beverages', name: 'Fresh Beverages & Juices', slug: 'beverages', sort_order: 1 },
  { id: 'cat-mains', name: 'Signature Gourmet Mains', slug: 'mains', sort_order: 2 },
  { id: 'cat-specials', name: 'Chef Special Bites', slug: 'specials', sort_order: 3 },
  { id: 'cat-desserts', name: 'Artisan Desserts', slug: 'desserts', sort_order: 4 },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-juice-1',
    category_id: 'cat-beverages',
    name: 'Ruby Pomegranate Elixir',
    base_price: 190,
    cost_price: 45,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Bar',
    prep_time_minutes: 6,
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80'
  },
  {
    id: 'prod-juice-2',
    category_id: 'cat-beverages',
    name: 'Valencia Orange & Mint Press',
    base_price: 160,
    cost_price: 35,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Bar',
    prep_time_minutes: 5,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80'
  },
  {
    id: 'prod-coffee-1',
    category_id: 'cat-beverages',
    name: 'Single Origin Espresso Cappuccino',
    base_price: 140,
    cost_price: 30,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Bar',
    prep_time_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80'
  },
  {
    id: 'prod-chai-1',
    category_id: 'cat-beverages',
    name: 'Royal Irani Kulhad Chai',
    base_price: 40,
    cost_price: 10,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Kitchen',
    prep_time_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80'
  },
  {
    id: 'prod-main-1',
    category_id: 'cat-mains',
    name: 'Truffle & Wild Mushroom Pizza',
    base_price: 440,
    cost_price: 110,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Bakery',
    prep_time_minutes: 15,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'
  },
  {
    id: 'prod-main-2',
    category_id: 'cat-mains',
    name: 'Hyderabadi Dum Biryani (Pot)',
    base_price: 380,
    cost_price: 95,
    is_available: true,
    is_vegetarian: false,
    kitchen_station: 'Kitchen',
    prep_time_minutes: 14,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80'
  },
  {
    id: 'prod-main-3',
    category_id: 'cat-mains',
    name: 'Smash Angus Gourmet Burger',
    base_price: 320,
    cost_price: 80,
    is_available: true,
    is_vegetarian: false,
    kitchen_station: 'Grill',
    prep_time_minutes: 12,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
  },
  {
    id: 'prod-dessert-1',
    category_id: 'cat-desserts',
    name: 'Belgian Molten Lava Cake',
    base_price: 220,
    cost_price: 50,
    is_available: true,
    is_vegetarian: true,
    kitchen_station: 'Bakery',
    prep_time_minutes: 8,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80'
  }
];
