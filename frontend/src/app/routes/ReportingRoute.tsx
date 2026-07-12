import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import ErrorState from "@/components/common/ErrorState";
import ListSkeleton from "@/components/common/ListSkeleton";
import { useMetricsQuery } from "@/features/reporting/hooks/useMetricsQuery";
import {
  useDatabasesQuery,
  useDeleteDatabaseWithPermissionMutation,
} from "@/features/databases/hooks/useDatabaseQuery";
import { IStats, Stats } from "@/features/reporting/Stats";
import { DatabaseAdminList } from "@/features/databases/components/DatabaseAdminList";
import { useUsersQuery } from "@/features/users/hooks/useUserQuery";
import { UserAdminList } from "@/features/users/components/UserAdminList";

const ReportingRoute = () => {
  const metricsQuery = useMetricsQuery();
  const databasesQuery = useDatabasesQuery();
  const deleteDatabaseWithPermissionMutation = useDeleteDatabaseWithPermissionMutation({
    onSettled: () => {
      databasesQuery.refetch();
      metricsQuery.refetch();
    },
  });
  const usersQuery = useUsersQuery();

  const stats: IStats[] = metricsQuery.data
    ? [
        {
          name: "Databases",
          value: metricsQuery.data.totalInstances.toLocaleString(),
        },
        {
          name: "Users",
          value: metricsQuery.data.totalUsers.toLocaleString(),
        },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Administration" />
      {metricsQuery.isPending ? (
        <ListSkeleton className="mt-5" rows={2} />
      ) : metricsQuery.isError ? (
        <ErrorState title="Couldn't load metrics" onRetry={() => metricsQuery.refetch()} />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <Stats key={item.name} name={item.name} value={item.value} />
          ))}
        </div>
      )}
      <div>
        <SectionHeading className="mt-10">Databases</SectionHeading>
        {databasesQuery.isPending ? (
          <ListSkeleton className="mt-8" rows={4} />
        ) : databasesQuery.isError ? (
          <ErrorState title="Couldn't load databases" onRetry={() => databasesQuery.refetch()} />
        ) : (
          <DatabaseAdminList
            databases={databasesQuery.data}
            onDelete={(database) => deleteDatabaseWithPermissionMutation.mutate(database.id)}
          />
        )}
      </div>
      <div>
        <SectionHeading className="mt-10">Users</SectionHeading>
        {usersQuery.isPending ? (
          <ListSkeleton className="mt-8" rows={4} />
        ) : usersQuery.isError ? (
          <ErrorState title="Couldn't load users" onRetry={() => usersQuery.refetch()} />
        ) : (
          <UserAdminList users={usersQuery.data} />
        )}
      </div>
    </div>
  );
};

export default ReportingRoute;
