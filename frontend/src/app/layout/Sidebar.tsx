import { Link, NavLink, useLocation } from "react-router-dom";

import type { Navigation } from "@/app/navigation/navigation";
import { HomeNavigation } from "@/app/navigation/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getNavigationSection } from "./utils";

type AppSidebarProps = {
  navigationItems: Navigation[];
};

export function AppSidebar({ navigationItems }: AppSidebarProps) {
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
        <SidebarHeader>
          <Link
            to={HomeNavigation.to}
            className="flex h-12 items-center px-3"
            onClick={closeMobileSidebar}
          >
            <img className="h-8 w-auto" src="/ocean-logo.png" alt="Ocean logo" />
          </Link>
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
      </nav>
    </Sidebar>
  );
}
