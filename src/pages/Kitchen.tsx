import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { OrderList } from "@/components/orders/order-list";
import { PrintPreview } from "@/components/ui/print-preview";
import { useAppStore } from "@/lib/store";
import { Order } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KitchenPage() {
  const { orders, updateOrder } = useAppStore();
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
  };

  const handlePrintOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsPrintModalOpen(true);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return order.status === "pending";
    if (activeTab === "preparing") return order.status === "preparing";
    if (activeTab === "ready") return order.status === "ready";
    return ["pending", "preparing", "ready"].includes(order.status);
  });

  return (
    <AppLayout title="Kitchen" requireAuth={true} allowedRoles={["kitchen", "admin"]}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Kitchen Orders</h1>
          <Badge variant="outline" className="text-green-600">
            🖨️ Orders auto-print from waiters
          </Badge>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {orders.filter(o => o.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <OrderList
        orders={filteredOrders}
        viewType="kitchen"
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        onPrintOrder={handlePrintOrder}
      />

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !isPrintModalOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Table:</div>
                <div>{selectedOrder.tableNumber}</div>
                
                <div className="font-medium">Status:</div>
                <div className="capitalize">{selectedOrder.status}</div>
                
                <div className="font-medium">Time:</div>
                <div>{new Date(selectedOrder.timestamp).toLocaleTimeString()}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items:</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.quantity} x {item.name || "Menu Item"}
                        </span>
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

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsPrintModalOpen(true);
                  }}
                >
                  Print
                </Button>
                
                {selectedOrder.status === "pending" && (
                  <Button
                    variant="default"
                    onClick={() => {
                      updateOrder(selectedOrder.id, { status: "preparing" });
                      setSelectedOrder({
                        ...selectedOrder,
                        status: "preparing",
                      });
                    }}
                  >
                    Start Preparing
                  </Button>
                )}
                
                {selectedOrder.status === "preparing" && (
                  <Button
                    variant="default"
                    onClick={() => {
                      updateOrder(selectedOrder.id, { status: "ready" });
                      setSelectedOrder({
                        ...selectedOrder,
                        status: "ready",
                      });
                    }}
                  >
                    Mark Ready
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <PrintPreview
        order={selectedOrder}
        type="kitchen"
        isOpen={!!selectedOrder && isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </AppLayout>
  );
}