import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llrghjwplmbpikgxogeb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscmdoandwbG1icGlrZ3hvZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODM1MjEsImV4cCI6MjA3MzQ1OTUyMX0.zl_OjuV6G6Zr34_kyb-IrrAsrqDTDeeNXVAUxumf7CA';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Order {
  id?: string;
  table_number: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

// Add new order
export const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('app_4fbaf34608_orders')
      .insert([order])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Order added:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error adding order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    const { data, error } = await supabase
      .from('app_4fbaf34608_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Order status updated:', orderId, status);
    return data;
  } catch (error) {
    console.error('❌ Error updating order:', error);
    throw error;
  }
};

// Get all orders
export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('app_4fbaf34608_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
};

// Subscribe to real-time order changes
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  console.log('🔌 Subscribing to real-time orders...');
  
  // Get initial data
  getOrders().then(callback);

  // Subscribe to changes
  const subscription = supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_4fbaf34608_orders'
      },
      () => {
        console.log('🔄 Order changed, fetching latest data...');
        getOrders().then(callback);
      }
    )
    .subscribe();

  return () => {
    console.log('🔌 Unsubscribing from orders...');
    subscription.unsubscribe();
  };
};