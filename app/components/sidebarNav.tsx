import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { useIsMobile } from "~/hooks/useMobile";
import { 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  History, 
  Home, 
  Map, 
  MapPin, 
  Settings, 
  Upload, 
  Users, 
  Menu
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "~/components/ui/sheet";

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
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "FRA CIS Sync",
    href: "/sync",
    icon: Upload,
  },
  {
    title: "Admin",
    href: "/admin",
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

export function SidebarNav() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem("sidebar-collapsed", String(!isCollapsed));
  };

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="sm" className="ml-2 mt-2 md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5 mr-2" />
          Menu
        </Button>
        
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <div className="flex h-16 items-center border-b px-4">
              <div className="font-bold">Railway Crossing Inventory</div>
            </div>
            <div className="py-4">
              <nav className="flex flex-col space-y-1 px-2">
                {sidebarNavItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        location.pathname === item.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                    
                    {item.children && location.pathname.startsWith(item.href) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                              location.pathname === child.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
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
      </>
    );
  }

  return (
    <div
      className={cn(
        "hidden border-r bg-sidebar text-sidebar-foreground transition-all duration-300 md:block",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="py-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border bg-background z-10"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {!isCollapsed && <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>}

        <div className="space-y-1 px-2">
          {sidebarNavItems.map((item) => (
            <div key={item.href}>
              <Button
                asChild
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center h-10 w-10 p-0"
                )}
              >
                <Link to={item.href}>
                  <item.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                  {!isCollapsed && item.title}
                </Link>
              </Button>

              {item.children && location.pathname.startsWith(item.href) && !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.href}
                      asChild
                      variant={location.pathname === child.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Link to={child.href}>
                        <child.icon className="mr-2 h-4 w-4" />
                        {child.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}