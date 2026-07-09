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

import Headline from "../../Headline";
import { cn } from "@/lib/utils.ts";
import { InvitedUserProperties, User, UserProperties } from "@/types/user.ts";

interface DatabaseInvitationsPanelProps {
  users: UserProperties[];
  invitedUsers: InvitedUserProperties[];
  selectedUserIds: number[];
  onSelectUser: (userId: number) => void;
  onDeselectUser: (userId: number) => void;
}

export function DatabaseInvitationsPanel({
  users,
  invitedUsers,
  selectedUserIds,
  onSelectUser,
  onDeselectUser,
}: DatabaseInvitationsPanelProps) {
  return (
    <div className="z-50">
      <InvitationUserSelector
        users={users}
        selectedUserIds={selectedUserIds}
        onSelect={onSelectUser}
        onDeselect={onDeselectUser}
      />
      <div className="my-5">
        <Headline title="Invitations" size="medium" />
        <p className="mt-1 text-sm text-gray-500">Invite other people</p>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <InvitationHeaderCell value="Username" />
                    <InvitationHeaderCell value="Name" />
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {invitedUsers.map((invitedUser) => (
                    <tr key={invitedUser.invitationId}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {invitedUser.username}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {User.getDisplayName({ ...invitedUser, mail: "", employeeType: "" })}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div
                          className="cursor-pointer text-red-600 hover:text-red-900"
                          onClick={() => onDeselectUser(invitedUser.id)}
                        >
                          Delete
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvitationHeaderCell({ value }: { value: string }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
    >
      {value}
    </th>
  );
}

function InvitationUserSelector({
  users,
  selectedUserIds,
  onSelect,
  onDeselect,
}: {
  users: UserProperties[];
  selectedUserIds: number[];
  onSelect: (userId: number) => void;
  onDeselect: (userId: number) => void;
}) {
  const onChange = (value: UserProperties | undefined) => {
    if (value) {
      const isSelected = selectedUserIds.includes(value.id);
      if (isSelected) {
        onDeselect(value.id);
      } else {
        onSelect(value.id);
      }
    }
  };

  return (
    <Listbox value={undefined} onChange={onChange}>
      <Label className="block text-sm font-medium text-gray-700">Select to invite</Label>
      <div className="relative mt-1">
        <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
          <span className="inline-flex w-full truncate">
            <span className="truncate"></span>
            <span className="ml-2 truncate text-gray-500"></span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {users.map((user) => (
              <ListboxOption
                key={user.username}
                className={({ focus }) =>
                  cn(
                    focus ? "bg-indigo-600 text-white" : "text-gray-900",
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                  )
                }
                value={user}
              >
                {({ focus }) => (
                  <>
                    <div className="flex">
                      <span
                        className={cn(
                          selectedUserIds.includes(user.id) ? "font-semibold" : "font-normal",
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

                    {selectedUserIds.includes(user.id) ? (
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
}
