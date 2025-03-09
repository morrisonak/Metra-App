import { Outlet } from "react-router";
import { Card } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useLocation, Link } from "react-router";

export default function AdminLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isSettingsActive = currentPath.includes("/admin/settings");
  const isUsersActive = currentPath.includes("/admin/users");
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
        <p className="text-muted-foreground">Manage system settings and users</p>
      </div>

      <Tabs 
        value={isSettingsActive ? "settings" : isUsersActive ? "users" : undefined} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" asChild>
            <Link to="/admin/settings">Settings</Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link to="/admin/users">Users</Link>
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <Outlet />
        </div>
      </Tabs>
    </div>
  );
}