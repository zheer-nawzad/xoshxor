import { useState, useEffect } from 'react';
import { Order, subscribeToOrders, addOrder as addSupabaseOrder, updateOrderStatus as updateSupabaseOrderStatus } from '../lib/supabase';

export const useSupabaseOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('🔌 Connecting to Supabase...');
    
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders || []);
      setLoading(false);
      setConnected(true);
      console.log('✅ Supabase connected, orders loaded:', newOrders?.length || 0);
    });

    return () => {
      console.log('🔌 Disconnecting from Supabase...');
      unsubscribe();
    };
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addSupabaseOrder(order);
    } catch (error) {
      console.error('❌ Failed to add order:', error);
      setConnected(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateSupabaseOrderStatus(orderId, status);
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      setConnected(false);
    }
  };

  return {
    orders,
    loading,
    connected,
    addOrder,
    updateOrderStatus
  };
};