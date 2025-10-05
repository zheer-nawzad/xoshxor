import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToOrder }: MenuCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video bg-muted relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{item.name}</h3>
          <div className="font-medium">{formatCurrency(item.price)}</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => onAddToOrder(item)}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
}