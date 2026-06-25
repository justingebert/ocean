import React from "react";

import InvitationListEntry, { IInvitedUser } from "./InvitationListEntry";

export interface InvitationListProps {
  invitedUsers: ReadonlyArray<IInvitedUser>;

  onDelete?: (value: IInvitedUser) => void;
}

export const InvitationList: React.FC<InvitationListProps> = ({ invitedUsers, onDelete }) => {
  const renderHeaderCell = (value: string): React.ReactElement => {
    return (
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {value}
      </th>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {renderHeaderCell("Username")}
                  {renderHeaderCell("Name")}
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitedUsers.map((invitedUser, index) => (
                  <InvitationListEntry
                    key={index}
                    invitedUser={invitedUser}
                    onDelete={() => onDelete && onDelete(invitedUser)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
