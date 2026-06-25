import React from "react";
import { Fragment } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { cn } from "../../lib/utils.ts";
import { User, UserProperties } from "../../types/user";

export interface UserSelectorProps {
  users: UserProperties[];

  selectedUserIds: number[];

  onSelect?: (value: UserProperties) => void;

  onDeselect?: (value: UserProperties) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUserIds,
  onSelect,
  onDeselect,
}) => {
  const onChange = (value: UserProperties | undefined) => {
    if (value) {
      const isSelected = selectedUserIds.find((id) => id === value.id);
      if (isSelected === undefined && onSelect) {
        onSelect(value);
      } else if (isSelected && onDeselect) {
        onDeselect(value);
      }
    }
  };

  return (
    <Listbox value={undefined} onChange={onChange}>
      <Label className="block text-sm font-medium text-gray-700">Select to invite</Label>
      <div className="mt-1 relative">
        <ListboxButton className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <span className="w-full inline-flex truncate">
            <span className="truncate"></span>
            <span className="ml-2 truncate text-gray-500"></span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {users.map((user) => (
              <ListboxOption
                key={user.username}
                className={({ focus }) =>
                  cn(
                    focus ? "text-white bg-indigo-600" : "text-gray-900",
                    "cursor-default select-none relative py-2 pl-3 pr-9",
                  )
                }
                value={user}
              >
                {({ focus }) => (
                  <>
                    <div className="flex">
                      <span
                        className={cn(
                          selectedUserIds.find((id) => id === user.id)
                            ? "font-semibold"
                            : "font-normal",
                          "truncate",
                        )}
                      >
                        {User.getDisplayName(user)}
                      </span>
                      <span
                        className={cn(focus ? "text-indigo-200" : "text-gray-500", "ml-2 truncate")}
                      >
                        {user.username}
                      </span>
                    </div>

                    {selectedUserIds.find((id) => id === user.id) ? (
                      <span
                        className={cn(
                          focus ? "text-white" : "text-indigo-600",
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
};

export default UserSelector;
