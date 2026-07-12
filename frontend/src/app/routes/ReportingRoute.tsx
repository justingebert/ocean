import Headline from "@/components/common/Headline";
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
      <Headline title="Administration" size="large" />
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <Stats key={item.name} name={item.name} value={item.value} />
        ))}
      </dl>
      <section>
        <h2 className="mt-10 text-2xl leading-6 font-medium">Databases</h2>
        <DatabaseAdminList
          databases={databasesQuery.data ?? []}
          onDelete={(database) => deleteDatabaseWithPermissionMutation.mutate(database.id)}
        />
      </section>
      <section>
        <h2 className="mt-10 text-2xl leading-6 font-medium">Users</h2>
        <UserAdminList users={usersQuery.data ?? []} />
      </section>
    </div>
  );
};

export default ReportingRoute;
