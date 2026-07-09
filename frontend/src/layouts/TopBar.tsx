import { Bars3CenterLeftIcon } from "@heroicons/react/20/solid";

import CreateDropdown from "../components/CreateDropdown.tsx";
import { ModeToggle } from "../components/mode-toggle.tsx";
import { ProfileMenu } from "../components/ProfileMenu.tsx";
import { UserProperties } from "../types/user.ts";

type TopBarProps = {
  user: UserProperties | undefined;
  userLoading: boolean;
  onOpenSidebar: () => void;
  onLogout: () => void;
};

export function TopBar({ user, userLoading, onOpenSidebar, onLogout }: TopBarProps) {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border lg:border-none">
      <button
        type="button"
        className="px-4 border-r border-border text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sidebar-ring lg:hidden"
        onClick={onOpenSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8 border-b-2 border-muted">
        <div className="flex-1 flex"></div>
        <div className="ml-4 flex items-center gap-2 md:ml-6">
          <CreateDropdown />
          <ModeToggle />
          <ProfileMenu user={user} loading={userLoading} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}
