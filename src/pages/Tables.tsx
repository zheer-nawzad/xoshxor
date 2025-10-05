import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { TableGrid } from "@/components/table/table-grid";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/orders/order-summary";
import { MenuFilter } from "@/components/orders/menu-filter";
import { MenuCard } from "@/components/orders/menu-card";
import { OrderItemCard } from "@/components/orders/order-item-card";
import { MenuItem, OrderItem, Order } from "@/lib/types";
import { calculateOrderTotal } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function TablesPage() {
  const navigate = useNavigate();
  const { tables, menuItems, orders, updateTableStatus, addOrder, updateOrder } = useAppStore();
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>(menuItems);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentOrder, setCurrentOrder] = useState<{
    items: OrderItem[];
    tableNumber: number;
  }>({
    items: [],
    tableNumber: 0,
  });

  const selectedTable = selectedTableId 
    ? tables.find((table) => table.id === selectedTableId)
    : null;

  const handleTableSelect = (tableId: number) => {
    setSelectedTableId(tableId);
    
    // Initialize a new order for this table
    setCurrentOrder({
      items: [],
      tableNumber: tableId,
    });
  };

  const handleAddToOrder = (menuItem: MenuItem) => {
    // Check if item already exists in the order
    const existingItemIndex = currentOrder.items.findIndex(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      const updatedItems = [...currentOrder.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      
      setCurrentOrder({
        ...currentOrder,
        items: updatedItems,
      });
    } else {
      // New item, add to order
      setCurrentOrder({
        ...currentOrder,
        items: [
          ...currentOrder.items,
          {
            id: uuidv4(),
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ],
      });
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCurrentOrder({
      ...currentOrder,
      items: currentOrder.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentOrder({
      ...currentOrder,
      items: currentOrder.items.filter((item) => item.id !== itemId),
    });
  };

  const handleSpecialRequest = (itemId: string, request: string) => {
    setCurrentOrder({
      ...currentOrder,
      items: currentOrder.items.map((item) =>
        item.id === itemId ? { ...item, specialRequests: request } : item
      ),
    });
  };

  const handlePlaceOrder = () => {
    if (currentOrder.items.length === 0 || !selectedTableId) return;

    // Calculate order total
    const total = calculateOrderTotal(currentOrder.items);

    // Create the order
    const orderId = addOrder({
      tableNumber: selectedTableId,
      items: currentOrder.items,
      status: "pending",
      total,
      isPrinted: true, // Mark as printed since we auto-print to kitchen
    });

    // Update table status
    updateTableStatus(selectedTableId, "occupied", orderId);

    // Auto-print to kitchen
    printKitchenOrder({
      id: orderId,
      tableNumber: selectedTableId,
      items: currentOrder.items,
      status: "pending",
      total,
      timestamp: new Date().toISOString(),
      isPrinted: true,
    });

    // Close the dialog
    setSelectedTableId(null);
    
    // Reset current order
    setCurrentOrder({
      items: [],
      tableNumber: 0,
    });

    // Show confirmation
    alert("Order placed successfully and sent to kitchen!");
  };

  const printKitchenOrder = (order: Order) => {
    const printContent = `
=================================
       KITCHEN ORDER
         خۆشخۆر
=================================
Table: ${order.tableNumber}
Order ID: #${order.id}
Time: ${new Date(order.timestamp).toLocaleTimeString()}
---------------------------------
${order.items.map((item) => 
  `${item.quantity}x ${item.name}${item.specialRequests ? `\n  Note: ${item.specialRequests}` : ''}`
).join('\n')}
---------------------------------
Status: ${order.status.toUpperCase()}
=================================
    `;

    // Automatically print to kitchen printer (second printer)
    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Kitchen Order</title>');
      printWindow.document.write('<style>body { font-family: monospace; margin: 20px; white-space: pre-line; font-size: 12px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      // Auto-print immediately
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }

    // Also show notification for kitchen staff
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`🍽️ New Kitchen Order - Table ${order.tableNumber}`, {
          body: `${order.items.length} items - Order #${order.id}`,
          icon: '/favicon.svg'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`🍽️ New Kitchen Order - Table ${order.tableNumber}`, {
              body: `${order.items.length} items - Order #${order.id}`,
              icon: '/favicon.svg'
            });
          }
        });
      }
    }
  };

  const handleCancel = () => {
    setSelectedTableId(null);
    setCurrentOrder({
      items: [],
      tableNumber: 0,
    });
  };

  const sendToCashier = (orderId: string) => {
    updateOrder(orderId, { status: "ready" });
    alert("Order sent to cashier!");
  };

  const editOrder = (order: Order) => {
    setEditingOrder(order);
    setSelectedTableId(order.tableNumber);
    
    // Convert order items to current order format
    setCurrentOrder({
      items: order.items,
      tableNumber: order.tableNumber,
    });
  };

  const updateExistingOrder = () => {
    if (!editingOrder || currentOrder.items.length === 0) return;

    const total = calculateOrderTotal(currentOrder.items);

    updateOrder(editingOrder.id, {
      items: currentOrder.items,
      total,
    });

    // Re-print to kitchen with updated order
    if (editingOrder) {
      printKitchenOrder({
        ...editingOrder,
        items: currentOrder.items,
        total,
        timestamp: new Date().toISOString(),
      });
    }

    setSelectedTableId(null);
    setEditingOrder(null);
    setCurrentOrder({
      items: [],
      tableNumber: 0,
    });

    alert("Order updated and reprinted to kitchen!");
  };

  return (
    <AppLayout title="Tables" requireAuth={true} allowedRoles={["waiter", "admin"]}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Table Management</h1>
        <Button 
          onClick={() => setShowPendingOrders(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <span>Pending Orders</span>
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <Badge variant="destructive">
              {orders.filter(o => o.status === 'pending').length}
            </Badge>
          )}
        </Button>
      </div>
      
      <TableGrid onTableSelect={handleTableSelect} />

      {/* Table Order Dialog */}
      <Dialog open={selectedTableId !== null} onOpenChange={() => setSelectedTableId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Table {selectedTableId} - {selectedTable?.status}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <Button onClick={() => setIsMenuOpen(true)}>View Menu</Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Current Order Items</h3>
                
                {currentOrder.items.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">
                      No items in the order yet
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsMenuOpen(true)}
                    >
                      Open Menu to Add Items
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {currentOrder.items.map((item) => {
                      const menuItem = menuItems.find(
                        (mi) => mi.id === item.menuItemId
                      ) || {
                        id: item.menuItemId,
                        name: "Unknown Item",
                        price: item.price,
                        description: "",
                        category: "",
                      };
                      
                      return (
                        <OrderItemCard
                          key={item.id}
                          item={item}
                          menuItem={menuItem}
                          onQuantityChange={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                          onSpecialRequest={handleSpecialRequest}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <OrderSummary
                order={{
                  ...currentOrder,
                  total: calculateOrderTotal(currentOrder.items),
                  id: "",
                  status: "pending",
                  timestamp: new Date().toISOString(),
                  isPrinted: false,
                }}
                tableNumber={selectedTableId || undefined}
                onCancel={handleCancel}
                onPlaceOrder={editingOrder ? updateExistingOrder : handlePlaceOrder}
                actionLabel={editingOrder ? "Update Order" : "Send to Kitchen"}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          
          <div className="py-4">
            <MenuFilter menuItems={menuItems} onFilterChange={setFilteredMenuItems} />
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredMenuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToOrder={handleAddToOrder}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Pending Orders Dialog */}
      <Dialog open={showPendingOrders} onOpenChange={setShowPendingOrders}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pending Orders - Modify Before Sending to Cashier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {orders.filter(order => order.status === 'pending').map((order) => (
              <div key={order.id} className="border rounded-lg p-4 bg-orange-50">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Table {order.tableNumber}</h3>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleTimeString()}</p>
                    <Badge variant="secondary" className="mt-1">
                      🖨️ Printed to Kitchen
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        editOrder(order);
                        setShowPendingOrders(false);
                      }}
                    >
                      Edit Order
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => sendToCashier(order.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Send to Cashier
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Items:</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-white p-2 rounded">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.some(item => item.specialRequests) && (
                    <div className="mt-2">
                      <h5 className="font-medium text-sm">Special Requests:</h5>
                      {order.items.filter(item => item.specialRequests).map((item) => (
                        <div key={item.id} className="text-sm text-blue-600 bg-blue-50 p-1 rounded mt-1">
                          {item.name}: {item.specialRequests}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.filter(order => order.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No pending orders</p>
                <p className="text-sm">Orders will appear here after being sent to kitchen</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}