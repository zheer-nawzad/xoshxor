import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Table } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface TableGridProps {
  onTableSelect: (tableId: number) => void;
}

export function TableGrid({ onTableSelect }: TableGridProps) {
  const { tables } = useAppStore();

  const getTableStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-300";
      case "occupied":
        return "bg-red-100 text-red-700 border-red-300";
      case "reserved":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tables.map((table) => (
        <Card
          key={table.id}
          className={cn(
            "cursor-pointer hover:shadow-md transition-all",
            table.status === "occupied" && "border-red-300",
            table.status === "available" && "border-green-300",
            table.status === "reserved" && "border-yellow-300"
          )}
          onClick={() => onTableSelect(table.id)}
        >
          <CardContent className="p-4 text-center">
            <div
              className={cn(
                "rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 text-2xl font-bold",
                getTableStatusColor(table.status)
              )}
            >
              {table.id}
            </div>
            <h3 className="font-medium">Table {table.id}</h3>
            <div className="text-xs text-muted-foreground mt-1 capitalize">
              {table.status}
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 justify-center">
            <div className="flex items-center text-muted-foreground">
              <Users size={14} className="mr-1" />
              <span className="text-xs">Capacity: {table.capacity}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}