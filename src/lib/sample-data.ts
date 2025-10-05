import { MenuItem } from './types';

export const sampleMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: '1',
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs',
    price: 7800,
    category: 'appetizers',
    image: '/images/GarlicBread.jpg',
  },
  {
    id: '2',
    name: 'Bruschetta',
    description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
    price: 10400,
    category: 'appetizers',
    image: '/assets/bruschetta.jpg',
  },
  {
    id: '3',
    name: 'Mozzarella Sticks',
    description: 'Breaded mozzarella sticks served with marinara sauce',
    price: 11700,
    category: 'appetizers',
    image: '/assets/mozzarella-sticks.jpg',
  },
  
  // Main Courses
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 16900,
    category: 'main',
    image: '/assets/margherita-pizza.jpg',
  },
  {
    id: '5',
    name: 'Spaghetti Bolognese',
    description: 'Spaghetti pasta with rich meat sauce',
    price: 19500,
    category: 'main',
    image: '/assets/spaghetti-bolognese.jpg',
  },
  {
    id: '6',
    name: 'Grilled Salmon',
    description: 'Fresh salmon fillet grilled with herbs and served with vegetables',
    price: 24700,
    category: 'main',
    image: '/assets/grilled-salmon.jpg',
  },
  {
    id: '7',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast topped with tomato sauce and melted cheese',
    price: 22100,
    category: 'main',
    image: '/assets/chicken-parmesan.jpg',
  },
  
  // Sides
  {
    id: '8',
    name: 'French Fries',
    description: 'Crispy golden fries served with ketchup',
    price: 5200,
    category: 'sides',
    image: '/assets/french-fries.jpg',
  },
  {
    id: '9',
    name: 'Side Salad',
    description: 'Fresh garden salad with house dressing',
    price: 6500,
    category: 'sides',
    image: '/assets/side-salad.jpg',
  },
  
  // Desserts
  {
    id: '10',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate ganache',
    price: 9100,
    category: 'desserts',
    image: '/assets/chocolate-cake.jpg',
  },
  {
    id: '11',
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 10400,
    category: 'desserts',
    image: '/assets/cheesecake.jpg',
  },
  
  // Drinks
  {
    id: '12',
    name: 'Soft Drink',
    description: 'Cola, lemon-lime, or orange soda',
    price: 3900,
    category: 'drinks',
    image: '/assets/soft-drink.jpg',
  },
  {
    id: '13',
    name: 'Iced Tea',
    description: 'Fresh brewed iced tea, sweetened or unsweetened',
    price: 3900,
    category: 'drinks',
    image: '/assets/iced-tea.jpg',
  },
  {
    id: '14',
    name: 'Coffee',
    description: 'Freshly brewed coffee, regular or decaf',
    price: 4500,
    category: 'drinks',
    image: '/images/Coffee.jpg',
  },
];