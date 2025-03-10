import { Link } from "react-router";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ThemeToggle } from "~/components/themeToggle";
import { UserNav } from "~/components/userNav";
import { Sheet, SheetTrigger, SheetContent } from "~/components/ui/sheet";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { 
  BarChart3, 
  FileText, 
  Home, 
  Map, 
  MapPin, 
  Settings, 
  Upload, 
  Users
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Crossings",
    href: "/crossings",
    icon: MapPin,
  },
  {
    title: "Field Collection",
    href: "/field-collection",
    icon: FileText,
  },
  {
    title: "Map View",
    href: "/map",
    icon: Map,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "FRA GCIS Sync",
    href: "/sync",
    icon: Upload,
  },
  {
    title: "Admin",
    href: "/admin/settings",
    icon: Settings,
    children: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] max-w-[80vw]">
            <div className="flex h-16 items-center border-b px-4">
              <div className="font-bold">Railroad Crossing Inventory</div>
            </div>
            <div className="py-4">
              <nav className="flex flex-col space-y-1 px-2">
                {sidebarNavItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        location.pathname === item.href 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                    
                    {item.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                              location.pathname === child.href 
                                ? "bg-accent text-accent-foreground" 
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2 flex-1">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold whitespace-nowrap hidden sm:inline-block">Railroad Crossing Inventory</span>
            <span className="font-bold whitespace-nowrap sm:hidden">RCI System</span>
          </Link>
          
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <div className="relative hidden w-full max-w-sm md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search crossings..." 
                className="w-full pl-8 rounded-md"
              />
            </div>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}