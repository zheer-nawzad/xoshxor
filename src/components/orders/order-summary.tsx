import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order, OrderItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calculator, Printer, SendHorizonal, X } from "lucide-react";

interface OrderSummaryProps {
  order: Partial<Order> & { items: OrderItem[] };
  tableNumber?: number;
  onCancel: () => void;
  onPlaceOrder: () => void;
  onPrintBill?: () => void;
  isCheckout?: boolean;
  showTimestamp?: boolean;
}

export function OrderSummary({
  order,
  tableNumber,
  onCancel,
  onPlaceOrder,
  onPrintBill,
  isCheckout = false,
  showTimestamp = false,
}: OrderSummaryProps) {
  const total = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <Card className="min-w-[350px] max-w-[450px]">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        {tableNumber && (
          <CardDescription>Table {tableNumber}</CardDescription>
        )}
        {showTimestamp && order.timestamp && (
          <CardDescription>{formatDate(order.timestamp)}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {order.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items in the order
          </div>
        ) : (
          <>
            {order.items.map((item, index) => (
              <div key={item.id || index} className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {item.quantity} x {item.name || "Menu Item"}
                  </div>
                  {item.specialRequests && (
                    <div className="text-xs text-muted-foreground">
                      Note: {item.specialRequests}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-medium mt-4 text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          <X size={16} className="mr-1" /> Cancel
        </Button>
        {isCheckout ? (
          <Button 
            variant="default" 
            className="flex-1" 
            onClick={onPrintBill}
            disabled={order.items.length === 0}
          >
            <Printer size={16} className="mr-1" /> Print Bill
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="flex-1" 
            onClick={onPlaceOrder}
            disabled={order.items.length === 0}
          >
            <SendHorizonal size={16} className="mr-1" /> Place Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}