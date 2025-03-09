import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { useIsMobile } from "~/hooks/useMobile";
import { 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Home, 
  Map, 
  MapPin, 
  Settings, 
  Upload, 
  Users
} from "lucide-react";
import { Button } from "~/components/ui/button";

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
    title: "FRA CIS Sync",
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

export function SidebarNav() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

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

  if (isMobile) {
    // On mobile, the sidebar is handled by the header
    return null;
  }

  return (
    <aside
      className={cn(
        "min-h-screen border-r bg-sidebar text-sidebar-foreground transition-all duration-300 hidden md:block",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="py-4 relative h-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border bg-background z-10"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {!isCollapsed && (
          <div className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</div>
        )}

        <div className="space-y-1 px-2">
          {sidebarNavItems.map((item) => (
            <div key={item.href}>
              <Button
                asChild
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center h-10 w-10 p-0 mx-auto"
                )}
              >
                <Link to={item.href}>
                  <item.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                  {!isCollapsed && <span>{item.title}</span>}
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
                        <span>{child.title}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}