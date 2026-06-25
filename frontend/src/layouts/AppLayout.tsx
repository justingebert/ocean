import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAppDispatch } from "../redux/hooks";
import { logout } from "../redux/slices/session/sessionSlice";
import { navigation } from "../constants/menu.ts";
import { UserClient } from "../api/userClient";
import { getNavigationForUser, getNavigationSection } from "./utils.ts";
import { DesktopSidebar, MobileSidebar } from "./Sidebar.tsx";
import { TopBar } from "./TopBar.tsx";

export interface AppLayoutProps {
  children: React.ReactNode;

  selectedNavigation: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, selectedNavigation }) => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
    staleTime: 1000_1000,
  });

  const user = userQuery.data;
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
  };

  const navigationWithPermission = getNavigationForUser(user);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <MobileSidebar
        open={sidebarOpen}
        navigationItems={navigationWithPermission}
        selectedNavigation={selectedNavigation}
        onClose={() => setSidebarOpen(false)}
      />
      <DesktopSidebar
        primaryNavigationItems={getNavigationSection(navigation, "primary")}
        secondaryNavigationItems={getNavigationSection(navigationWithPermission, "secondary")}
        selectedNavigation={selectedNavigation}
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
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
