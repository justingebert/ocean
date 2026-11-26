import { Link, NavLink, useLocation } from "react-router-dom";
import { PlusIcon } from "lucide-react";

import type { Navigation } from "@/app/navigation/navigation";
import { HomeNavigation } from "@/app/navigation/navigation";
import { routePaths } from "@/app/navigation/routes";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { OceanLogo } from "@/components/common/OceanLogo";
import { UserProperties } from "@/types/user";
import { ProfileMenu } from "./ProfileMenu";
import { getNavigationSection } from "./utils";

type AppSidebarProps = {
  navigationItems: Navigation[];
  user: UserProperties | undefined;
  userLoading: boolean;
  onLogout: () => void;
};

export function AppSidebar({ navigationItems, user, userLoading, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const primaryItems = getNavigationSection(navigationItems, "primary");
  const secondaryItems = getNavigationSection(navigationItems, "secondary");

  const closeMobileSidebar = () => setOpenMobile(false);

  const renderNavigationItems = (items: Navigation[]) =>
    items.map((item) => {
      const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

      return (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton
            render={<NavLink to={item.to} onClick={closeMobileSidebar} />}
            isActive={isActive}
          >
            <item.icon aria-hidden="true" />
            <span>{item.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar>
      <nav className="flex min-h-0 flex-1 flex-col" aria-label="Sidebar">
        <SidebarHeader className="flex-row items-center justify-between">
          <Link
            to={HomeNavigation.to}
            className="flex items-center gap-2 rounded-md p-1 text-sm font-semibold"
            onClick={closeMobileSidebar}
          >
            <OceanLogo alt="" />
            Ocean
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="New database"
            title="New database"
            render={<Link to={routePaths.createDatabase} onClick={closeMobileSidebar} />}
          >
            <PlusIcon />
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{renderNavigationItems(primaryItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>{renderNavigationItems(secondaryItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <ProfileMenu
                user={user}
                loading={userLoading}
                onLogout={onLogout}
                onNavigate={closeMobileSidebar}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </nav>
    </Sidebar>
  );
}
