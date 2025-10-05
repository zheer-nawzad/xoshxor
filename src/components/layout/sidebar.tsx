import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

// Icons
import { 
  Home, 
  Menu as MenuIcon,
  Table, 
  Utensils, 
  CreditCard, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, label, href, isActive, isCollapsed }: SidebarItemProps) => {
  return (
    <Link to={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, currentUser, setCurrentUser } = useAppStore();

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        icon: <Home size={20} />,
        label: "Dashboard",
        href: "/",
      }
    ];

    const roleBasedItems = {
      waiter: [
        {
          icon: <Table size={20} />,
          label: "Tables",
          href: "/tables",
        },
        {
          icon: <MenuIcon size={20} />,
          label: "Menu",
          href: "/menu",
        }
      ],
      kitchen: [
        {
          icon: <Utensils size={20} />,
          label: "Orders",
          href: "/kitchen",
        }
      ],
      cashier: [
        {
          icon: <CreditCard size={20} />,
          label: "Billing",
          href: "/billing",
        }
      ],
      admin: [
        {
          icon: <Table size={20} />,
          label: "Tables",
          href: "/tables",
        },
        {
          icon: <MenuIcon size={20} />,
          label: "Menu",
          href: "/menu",
        },
        {
          icon: <Utensils size={20} />,
          label: "Kitchen",
          href: "/kitchen",
        },
        {
          icon: <CreditCard size={20} />,
          label: "Billing",
          href: "/billing",
        },
        {
          icon: <Settings size={20} />,
          label: "Settings",
          href: "/settings",
        }
      ]
    };

    if (!currentUser) return commonItems;

    return [
      ...commonItems,
      ...(roleBasedItems[currentUser.role] || [])
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r bg-background transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && (
          <div className="font-bold text-lg">Restaurant Mgmt</div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-4 space-y-2 px-2">
        {navItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={location.pathname === item.href}
            isCollapsed={!sidebarOpen}
          />
        ))}
      </div>

      {currentUser && (
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
          {sidebarOpen && (
            <div className="mt-2 text-xs text-muted-foreground">
              Logged in as <span className="font-semibold">{currentUser.name}</span>
              <div className="mt-1 text-xs text-muted-foreground capitalize">{currentUser.role}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}