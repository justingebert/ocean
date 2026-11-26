import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { UserClient } from "@/api/userClient";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getNavigationForUser } from "./utils.ts";
import { AppSidebar } from "./Sidebar.tsx";
import { TopBar } from "./TopBar.tsx";

const AppLayout = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
    staleTime: 1000_1000,
  });

  const user = userQuery.data;
  const { logout } = useAuth();
  const onLogout = () => {
    logout();
  };

  const navigationWithPermission = getNavigationForUser(user);

  return (
    <SidebarProvider
      open
      className="h-svh min-h-0 overflow-hidden"
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      <AppSidebar
        navigationItems={navigationWithPermission}
        user={user}
        userLoading={userQuery.isFetching}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto focus:outline-none">
        <TopBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
