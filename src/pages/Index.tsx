import { useAppStore } from "@/lib/store";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CircleUser,
  Coffee,
  CreditCard,
  Table as TableIcon,
  Utensils,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { orders, tables, currentUser } = useAppStore();
  const navigate = useNavigate();

  // Calculate dashboard stats
  const stats = {
    activeOrders: orders.filter(
      (order) => !["served", "paid"].includes(order.status)
    ).length,
    occupiedTables: tables.filter((table) => table.status === "occupied")
      .length,
    completedOrders: orders.filter((order) => order.status === "paid").length,
    totalRevenue: orders
      .filter((order) => order.status === "paid")
      .reduce((sum, order) => sum + order.total, 0),
  };

  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  // Available actions based on user role
  const getActionCards = () => {
    if (!currentUser) {
      return (
        <div className="text-center py-10 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Welcome to خۆشخۆر Restaurant Management System</h3>
          <p className="text-muted-foreground mb-4">
            Please login to access the system features
          </p>
        </div>
      );
    }

    const actionCards = [];

    if (["waiter", "admin"].includes(currentUser.role)) {
      actionCards.push(
        <Card 
          key="tables" 
          className="cursor-pointer hover:shadow-md transition-all" 
          onClick={() => navigate("/tables")}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary/10 mr-4">
                <TableIcon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Tables</h3>
                <p className="text-sm text-muted-foreground">
                  Manage tables and orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (["kitchen", "admin"].includes(currentUser.role)) {
      actionCards.push(
        <Card 
          key="kitchen" 
          className="cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate("/kitchen")}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary/10 mr-4">
                <Utensils size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Kitchen</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (["cashier", "admin"].includes(currentUser.role)) {
      actionCards.push(
        <Card 
          key="billing" 
          className="cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate("/billing")}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary/10 mr-4">
                <CreditCard size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Process payments and bills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (["waiter", "admin"].includes(currentUser.role)) {
      actionCards.push(
        <Card 
          key="menu" 
          className="cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate("/menu")}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary/10 mr-4">
                <Coffee size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Menu</h3>
                <p className="text-sm text-muted-foreground">
                  Browse menu items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionCards}
      </div>
    );
  };

  return (
    <AppLayout title="خۆشخۆر Dashboard" requireAuth={false}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupiedTables}</div>
            <p className="text-xs text-muted-foreground">
              Out of {tables.length} tables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders paid and completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From paid orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Recent orders across all tables</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent orders
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>Table {order.tableNumber}</TableCell>
                      <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                      <TableCell>
                        <span className="capitalize">{order.status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        {getActionCards()}
      </div>
    </AppLayout>
  );
}