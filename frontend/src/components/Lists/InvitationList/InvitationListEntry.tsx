import React from "react";

import { InvitationProperties } from "../../../types/invitation";
import { User, UserProperties } from "../../../types/user";

export type IInvitedUser = Pick<UserProperties, "id" | "username" | "firstName" | "lastName"> &
  Pick<InvitationProperties, "createdAt"> & {
    invitationId: number;
  };

export interface InvitationListEntryProps {
  invitedUser: IInvitedUser;

  onDelete?: (user: IInvitedUser) => void;
}

const InvitationListEntry: React.FC<InvitationListEntryProps> = ({ invitedUser, onDelete }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {invitedUser.username}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 ">
          {User.getDisplayName({ ...invitedUser, mail: "", employeeType: "" })}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div
          className="text-red-600 hover:text-red-900 cursor-pointer"
          onClick={() => onDelete && onDelete(invitedUser)}
        >
          Delete
        </div>
      </td>
    </tr>
  );
};

export default InvitationListEntry;
