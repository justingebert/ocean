import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { UserClient } from "@/api/userClient";
import { getNavigationForUser, getNavigationSection } from "./utils.ts";
import { DesktopSidebar, MobileSidebar } from "./Sidebar.tsx";
import { TopBar } from "./TopBar.tsx";

const AppLayout = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
    staleTime: 1000_1000,
  });

  const user = userQuery.data;
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = () => {
    logout();
  };

  const navigationWithPermission = getNavigationForUser(user);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <MobileSidebar
        open={sidebarOpen}
        navigationItems={navigationWithPermission}
        onClose={() => setSidebarOpen(false)}
      />
      <DesktopSidebar
        primaryNavigationItems={getNavigationSection(navigationWithPermission, "primary")}
        secondaryNavigationItems={getNavigationSection(navigationWithPermission, "secondary")}
      />
      <div className="flex-1 overflow-auto focus:outline-none">
        <TopBar
          user={user}
          userLoading={userQuery.isFetching}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />
        <main className="flex-1 pb-8 z-0">
          <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
