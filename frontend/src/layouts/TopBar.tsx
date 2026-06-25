import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Bars3CenterLeftIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

import CreateDropdown from "../components/CreateDropdown.tsx";
import { SettingsNavigation } from "../constants/menu.ts";
import { cn } from "../lib/utils.ts";
import { UserProperties } from "../types/user.ts";
import { getUserInitials } from "./utils.ts";

type TopBarProps = {
  user: UserProperties | undefined;
  userLoading: boolean;
  onOpenSidebar: () => void;
  onLogout: () => void;
};

type ProfileMenuProps = {
  user: UserProperties | undefined;
  loading: boolean;
  onLogout: () => void;
};

function ProfileMenu({ user, loading, onLogout }: ProfileMenuProps) {
  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <MenuButton
              disabled={loading}
              className="max-w-xs bg-card rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring lg:p-2 lg:rounded-md lg:hover:bg-accent"
            >
              {loading ? (
                <div className="animate-pulse rounded-full h-8 w-8 bg-gray-200" />
              ) : (
                <svg className="rounded-full" height="36" width="36">
                  <rect fill="#a0d36a" x="0" y="0" height="36" width="36"></rect>
                  <text fill="#ffffff" fontSize="15" textAnchor="middle" x="17" y="23">
                    {getUserInitials(user)}
                  </text>
                </svg>
              )}
              {loading ? (
                <span className="animate-pulse hidden ml-3 lg:block">
                  <div className="rounded-md w-24 h-8 bg-gray-200" />
                </span>
              ) : (
                <span className="hidden ml-3 text-secondary-foreground text-sm font-medium lg:block">
                  <span className="sr-only">Open user menu for </span>
                  {user && user.firstName}
                </span>
              )}
              <ChevronDownIcon
                className="hidden flex-shrink-0 ml-1 h-5 w-5 text-muted-foreground lg:block"
                aria-hidden="true"
              />
            </MenuButton>
          </div>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems
              static
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-popover text-popover-foreground ring-1 ring-border focus:outline-none"
            >
              <MenuItem>
                {({ focus }) => (
                  <Link
                    to={SettingsNavigation.to}
                    className={cn(focus ? "bg-accent" : "", "block px-4 py-2 text-sm")}
                  >
                    Settings
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <div
                    onClick={onLogout}
                    className={cn(focus ? "bg-accent" : "", "block px-4 py-2 text-sm")}
                  >
                    Logout
                  </div>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
}

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
        <div className="ml-4 flex items-center md:ml-6">
          <CreateDropdown />
          <ProfileMenu user={user} loading={userLoading} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}
