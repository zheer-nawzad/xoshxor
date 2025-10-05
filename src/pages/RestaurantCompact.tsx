import React, { useState, useEffect } from 'react';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';

interface Order {
  id: string;
  table_number: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  created_at: string;
}

export default function RestaurantCompact() {
  const { orders, addOrder, updateOrderStatus } = useSupabaseOrders();
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTable, setSelectedTable] = useState('1');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [connected, setConnected] = useState(true);

  // Check if mobile
  const isMobile = window.innerWidth <= 768;

  const handleAddOrder = async () => {
    if (!itemName || !itemPrice) return;

    const newOrder = {
      table_number: parseInt(selectedTable),
      items: [{
        name: itemName,
        price: parseFloat(itemPrice),
        quantity: 1
      }],
      total: parseFloat(itemPrice),
      status: 'pending' as const
    };

    await addOrder(newOrder);
    setItemName('');
    setItemPrice('');
  };

  const recentOrders = orders.slice(0, isMobile ? 2 : 5);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '5px', 
      backgroundColor: '#f8f9fa', 
      height: '100vh',
      overflow: 'hidden',
      fontSize: '12px'
    }}>
      {/* Ultra Compact Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '8px',
        position: 'relative'
      }}>
        <h1 style={{ 
          color: '#333', 
          fontSize: '16px', 
          margin: '0',
          fontWeight: 'bold'
        }}>🍽️ Restaurant</h1>
        
        {/* Connection Status - Tiny */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          padding: '2px 6px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '8px',
          backgroundColor: connected ? '#28a745' : '#dc3545'
        }}>
          ●
        </div>
      </div>

      {/* Ultra Compact Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '8px',
        gap: '3px'
      }}>
        {[
          { id: 'tables', label: '📋', color: '#007bff' },
          { id: 'kitchen', label: '👨‍🍳', color: '#fd7e14' },
          { id: 'billing', label: '💰', color: '#28a745' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: activeTab === tab.id ? tab.color : '#e9ecef',
              color: activeTab === tab.id ? 'white' : '#495057',
              minWidth: '35px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area - Ultra Compact */}
      <div style={{ 
        height: 'calc(100vh - 60px)',
        overflow: 'hidden'
      }}>
        
        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            
            {/* Add Order Form - Ultra Compact */}
            <div style={{
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Add Order</div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px 1fr 50px 50px', 
                gap: '3px',
                alignItems: 'center'
              }}>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  style={{
                    padding: '3px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(table => (
                    <option key={table} value={table.toString()}>T{table}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Item"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{
                    padding: '3px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                />
                
                <input
                  type="number"
                  placeholder="$"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  style={{
                    padding: '3px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                />
                
                <button
                  onClick={handleAddOrder}
                  disabled={!itemName || !itemPrice}
                  style={{
                    padding: '3px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    opacity: (!itemName || !itemPrice) ? 0.6 : 1
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Orders List - Ultra Compact */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '8px', 
              borderRadius: '6px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              flex: 1,
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Orders</div>
              
              <div style={{ 
                display: 'grid', 
                gap: '3px',
                maxHeight: 'calc(100% - 20px)',
                overflow: 'auto'
              }}>
                {recentOrders.length === 0 ? (
                  <div style={{ color: '#666', fontSize: '10px', textAlign: 'center', padding: '10px' }}>
                    No orders yet
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} style={{
                      padding: '5px',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      fontSize: '9px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>
                          T{order.table_number} - ${order.total.toFixed(2)}
                        </div>
                        <div style={{ color: '#666' }}>
                          {order.items[0]?.name}
                        </div>
                      </div>
                      <span style={{
                        padding: '1px 4px',
                        borderRadius: '8px',
                        fontSize: '8px',
                        backgroundColor: order.status === 'pending' ? '#ffc107' : 
                                       order.status === 'preparing' ? '#17a2b8' :
                                       order.status === 'ready' ? '#28a745' : '#6c757d',
                        color: 'white'
                      }}>
                        {order.status.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kitchen Tab */}
        {activeTab === 'kitchen' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderRadius: '6px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: '100%',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Kitchen Orders</div>
            
            <div style={{ 
              display: 'grid', 
              gap: '3px',
              maxHeight: 'calc(100% - 20px)',
              overflow: 'auto'
            }}>
              {orders.filter(order => order.status !== 'completed').map((order) => (
                <div key={order.id} style={{
                  padding: '5px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  fontSize: '9px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 'bold' }}>Table {order.table_number}</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ color: '#666', fontSize: '8px' }}>
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '3px', display: 'flex', gap: '2px' }}>
                    {['preparing', 'ready'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status as any)}
                        style={{
                          padding: '2px 4px',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '8px',
                          cursor: 'pointer',
                          backgroundColor: order.status === status ? '#28a745' : '#e9ecef',
                          color: order.status === status ? 'white' : '#333'
                        }}
                      >
                        {status === 'preparing' ? 'Prep' : 'Ready'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderRadius: '6px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: '100%',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Billing</div>
            
            <div style={{ 
              display: 'grid', 
              gap: '3px',
              maxHeight: 'calc(100% - 20px)',
              overflow: 'auto'
            }}>
              {orders.filter(order => order.status === 'ready').map((order) => (
                <div key={order.id} style={{
                  padding: '5px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  fontSize: '9px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Table {order.table_number}</div>
                    <div style={{ color: '#666' }}>${order.total.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      fontSize: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Pay
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}