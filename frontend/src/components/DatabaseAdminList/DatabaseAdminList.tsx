import React from "react";
import { compareDesc } from "date-fns";

import { Database } from "../../types/database";
import { getDatabaseCreatedAt, getDatabaseEngineTitle } from "../DatabaseList/databaseListFormat";

export interface DatabaseAdminListProps {
  databases: ReadonlyArray<Database>;
  onDelete?: (database: Database) => void;
}
/**
 * Displays a table of all databases in an admin panel.
 * - Allows sorting databases by creation date.
 * - Provides an optional delete action for each database.
 */
export const DatabaseAdminList: React.FC<DatabaseAdminListProps> = ({ databases, onDelete }) => {
  /** Sorted list of databases, ordered by creation date (newest first). */
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));
  /**
   * Renders the full database list component.
   *
   * @returns The React element containing the database table.
   */
  const render = (): React.ReactElement => {
    return (
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                {renderTableHead()}
                {renderTableBody()}
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  /**
   * Renders the table header for the database list.
   *
   * @returns The React element containing column headers.
   */
  const renderTableHead = (): React.ReactElement => {
    return (
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Name
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Owner ID
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Engine
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Created
          </th>
          <th
            scope="col"
            className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
          >
            Action
          </th>
        </tr>
      </thead>
    );
  };
  /**
   * Renders the table body displaying the list of databases.
   *
   * @returns The React element containing database rows.
   */
  const renderTableBody = (): React.ReactElement => {
    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {sortedDatabases.map((database) => (
          <tr key={database.id}>
            <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
              {database.name}
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">{database.userId}</td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
              <span
                className={
                  "bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                }
              >
                {getDatabaseEngineTitle(database.engine)}
              </span>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
              <time dateTime={database.createdAt.toLocaleString()}>
                {getDatabaseCreatedAt(database.createdAt)}
              </time>
            </td>
            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
              <div
                className="text-red-600 hover:text-red-900 cursor-pointer"
                onClick={() => onDelete && onDelete(database)}
              >
                Delete
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return render();
};
