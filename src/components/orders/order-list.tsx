import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, EyeIcon, Printer, ChefHat } from "lucide-react";

interface OrderListProps {
  orders: Order[];
  viewType: "kitchen" | "cashier";
  onViewOrder: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: Order["status"]) => void;
  onPrintOrder?: (orderId: string) => void;
}

export function OrderList({
  orders,
  viewType,
  onViewOrder,
  onUpdateStatus,
  onPrintOrder,
}: OrderListProps) {
  const getOrderStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "ready":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "served":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "paid":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort orders based on view type
  const filteredOrders = orders
    .filter((order) => {
      if (viewType === "kitchen") {
        return ["pending", "preparing", "ready"].includes(order.status);
      } else {
        return true; // Show all orders for cashier
      }
    })
    .sort((a, b) => {
      // For kitchen: pending > preparing > ready > others
      if (viewType === "kitchen") {
        const priorityOrder = {
          pending: 0,
          preparing: 1,
          ready: 2,
          served: 3,
          paid: 4,
        };
        
        if (priorityOrder[a.status] !== priorityOrder[b.status]) {
          return priorityOrder[a.status] - priorityOrder[b.status];
        }
      }
      
      // Then sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const getNextStatus = (currentStatus: Order["status"]) => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "served";
      case "served":
        return "paid";
      default:
        return currentStatus;
    }
  };

  const renderActionButton = (order: Order) => {
    if (viewType === "kitchen") {
      if (["pending", "preparing"].includes(order.status)) {
        const nextStatus = getNextStatus(order.status);
        const actionText =
          nextStatus === "preparing" ? "Start Preparing" : "Mark Ready";
        const icon = nextStatus === "preparing" ? <ChefHat size={16} /> : <Check size={16} />;
        
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              if (onUpdateStatus) {
                onUpdateStatus(order.id, nextStatus);
              }
            }}
            className="mr-2"
          >
            {icon}
            <span className="ml-1">{actionText}</span>
          </Button>
        );
      }
    } else if (viewType === "cashier" && order.status === "served") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            if (onUpdateStatus) {
              onUpdateStatus(order.id, "paid");
            }
          }}
          className="mr-2"
        >
          <Check size={16} />
          <span className="ml-1">Mark Paid</span>
        </Button>
      );
    }
    return null;
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-muted/10">
        <p className="text-lg text-muted-foreground">No orders to display</p>
        {viewType === "kitchen" ? (
          <p className="text-sm text-muted-foreground">
            New orders will appear here when they are placed
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            All orders will appear here for billing
          </p>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Items</TableHead>
          {viewType === "cashier" && <TableHead>Total</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order) => (
          <TableRow
            key={order.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onViewOrder(order.id)}
          >
            <TableCell>#{order.id.slice(0, 8)}</TableCell>
            <TableCell>Table {order.tableNumber}</TableCell>
            <TableCell>{formatDate(order.timestamp)}</TableCell>
            <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
            {viewType === "cashier" && (
              <TableCell>{formatCurrency(order.total)}</TableCell>
            )}
            <TableCell>
              <Badge
                variant="outline"
                className={getOrderStatusColor(order.status)}
              >
                {order.status.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                {renderActionButton(order)}
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOrder(order.id);
                  }}
                >
                  <EyeIcon size={16} />
                </Button>
                
                {viewType === "kitchen" && onPrintOrder && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintOrder(order.id);
                    }}
                  >
                    <Printer size={16} />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}