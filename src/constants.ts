import { MenuItem } from './types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Espresso',
    description: 'Rich and bold double shot of espresso.',
    price: 95,
    category: 'Coffee',
    isAvailable: true,
    stock: 50,
    image: 'https://picsum.photos/seed/espresso/400/300'
  },
  {
    id: '2',
    name: 'Caramel Macchiato',
    description: 'Espresso with steamed milk and sweet caramel syrup.',
    price: 145,
    category: 'Coffee',
    isAvailable: true,
    stock: 30,
    image: 'https://picsum.photos/seed/macchiato/400/300'
  },
  {
    id: '3',
    name: 'Matcha Green Tea Latte',
    description: 'Premium matcha whisked with creamy milk.',
    price: 155,
    category: 'Tea',
    isAvailable: true,
    stock: 25,
    image: 'https://picsum.photos/seed/matcha/400/300'
  },
  {
    id: '4',
    name: 'Blueberry Muffin',
    description: 'Freshly baked muffin bursting with real blueberries.',
    price: 85,
    category: 'Pastry',
    isAvailable: true,
    stock: 15,
    image: 'https://picsum.photos/seed/muffin/400/300'
  },
  {
    id: '5',
    name: 'Chicken Pesto Pasta',
    description: 'Pasta tossed in home-made pesto sauce with grilled chicken.',
    price: 220,
    category: 'Meals',
    isAvailable: true,
    stock: 20,
    image: 'https://picsum.photos/seed/pesto/400/300'
  },
  {
    id: '6',
    name: 'Iced Americano',
    description: 'Chilled espresso with water over ice.',
    price: 110,
    category: 'Coffee',
    isAvailable: true,
    stock: 40,
    image: 'https://picsum.photos/seed/americano/400/300'
  }
];
