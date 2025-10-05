import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function SettingsPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAppStore();

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "main",
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "main",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price === undefined) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingId) {
      // Update existing item
      updateMenuItem(editingId, formData);
    } else {
      // Add new item
      addMenuItem({
        name: formData.name || "",
        description: formData.description || "",
        price: formData.price || 0,
        category: formData.category || "main",
      });
    }

    resetForm();
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItem(id);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <AppLayout title="Settings" requireAuth={true} allowedRoles={["admin"]}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Menu Item" : "Add Menu Item"}</CardTitle>
            <CardDescription>
              {editingId ? "Update the details of an existing menu item" : "Add a new item to the menu"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <label htmlFor="name">Name *</label>
                <Input
                  id="name"
                  placeholder="Item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid w-full gap-1.5">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  placeholder="Item description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid w-full gap-1.5">
                <label htmlFor="price">Price *</label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              
              <div className="grid w-full gap-1.5">
                <label htmlFor="category">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.category === "new" && (
                <div className="grid w-full gap-1.5">
                  <label htmlFor="newCategory">New Category Name *</label>
                  <Input
                    id="newCategory"
                    placeholder="Enter new category name"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update Item" : "Add Item"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Manage your restaurant's menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b pb-2"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm">{formatCurrency(item.price)}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {menuItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No menu items yet. Add some using the form.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}