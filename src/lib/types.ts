export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialRequests?: string;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  specialRequests?: string;
  timestamp: string;
  total: number;
  isPrinted: boolean;
}

export interface Table {
  id: number;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  currentOrderId?: string;
}

export type UserRole = 'waiter' | 'kitchen' | 'cashier' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}