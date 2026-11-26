import { Link } from "react-router-dom";

import { HomeNavigation } from "@/app/navigation/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OceanLogo } from "@/components/common/OceanLogo";

/** Mobile only: on desktop the sidebar carries the logo and account menu. */
export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 md:hidden">
      <SidebarTrigger aria-label="Open sidebar" />
      <Link to={HomeNavigation.to} className="flex items-center gap-2 text-sm font-semibold">
        <OceanLogo className="size-6" alt="" />
        Ocean
      </Link>
    </header>
  );
}
