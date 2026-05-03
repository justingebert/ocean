import React from 'react';
import { useState } from 'react';

import { RoleProperties } from '../../types/role';

/**
 * Props for the `RoleListEntry` component.
 */
export interface RoleListEntryProps {
    /** The role object containing role details. */
    role: RoleProperties;
    /** Callback function triggered when a role is deleted. */
    onDelete: (role: RoleProperties) => void;
}

/**
 * Renders a single role entry in the role list.
 * - Displays role name and password.
 * - Provides options to show/hide password.
 * - Includes a delete action.
 */
const RoleListEntry: React.FC<RoleListEntryProps> = ({ role, onDelete }) => {
    /** State to toggle password visibility. */
    const [showPassword, setShowPassword] = useState(false);
    /**
     * Renders the password field.
     * - Toggles between showing and hiding the password.
     *
     * @returns A React element displaying the password or a "show" button.
     */
    const renderPassword = (): React.ReactNode => {
        if (showPassword) {
            return (
                <div className="text-sm">
                    <span className="text-gray-500">{role.password}</span>
                    <span className="ml-2 text-blue-500 cursor-pointer" onClick={() => setShowPassword(false)}>hide</span>
                </div>)
        } else {
            return <div className="text-sm text-blue-500 cursor-pointer" onClick={() => setShowPassword(true)}>show</div>
        }
    }

    return (
        <tr >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{renderPassword()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="text-red-600 hover:text-red-900 cursor-pointer" onClick={() => onDelete(role)}>
                    Delete
                </div>
            </td>
        </tr>
    );
}

export default RoleListEntry;
