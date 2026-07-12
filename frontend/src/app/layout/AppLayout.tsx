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
    <SidebarProvider open className="h-svh min-h-0 overflow-hidden">
      <AppSidebar navigationItems={navigationWithPermission} />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto focus:outline-none">
        <TopBar user={user} userLoading={userQuery.isFetching} onLogout={onLogout} />
        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8 mt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
