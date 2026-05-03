import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DatabasesNavigation } from "../../constants/menu.";
import { emptyDatabaseState } from "../../constants/empty";
import { DatabaseClient } from "../../api/databaseClient";
import AppLayout from "../../layouts/AppLayout";
import DatabaseList from "../../components/DatabaseList/DatabaseList";
import EmptyState from "../../components/EmptyState";
import Headline from "../../components/Headline";

/**
 * Props for the `DatabasesView` component.
 * Currently, this component does not accept any props.
 */
interface DatabasesViewProps {}
/**
 * View component for displaying the list of user-specific databases.
 * - Fetches databases using `react-query`.
 * - Shows an empty state if no databases are available.
 * - Navigates to a new database creation page or details page when clicked.
 */
const DatabasesView: React.FC<DatabasesViewProps> = () => {
  const navigate = useNavigate();
    /**
     * Fetches the databases associated with the current user.
     */
    const { data: databases } = useQuery({
        queryKey: ["databases"],
        queryFn: () => DatabaseClient.getUserDatabases()
    });

    return (
    <AppLayout selectedNavigation={DatabasesNavigation.name}>
      <div className="max-w-6xl mx-auto mt-8 mb-6 px-4  sm:px-6 lg:px-8">
        <Headline title="Databases" size="large" />
      </div>
      {(databases || []).length === 0 ? (
        /**
         * Displays an empty state when there are no databases.
         * Provides a button to navigate to the new database creation page.
         */
        <EmptyState
          {...emptyDatabaseState}
          onClick={() => navigate("/databases/new")}
        />
      ) : (
        /**
         * Displays the list of databases if available.
         * Clicking on a database navigates to its details page.
         */
        <DatabaseList
          databases={databases || []}
          onClick={(id) => navigate(`/databases/${id}`)}
        />
      )}
    </AppLayout>
  );
};

export default DatabasesView;
