import { Bars3CenterLeftIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ModeToggle.tsx";
import { ProfileMenu } from "./ProfileMenu";
import { routePaths } from "@/app/navigation/routes.ts";
import { UserProperties } from "@/types/user.ts";

type TopBarProps = {
  user: UserProperties | undefined;
  userLoading: boolean;
  onOpenSidebar: () => void;
  onLogout: () => void;
};

export function TopBar({ user, userLoading, onOpenSidebar, onLogout }: TopBarProps) {
  return (
    <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-border bg-card lg:border-none">
      <button
        type="button"
        className="border-r border-border px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sidebar-ring lg:hidden"
        onClick={onOpenSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-2 border-b-2 border-muted px-4 sm:px-6 lg:px-8">
        <ModeToggle />
        <Button render={<Link to={routePaths.createDatabase} />}>
          <PlusIcon data-icon="inline-start" />
          Create
        </Button>
        <ProfileMenu user={user} loading={userLoading} onLogout={onLogout} />
      </div>
    </div>
  );
}
