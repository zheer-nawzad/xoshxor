import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, Order, Table, User } from './types';
import { sampleMenuItems } from './sample-data';
import { v4 as uuidv4 } from 'uuid';
import { wsManager, WS_EVENTS } from './websocket';

interface AppState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Menu Items
  menuItems: MenuItem[];
  addMenuItem: (menuItem: MenuItem) => void;
  updateMenuItem: (id: string, menuItem: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => string;
  updateOrder: (id: string, orderUpdate: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  // Tables
  tables: Table[];
  updateTableStatus: (id: number, status: Table['status'], orderId?: string) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Menu Items
      menuItems: sampleMenuItems,
      addMenuItem: (menuItem) => {
        const newItem = { ...menuItem, id: uuidv4() };
        set((state) => ({ 
          menuItems: [...state.menuItems, newItem] 
        }));

        // Broadcast menu addition to all connected devices
        wsManager.send(WS_EVENTS.MENU_UPDATED, { 
          type: 'added',
          menuItem: newItem
        });
      },
      updateMenuItem: (id, menuItem) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) => 
            item.id === id ? { ...item, ...menuItem } : item
          ),
        }));

        // Broadcast menu update to all connected devices
        const state = useAppStore.getState();
        const updatedItem = state.menuItems.find(m => m.id === id);
        if (updatedItem) {
          wsManager.send(WS_EVENTS.MENU_UPDATED, { 
            type: 'updated',
            menuItem: updatedItem
          });
        }
      },
      deleteMenuItem: (id) => {
        const state = useAppStore.getState();
        const menuItem = state.menuItems.find(m => m.id === id);
        
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));

        // Broadcast menu deletion to all connected devices
        if (menuItem) {
          wsManager.send(WS_EVENTS.MENU_UPDATED, { 
            type: 'deleted',
            menuItem
          });
        }
      },
        
      // Orders
      orders: [],
      addOrder: (order) => {
        const state = useAppStore.getState();
        const nextOrderNumber = state.orders.length + 1;
        const id = nextOrderNumber.toString();
        const newOrder = {
          ...order,
          id,
          timestamp: new Date().toISOString(),
          isPrinted: false,
        };
        
        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        // Broadcast new order to all connected devices
        wsManager.send(WS_EVENTS.ORDER_CREATED, { order: newOrder });
        
        return id;
      },
      updateOrder: (id, orderUpdate) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, ...orderUpdate } : order
          ),
        }));

        // Broadcast order update to all connected devices
        const state = useAppStore.getState();
        const updatedOrder = state.orders.find(o => o.id === id);
        if (updatedOrder) {
          wsManager.send(WS_EVENTS.ORDER_UPDATED, { order: updatedOrder });
        }
      },
      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        })),
        
      // Tables
      tables: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        status: 'available',
        capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
      })),
      updateTableStatus: (id, status, orderId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id
              ? { ...table, status, currentOrderId: orderId }
              : table
          ),
        }));

        // Broadcast table update to all connected devices
        const state = useAppStore.getState();
        const updatedTable = state.tables.find(t => t.id === id);
        if (updatedTable) {
          wsManager.send(WS_EVENTS.TABLE_UPDATED, { table: updatedTable });
        }
      },
        
      // UI State
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'restaurant-management-store',
    }
  )
);