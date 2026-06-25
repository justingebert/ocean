import React from "react";
import { useState } from "react";

import { RoleProperties } from "../../types/role";

export interface RoleListEntryProps {
  role: RoleProperties;

  onDelete: (role: RoleProperties) => void;
}

const RoleListEntry: React.FC<RoleListEntryProps> = ({ role, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const renderPassword = (): React.ReactNode => {
    if (showPassword) {
      return (
        <div className="text-sm">
          <span className="text-gray-500">{role.password}</span>
          <span
            className="ml-2 text-blue-500 cursor-pointer"
            onClick={() => setShowPassword(false)}
          >
            hide
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-blue-500 cursor-pointer" onClick={() => setShowPassword(true)}>
          show
        </div>
      );
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{renderPassword()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div
          className="text-red-600 hover:text-red-900 cursor-pointer"
          onClick={() => onDelete(role)}
        >
          Delete
        </div>
      </td>
    </tr>
  );
};

export default RoleListEntry;
