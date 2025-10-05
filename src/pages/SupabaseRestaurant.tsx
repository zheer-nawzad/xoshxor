import React, { useState } from 'react';
import { useSupabaseOrders } from '../hooks/useSupabaseOrders';
import { Order } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const SupabaseRestaurant: React.FC = () => {
  const { orders, loading, connected, addOrder, updateOrderStatus } = useSupabaseOrders();
  const [selectedTable, setSelectedTable] = useState('1');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleAddOrder = async () => {
    if (!itemName || !itemPrice) return;

    const newOrder: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
      table_number: parseInt(selectedTable),
      items: [{
        name: itemName,
        price: parseFloat(itemPrice),
        quantity: 1
      }],
      status: 'pending',
      total: parseFloat(itemPrice)
    };

    await addOrder(newOrder);
    setItemName('');
    setItemPrice('');
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">🔌 Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
        connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {connected ? '🟢 Supabase Connected' : '🔴 Supabase Disconnected'}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🍽️ Restaurant Management System
          </h1>
          <p className="text-gray-600">Real-time multi-device synchronization with Supabase</p>
        </div>

        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tables" className="text-lg">📋 Tables</TabsTrigger>
            <TabsTrigger value="kitchen" className="text-lg">👨‍🍳 Kitchen</TabsTrigger>
            <TabsTrigger value="billing" className="text-lg">💰 Billing</TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📋 Table Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(table => (
                        <SelectItem key={table} value={table.toString()}>
                          Table {table}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="text"
                    placeholder="Item name (e.g., Pizza)"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  
                  <Input
                    type="number"
                    placeholder="Price (e.g., 15.99)"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleAddOrder}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!itemName || !itemPrice}
                  >
                    Add Order
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No orders yet</p>
                      <p>Add your first order above!</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                Order #{order.id?.slice(-6)} - Table {order.table_number}
                              </h3>
                              <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="text-gray-600">
                                    {item.name} - ${item.price} x {item.quantity}
                                  </div>
                                ))}
                              </div>
                              <p className="font-semibold text-green-600">
                                Total: ${order.total.toFixed(2)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kitchen Tab */}
          <TabsContent value="kitchen">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">👨‍🍳 Kitchen Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getOrdersByStatus('pending').concat(getOrdersByStatus('preparing')).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No orders in kitchen</p>
                      <p>All caught up! 🎉</p>
                    </div>
                  ) : (
                    getOrdersByStatus('pending').concat(getOrdersByStatus('preparing')).map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                Order #{order.id?.slice(-6)} - Table {order.table_number}
                              </h3>
                              <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="text-gray-600 text-lg">
                                    <strong>{item.name}</strong> x {item.quantity}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <Button
                                  onClick={() => updateOrderStatus(order.id!, 'preparing')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Start Preparing
                                </Button>
                              )}
                              {order.status === 'preparing' && (
                                <Button
                                  onClick={() => updateOrderStatus(order.id!, 'ready')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark Ready
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">💰 Billing & Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-8">
                  {getOrdersByStatus('ready').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No orders ready for billing</p>
                      <p>Kitchen is still working! 👨‍🍳</p>
                    </div>
                  ) : (
                    getOrdersByStatus('ready').map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-green-500 bg-green-50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                Order #{order.id?.slice(-6)} - Table {order.table_number}
                              </h3>
                              <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="text-gray-600">
                                    {item.name} - ${item.price} x {item.quantity}
                                  </div>
                                ))}
                              </div>
                              <p className="font-bold text-green-600 text-xl">
                                Total: ${order.total.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              onClick={() => updateOrderStatus(order.id!, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-lg px-6 py-3"
                            >
                              Complete Payment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Daily Summary */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-800">📊 Today's Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getOrdersByStatus('completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {getOrdersByStatus('pending').length + getOrdersByStatus('preparing').length}
                        </div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          ${getOrdersByStatus('completed').reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupabaseRestaurant;