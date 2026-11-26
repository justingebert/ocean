import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import ErrorState from "@/components/common/ErrorState";
import ListSkeleton from "@/components/common/ListSkeleton";
import { useMetricsQuery } from "@/features/reporting/hooks/useMetricsQuery";
import {
  useDatabasesQuery,
  useDeleteDatabaseWithPermissionMutation,
  useSetDatabaseNeverExpiresMutation,
} from "@/features/databases/hooks/useDatabaseQuery";
import { IStats, Stats } from "@/features/reporting/Stats";
import { DatabaseAdminList } from "@/features/databases/components/DatabaseAdminList";
import { useUsersQuery } from "@/features/users/hooks/useUserQuery";
import { UserAdminList } from "@/features/users/components/UserAdminList";
import { config } from "@/lib/config";

const monitoringLinks = [
  { label: "Logs", path: "/logs/" },
  { label: "VM Resources", path: "/resources/" },
];

const ReportingRoute = () => {
  const metricsQuery = useMetricsQuery();
  const databasesQuery = useDatabasesQuery();
  const deleteDatabaseWithPermissionMutation = useDeleteDatabaseWithPermissionMutation({
    onError: () => toast.error("Couldn't delete database"),
    onSettled: () => {
      databasesQuery.refetch();
      metricsQuery.refetch();
    },
  });
  const setNeverExpiresMutation = useSetDatabaseNeverExpiresMutation({
    onError: () => toast.error("Couldn't change expiry"),
    onSettled: () => databasesQuery.refetch(),
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

  const usernames = new Map(usersQuery.data?.map((user) => [user.id, user.username]));

  return (
    <>
      <PageHeader
        title="Administration"
        actions={
          config.monitoringUrl
            ? monitoringLinks.map((link) => (
                <a
                  key={link.path}
                  href={`${config.monitoringUrl}${link.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ExternalLinkIcon data-icon="inline-start" />
                  {link.label}
                </a>
              ))
            : undefined
        }
      />
      <div className="flex flex-col gap-10">
        {metricsQuery.isPending ? (
          <ListSkeleton rows={2} />
        ) : metricsQuery.isError ? (
          <ErrorState title="Couldn't load metrics" onRetry={() => metricsQuery.refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((item) => (
              <Stats key={item.name} name={item.name} value={item.value} />
            ))}
          </div>
        )}
        <section className="flex flex-col gap-4">
          <SectionHeading>Databases</SectionHeading>
          {databasesQuery.isPending ? (
            <ListSkeleton rows={4} />
          ) : databasesQuery.isError ? (
            <ErrorState title="Couldn't load databases" onRetry={() => databasesQuery.refetch()} />
          ) : (
            <DatabaseAdminList
              databases={databasesQuery.data}
              getOwnerName={(userId) => usernames.get(userId)}
              onDelete={(database) => deleteDatabaseWithPermissionMutation.mutateAsync(database.id)}
              onNeverExpiresChange={(database, neverExpires) =>
                setNeverExpiresMutation.mutate({ id: database.id, neverExpires })
              }
            />
          )}
        </section>
        <section className="flex flex-col gap-4">
          <SectionHeading>Users</SectionHeading>
          {usersQuery.isPending ? (
            <ListSkeleton rows={4} />
          ) : usersQuery.isError ? (
            <ErrorState title="Couldn't load users" onRetry={() => usersQuery.refetch()} />
          ) : (
            <UserAdminList users={usersQuery.data} />
          )}
        </section>
      </div>
    </>
  );
};

export default ReportingRoute;
