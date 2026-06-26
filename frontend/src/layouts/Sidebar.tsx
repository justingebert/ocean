import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import { Navigation } from "../navigation/navigation.ts";
import { cn } from "../lib/utils.ts";
import { getNavigationSection } from "./utils.ts";

type SidebarNavigationProps = {
  primaryNavigationItems: Navigation[];
  secondaryNavigationItems: Navigation[];
  selectedNavigation: string;
  navClassName: string;
  linkClassName: string;
};

type MobileSidebarProps = {
  open: boolean;
  navigationItems: Navigation[];
  selectedNavigation: string;
  onClose: () => void;
};

type DesktopSidebarProps = {
  primaryNavigationItems: Navigation[];
  secondaryNavigationItems: Navigation[];
  selectedNavigation: string;
};

function SidebarNavigation({
  primaryNavigationItems,
  secondaryNavigationItems,
  selectedNavigation,
  navClassName,
  linkClassName,
}: SidebarNavigationProps) {
  const renderLink = (item: Navigation) => (
    <Link
      key={item.name}
      to={item.to}
      className={cn(
        item.name === selectedNavigation
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground",
        linkClassName,
      )}
      aria-current={item.name === selectedNavigation ? "page" : undefined}
    >
      <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-sidebar-icon" aria-hidden="true" />
      {item.name}
    </Link>
  );

  return (
    <nav className={navClassName} aria-label="Sidebar">
      <div className="px-2 space-y-1">{primaryNavigationItems.map(renderLink)}</div>
      <div className="mt-6 pt-6">
        <div className="px-2 space-y-1">{secondaryNavigationItems.map(renderLink)}</div>
      </div>
    </nav>
  );
}

export function MobileSidebar({
  open,
  navigationItems,
  selectedNavigation,
  onClose,
}: MobileSidebarProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 flex z-40 lg:hidden"
        open={open}
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <DialogPanel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-sidebar">
            <TransitionChild
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sidebar-accent-foreground"
                  onClick={onClose}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon
                    className="h-6 w-6 text-sidebar-accent-foreground"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </TransitionChild>

            <div className="flex-shrink-0 flex items-center px-4">
              <img className="h-8 w-auto" src="/ocean-logo.png" alt="Ocean logo" />
            </div>
            <SidebarNavigation
              primaryNavigationItems={getNavigationSection(navigationItems, "primary")}
              secondaryNavigationItems={getNavigationSection(navigationItems, "secondary")}
              selectedNavigation={selectedNavigation}
              navClassName="mt-5 flex-shrink-0 h-full divide-y divide-sidebar-border overflow-y-auto"
              linkClassName="group flex items-center px-2 py-2 text-base font-medium rounded-md"
            />
          </DialogPanel>
        </TransitionChild>

        <div className="flex-shrink-0 w-14" aria-hidden="true" />
      </Dialog>
    </Transition>
  );
}

export function DesktopSidebar({
  primaryNavigationItems,
  secondaryNavigationItems,
  selectedNavigation,
}: DesktopSidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-sidebar pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto self" src="/ocean-logo.png" alt="HTW logo" />
          </div>
          <SidebarNavigation
            primaryNavigationItems={primaryNavigationItems}
            secondaryNavigationItems={secondaryNavigationItems}
            selectedNavigation={selectedNavigation}
            navClassName="mt-5 flex-1 flex flex-col divide-y divide-sidebar-border overflow-y-auto"
            linkClassName="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
