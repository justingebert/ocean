import { Link } from "react-router-dom";
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, UserRoundIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { routePaths } from "@/app/navigation/routes.ts";
import { User, UserProperties } from "@/types/user.ts";
import { getUserInitials } from "@/app/layout/utils.ts";

type ProfileMenuProps = {
  user: UserProperties | undefined;
  loading: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
};

export function ProfileMenu({ user, loading, onLogout, onNavigate }: ProfileMenuProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-left">
          <span className="sr-only">Open user menu for </span>
          {user ? User.getDisplayName(user) : ""}
        </span>
        <ChevronsUpDownIcon className="text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-(--anchor-width) min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{user?.username}</DropdownMenuLabel>
          <DropdownMenuItem render={<Link to={routePaths.settings} onClick={onNavigate} />}>
            <UserRoundIcon />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          >
            <MoonIcon />
            Dark mode
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
