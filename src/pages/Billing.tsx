import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { OrderList } from "@/components/orders/order-list";
import { PrintPreview } from "@/components/ui/print-preview";
import { OrderSummary } from "@/components/orders/order-summary";
import { useAppStore } from "@/lib/store";
import { Order } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BillingPage() {
  const { orders, updateOrder, updateTableStatus } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleViewOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleUpdateStatus = (orderId: string, status: Order["status"]) => {
    updateOrder(orderId, { status });
    
    // If the order is marked as paid, update the table status to available
    if (status === "paid") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        updateTableStatus(order.tableNumber, "available");
      }
    }
  };

  const handlePrintBill = () => {
    if (selectedOrder) {
      setIsPrintModalOpen(true);
    }
  };

  const handlePaymentComplete = () => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, { status: "paid" });
      updateTableStatus(selectedOrder.tableNumber, "available");
      setSelectedOrder(null);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "served") return order.status === "served";
    if (activeTab === "paid") return order.status === "paid";
    return true; // Show all orders on "all" tab
  });

  return (
    <AppLayout title="Billing" requireAuth={true} allowedRoles={["cashier", "admin"]}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="served">To Be Paid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <OrderList
        orders={filteredOrders}
        viewType="cashier"
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !isPrintModalOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Table:</div>
                  <div>{selectedOrder.tableNumber}</div>
                  
                  <div className="font-medium">Status:</div>
                  <div className="capitalize">{selectedOrder.status}</div>
                  
                  <div className="font-medium">Time:</div>
                  <div>{new Date(selectedOrder.timestamp).toLocaleString()}</div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items:</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span>
                            {item.quantity} x {item.name || "Menu Item"}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.specialRequests && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Note: {item.specialRequests}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <OrderSummary
                  order={selectedOrder}
                  tableNumber={selectedOrder.tableNumber}
                  onCancel={() => setSelectedOrder(null)}
                  onPlaceOrder={() => {}}
                  onPrintBill={handlePrintBill}
                  isCheckout={true}
                  showTimestamp={true}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <PrintPreview
        order={selectedOrder}
        type="bill"
        isOpen={!!selectedOrder && isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          if (selectedOrder?.status === "served") {
            // Ask if payment is complete
            if (confirm("Mark this order as paid?")) {
              handlePaymentComplete();
            } else {
              setSelectedOrder(null);
            }
          } else {
            setSelectedOrder(null);
          }
        }}
      />
    </AppLayout>
  );
}