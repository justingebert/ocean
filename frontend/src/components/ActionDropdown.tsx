import React, { Fragment } from "react";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/20/solid";

import { cn } from "../lib/utils.ts";

export interface ActionDropdownProps {
  onDelete?: () => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ onDelete }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <MenuButton className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-5 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
              Actions
              {open ? (
                <ChevronUpIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              )}
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
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
            >
              <div className="py-1">
                <MenuItem>
                  {({ focus }) => (
                    <div
                      className={cn(
                        focus ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm text-red-600",
                      )}
                      onClick={() => onDelete && onDelete()}
                    >
                      <TrashIcon
                        className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500"
                        aria-hidden="true"
                      />
                      Delete
                    </div>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default ActionDropdown;
