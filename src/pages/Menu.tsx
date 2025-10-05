import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MenuFilter } from "@/components/orders/menu-filter";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { MenuItem } from "@/lib/types";
import { groupBy } from "@/lib/utils";

export default function MenuPage() {
  const { menuItems } = useAppStore();
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>(menuItems);
  const [viewMode, setViewMode] = useState<"grid" | "category">("category");

  // Group menu items by category
  const groupedMenuItems = groupBy(filteredMenuItems, "category");

  return (
    <AppLayout title="Menu" requireAuth={true} allowedRoles={["waiter", "admin", "kitchen", "cashier"]}>
      <div className="flex justify-between items-center mb-6">
        <MenuFilter menuItems={menuItems} onFilterChange={setFilteredMenuItems} />
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button 
            variant={viewMode === "category" ? "default" : "outline"}
            onClick={() => setViewMode("category")}
          >
            By Category
          </Button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{item.name}</CardTitle>
                  <div className="font-bold">{formatCurrency(item.price)}</div>
                </div>
                <CardDescription className="text-sm">{item.category}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p>{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex justify-between items-start"
                    >
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="font-bold ml-4">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}