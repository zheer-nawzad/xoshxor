import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  title?: string;
}

export function AppLayout({
  children,
  requireAuth = true,
  allowedRoles,
  title,
}: AppLayoutProps) {
  const { currentUser, sidebarOpen } = useAppStore();
  const navigate = useNavigate();

  const isAuthenticated = !!currentUser;
  const hasPermission =
    !allowedRoles ||
    !currentUser ||
    allowedRoles.includes(currentUser.role);

  const accessDenied = requireAuth && (!isAuthenticated || !hasPermission);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          <div className="container mx-auto p-6">
            {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
            
            {accessDenied ? (
              <div className="flex items-center justify-center h-[80vh]">
                <div className="w-full max-w-md">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Restricted</AlertTitle>
                    <AlertDescription>
                      {!isAuthenticated
                        ? "You need to login to access this page."
                        : "You don't have permission to access this page."}
                    </AlertDescription>
                  </Alert>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => navigate("/")}>
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}