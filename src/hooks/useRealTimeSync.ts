import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { wsManager, WS_EVENTS } from '@/lib/websocket';
import { Order, Table, MenuItem } from '@/lib/types';

export function useRealTimeSync() {
  const [isConnected, setIsConnected] = useState(false);
  const { 
    orders, 
    tables, 
    menuItems,
    updateOrder,
    updateTableStatus,
    addOrder
  } = useAppStore();

  useEffect(() => {
    console.log('🚀 Initializing real-time synchronization...');
    
    // Handle incoming order created
    const handleOrderCreated = (data: { order: Order }) => {
      console.log('📨 Received new order:', data.order);
      const existingOrder = orders.find(o => o.id === data.order.id);
      if (!existingOrder) {
        // Add the order to store
        useAppStore.setState(state => ({
          orders: [...state.orders, data.order]
        }));
        
        // Update table status
        updateTableStatus(data.order.tableNumber, 'occupied');
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🍽️ New Order #${data.order.id}`, {
            body: `Table ${data.order.tableNumber} - ${data.order.items.length} items`,
            icon: '/favicon.svg'
          });
        }
      }
    };

    // Handle incoming order updates
    const handleOrderUpdated = (data: { order: Order }) => {
      console.log('📨 Received order update:', data.order);
      updateOrder(data.order.id, data.order);
      
      // Show notification for status changes
      if ('Notification' in window && Notification.permission === 'granted') {
        const statusMessages = {
          'preparing': '👨‍🍳 Order is being prepared',
          'ready': '✅ Order is ready for pickup',
          'served': '🍽️ Order has been served',
          'paid': '💰 Payment completed'
        };
        
        const message = statusMessages[data.order.status as keyof typeof statusMessages];
        if (message) {
          new Notification(`Order #${data.order.id}`, {
            body: message,
            icon: '/favicon.svg'
          });
        }
      }
    };

    // Handle incoming table updates
    const handleTableUpdated = (data: { table: Table }) => {
      console.log('📨 Received table update:', data.table);
      updateTableStatus(data.table.number, data.table.status);
    };

    // Handle incoming menu updates
    const handleMenuUpdated = (data: { type: 'added' | 'updated' | 'deleted', menuItem: MenuItem }) => {
      console.log('📨 Received menu update:', data);
      useAppStore.setState(state => {
        if (data.type === 'added') {
          const exists = state.menuItems.find(m => m.id === data.menuItem.id);
          if (!exists) {
            return { menuItems: [...state.menuItems, data.menuItem] };
          }
        } else if (data.type === 'updated') {
          return {
            menuItems: state.menuItems.map(item =>
              item.id === data.menuItem.id ? data.menuItem : item
            )
          };
        } else if (data.type === 'deleted') {
          return {
            menuItems: state.menuItems.filter(item => item.id !== data.menuItem.id)
          };
        }
        return state;
      });
    };

    // Subscribe to WebSocket events
    wsManager.subscribe(WS_EVENTS.ORDER_CREATED, handleOrderCreated);
    wsManager.subscribe(WS_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    wsManager.subscribe(WS_EVENTS.TABLE_UPDATED, handleTableUpdated);
    wsManager.subscribe(WS_EVENTS.MENU_UPDATED, handleMenuUpdated);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Set connection status
    setIsConnected(true);

    // Cleanup subscriptions
    return () => {
      wsManager.unsubscribe(WS_EVENTS.ORDER_CREATED, handleOrderCreated);
      wsManager.unsubscribe(WS_EVENTS.ORDER_UPDATED, handleOrderUpdated);
      wsManager.unsubscribe(WS_EVENTS.TABLE_UPDATED, handleTableUpdated);
      wsManager.unsubscribe(WS_EVENTS.MENU_UPDATED, handleMenuUpdated);
    };
  }, []);

  return {
    isConnected
  };
}