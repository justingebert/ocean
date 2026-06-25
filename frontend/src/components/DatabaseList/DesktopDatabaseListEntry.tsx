import React from "react";
import { Link } from "react-router-dom";

import { DatabasesNavigation } from "../../constants/menu.ts";
import { getDatabaseCreatedAt, getDatabaseEngineTitle } from "./databaseListFormat";
import { DatabaseProperties } from "../../types/database";
import DatabaseEngineLogo from "./DatabaseEngineLogo";

interface DesktopDatabaseListEntryProps {
  database: DatabaseProperties;

  onClick?: (id: number) => void;
}

const DesktopDatabaseListEntry: React.FC<DesktopDatabaseListEntryProps> = ({
  database,
  onClick,
}) => {
  return (
    <tr className="bg-white" onClick={() => onClick && onClick(database.id)}>
      <td className="max-w-0 w-full px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex">
          <Link
            to={DatabasesNavigation.to}
            className="group inline-flex space-x-2 truncate text-sm"
          >
            <DatabaseEngineLogo className="h-5 w-5" engine={database.engine} />
            <p className="text-gray-500 truncate group-hover:text-gray-900">{database.name}</p>
          </Link>
        </div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
        <span
          className={
            "bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
          }
        >
          {getDatabaseEngineTitle(database.engine)}
        </span>
      </td>
      <td className="hidden px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500 md:block">
        <time dateTime={database.createdAt.toLocaleString()}>
          {getDatabaseCreatedAt(database.createdAt)}
        </time>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500 ">
        <Link to={DatabasesNavigation.to} className="text-blue-900 hover:text-blue-500">
          More
        </Link>
      </td>
    </tr>
  );
};

export default DesktopDatabaseListEntry;
