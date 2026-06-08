import React from "react";

import AppLayout from "../layouts/AppLayout";
import Headline from "../components/Headline";
import { ReportingNavigation } from "../constants/menu.";
import {Database, DatabaseProperties} from "../types/database";
import { useMetricsQuery } from "../hooks/useMetricsQuery";
import {
  useDatabasesQuery,
  useDeleteDatabaseWithPermissionMutation,
} from "../hooks/useDatabaseQuery";
import { IStats, Stats } from "../components/Stats/Stats";
import { DatabaseAdminList } from "../components/DatabaseAdminList/DatabaseAdminList";
import { useUsersQuery } from "../hooks/useUserQuery";
import { UserAdminList } from "../components/UserAdminList/UserAdminList";

/**
 * The reporting page displaying metrics, database statistics, and user data.
 * - Fetches and displays system-wide metrics.
 * - Lists all databases and provides deletion functionality.
 * - Lists all users in the system.
 */
const ReportingView: React.FC = () => {
  const metricsQuery = useMetricsQuery();
  /**
   * Interface for metrics data retrieved from the API.
   */
  interface MetricsData {
      totalInstances: number;
      totalUsers: number;
  }
  const metrics = metricsQuery.data as MetricsData | undefined;
  const databasesQuery = useDatabasesQuery();
  const databases = Array.isArray(databasesQuery.data)
      ? (databasesQuery.data as DatabaseProperties[]).map((db) => new Database(db))
      : [];
  /**
   * Mutation hook for deleting a database with required permissions.
   * - On successful deletion, refreshes database and metrics queries.
   */
  const deleteDatabaseWithPermissionMutation =
    useDeleteDatabaseWithPermissionMutation({
      onSettled: () => {
        databasesQuery.refetch();
        metricsQuery.refetch();
      },
    });
  const usersQuery = useUsersQuery();
  /**
   * Interface for user properties.
   */
  interface UserProperties {
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      mail: string;
      employeeType: string;
  }
  const users = (usersQuery.data as UserProperties[]) || [];
  /**
   * Generates an array of metric statistics to display.
   *
   * @returns An array of statistics containing metric names and values.
   */
  const getStats = () => {
    const result: IStats[] = [];
    if (metrics) {
      result.push({
        name: "Total Databases",
        value: metrics.totalInstances.toLocaleString(),
      });
      result.push({
        name: "Total Users",
        value: metrics.totalUsers.toLocaleString(),
      });
    }

    return result;
  };
  /**
   * Renders the reporting page layout.
   *
   * @returns The React element containing all reporting sections.
   */
  const render = (): React.ReactElement => {
    return (
      <AppLayout selectedNavigation={ReportingNavigation.name}>
        <div>
          <Headline title="Reporting" size="large" />
          {renderMetrics()}
          {renderDatabases()}
          {renderUsers()}
        </div>
      </AppLayout>
    );
  };
  /**
   * Renders the metrics section displaying system-wide statistics.
   *
   * @returns The React element containing total database and user counts.
   */
  const renderMetrics = (): React.ReactElement => {
    return (
      <div>
        <h2 className="mt-5 text-2xl leading-6 font-medium text-gray-900">
          Metrics: Total
        </h2>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {getStats().map((item, index) => (
            <Stats key={index} name={item.name} value={item.value} />
          ))}
        </dl>
      </div>
    );
  };
  /**
   * Renders the databases section listing all available databases.
   * - Provides the option to delete databases with required permissions.
   *
   * @returns The React element containing the database list.
   */
  const renderDatabases = (): React.ReactElement => {
    return (
      <div>
        <h2 className="mt-10 text-2xl leading-6 font-medium text-gray-900">
          All Databases
        </h2>
        <DatabaseAdminList
          databases={databases}
          onDelete={(database) =>
            deleteDatabaseWithPermissionMutation.mutate(database.id)
          }
        />
      </div>
    );
  };
  /**
   * Renders the users section listing all registered users.
   *
   * @returns The React element containing the user list.
   */
  const renderUsers = (): React.ReactElement => {
    return (
      <div>
        <h2 className="mt-10 text-2xl leading-6 font-medium text-gray-900">
          All Users
        </h2>
        <UserAdminList users={users} />
      </div>
    );
  };

  return render();
};

export default ReportingView;
