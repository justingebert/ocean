import { Link } from "react-router-dom";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/common/ModeToggle.tsx";
import { ProfileMenu } from "./ProfileMenu";
import { routePaths } from "@/app/navigation/routes.ts";
import { UserProperties } from "@/types/user.ts";

type TopBarProps = {
  user: UserProperties | undefined;
  userLoading: boolean;
  onLogout: () => void;
};

export function TopBar({ user, userLoading, onLogout }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="m-3 md:hidden" aria-label="Open sidebar" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-2 px-4 sm:px-6 lg:px-8">
        <ModeToggle />
        <Button render={<Link to={routePaths.createDatabase} />}>
          <PlusIcon data-icon="inline-start" />
          Create
        </Button>
        <ProfileMenu user={user} loading={userLoading} onLogout={onLogout} />
      </div>
    </header>
  );
}
