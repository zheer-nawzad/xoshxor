import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { BellIcon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export function Header() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("waiter");
  const [open, setOpen] = useState(false);

  const handleLogin = () => {
    setCurrentUser({
      id: uuidv4(),
      name,
      role: selectedRole,
    });
    setOpen(false);
  };

  const roles: { label: string; value: UserRole }[] = [
    { label: "Waiter", value: "waiter" },
    { label: "Kitchen Staff", value: "kitchen" },
    { label: "Cashier", value: "cashier" },
    { label: "Administrator", value: "admin" },
  ];

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full overflow-hidden"
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-muted-foreground capitalize">
                  {currentUser.role}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentUser(null)}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Login</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    Select your role to access the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <Button
                          key={role.value}
                          type="button"
                          variant={selectedRole === role.value ? "default" : "outline"}
                          onClick={() => setSelectedRole(role.value)}
                          className="flex-1"
                        >
                          {role.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogin} disabled={!name}>
                    Login
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}