import { Link } from "react-router-dom";
import { ChevronDownIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsNavigation } from "@/app/navigation/navigation.ts";
import { UserProperties } from "@/types/user.ts";
import { getUserInitials } from "@/app/layout/utils.ts";

type ProfileMenuProps = {
  user: UserProperties | undefined;
  loading: boolean;
  onLogout: () => void;
};

export function ProfileMenu({ user, loading, onLogout }: ProfileMenuProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 lg:p-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="hidden h-4 w-20 lg:block" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-auto gap-2 lg:px-2 lg:py-1.5" />}
      >
        <Avatar>
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium lg:block">
          <span className="sr-only">Open user menu for </span>
          {user?.firstName}
        </span>
        <ChevronDownIcon data-icon="inline-end" className="hidden text-muted-foreground lg:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link to={SettingsNavigation.to} />}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLogout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
