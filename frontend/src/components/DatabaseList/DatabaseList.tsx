import React from "react";
import { compareDesc } from "date-fns";

import MobileDatabaseListEntry from "./MobileDatabaseListEntry";
import DesktopDatabaseListEntry from "./DesktopDatabaseListEntry";
import { DatabaseProperties } from "../../types/database";

/**
 * Props for the `DatabaseList` component.
 */
export interface DatabaseListProps {
  /** The list of databases to display. */
  databases: ReadonlyArray<DatabaseProperties>;
  /** Optional callback function triggered when a database entry is clicked. */
  onClick?: (id: number) => void;
}

/**
 * Renders a list of databases in a responsive layout.
 * - Displays databases differently for mobile and desktop views.
 * - Sorts databases by creation date (newest first).
 */
const DatabaseList: React.FC<DatabaseListProps> = ({ databases, onClick }) => {
  /** Sorted list of databases, ordered by creation date (newest first). */
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));
  return (
    <>
      {/*Mobile*/}
      <div className="shadow sm:hidden">
        <ul className="mt-2 divide-y divide-gray-200 overflow-hidden shadow sm:hidden">
          {sortedDatabases.map((database, index) => (
            <MobileDatabaseListEntry key={index} database={database} onClick={onClick} />
          ))}
        </ul>
      </div>
      {/*Desktop*/}
      <div className="hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mt-2">
            <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engine
                    </th>
                    <th className="hidden px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider md:block">
                      Created
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDatabases.map((database, index) => (
                    <DesktopDatabaseListEntry key={index} database={database} onClick={onClick} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DatabaseList;
