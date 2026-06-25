import React from "react";

import AppLayout from "../layouts/AppLayout";
import Headline from "../components/Headline";
import { ReportingNavigation } from "../constants/menu.ts";
import { Database, DatabaseProperties } from "../types/database";
import { useMetricsQuery } from "../hooks/useMetricsQuery";
import {
  useDatabasesQuery,
  useDeleteDatabaseWithPermissionMutation,
} from "../hooks/useDatabaseQuery";
import { IStats, Stats } from "../components/Stats/Stats";
import { DatabaseAdminList } from "../components/DatabaseAdminList/DatabaseAdminList";
import { useUsersQuery } from "../hooks/useUserQuery";
import { UserAdminList } from "../components/UserAdminList/UserAdminList";

const ReportingView: React.FC = () => {
  const metricsQuery = useMetricsQuery();

  interface MetricsData {
    totalInstances: number;
    totalUsers: number;
  }
  const metrics = metricsQuery.data as MetricsData | undefined;
  const databasesQuery = useDatabasesQuery();
  const databases = Array.isArray(databasesQuery.data)
    ? (databasesQuery.data as DatabaseProperties[]).map((db) => new Database(db))
    : [];

  const deleteDatabaseWithPermissionMutation = useDeleteDatabaseWithPermissionMutation({
    onSettled: () => {
      databasesQuery.refetch();
      metricsQuery.refetch();
    },
  });
  const usersQuery = useUsersQuery();

  interface UserProperties {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    mail: string;
    employeeType: string;
  }
  const users = (usersQuery.data as UserProperties[]) || [];

  const getStats = () => {
    const result: IStats[] = [];
    if (metrics) {
      result.push({
        name: "Databases",
        value: metrics.totalInstances.toLocaleString(),
      });
      result.push({
        name: "Users",
        value: metrics.totalUsers.toLocaleString(),
      });
    }

    return result;
  };

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

  const renderMetrics = (): React.ReactElement => {
    return (
      <div>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {getStats().map((item, index) => (
            <Stats key={index} name={item.name} value={item.value} />
          ))}
        </dl>
      </div>
    );
  };

  const renderDatabases = (): React.ReactElement => {
    return (
      <div>
        <h2 className="mt-10 text-2xl leading-6 font-medium">Databases</h2>
        <DatabaseAdminList
          databases={databases}
          onDelete={(database) => deleteDatabaseWithPermissionMutation.mutate(database.id)}
        />
      </div>
    );
  };

  const renderUsers = (): React.ReactElement => {
    return (
      <div>
        <h2 className="mt-10 text-2xl leading-6 font-medium">Users</h2>
        <UserAdminList users={users} />
      </div>
    );
  };

  return render();
};

export default ReportingView;
