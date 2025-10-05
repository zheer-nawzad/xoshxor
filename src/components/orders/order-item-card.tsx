import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderItem, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface OrderItemCardProps {
  item: OrderItem;
  menuItem: MenuItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSpecialRequest: (id: string, request: string) => void;
}

export function OrderItemCard({
  item,
  menuItem,
  onQuantityChange,
  onRemove,
  onSpecialRequest,
}: OrderItemCardProps) {
  const subtotal = item.price * item.quantity;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium">{menuItem.name}</h4>
            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
            
            {item.specialRequests && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Special Request: </span>
                <span className="text-muted-foreground">{item.specialRequests}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-medium">{formatCurrency(subtotal)}</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
          >
            <Minus size={16} />
          </Button>
          
          <div className="h-8 w-8 flex items-center justify-center">
            {item.quantity}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const request = prompt("Special request:", item.specialRequests || "");
              if (request !== null) {
                onSpecialRequest(item.id, request);
              }
            }}
          >
            Add Note
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}