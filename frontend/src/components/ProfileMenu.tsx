import { Link } from "react-router-dom";
import { ChevronDownIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsNavigation } from "../navigation/navigation.ts";
import { UserProperties } from "../types/user.ts";
import { getUserInitials } from "../layouts/utils.ts";

type ProfileMenuProps = {
  user: UserProperties | undefined;
  loading: boolean;
  onLogout: () => void;
};

export function ProfileMenu({ user, loading, onLogout }: ProfileMenuProps) {
  if (loading) {
    return (
      <div className="ml-3 flex items-center gap-3 lg:p-2">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <div className="hidden h-4 w-20 animate-pulse rounded-md bg-muted lg:block" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-3 h-auto gap-2 lg:px-2 lg:py-1.5">
          <Avatar>
            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium lg:block">
            <span className="sr-only">Open user menu for </span>
            {user?.firstName}
          </span>
          <ChevronDownIcon className="hidden text-muted-foreground lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={SettingsNavigation.to}>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onLogout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
