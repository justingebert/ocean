import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import ErrorState from "@/components/common/ErrorState";
import ListSkeleton from "@/components/common/ListSkeleton";
import {
  useDatabasesQuery,
  useDeleteDatabaseWithPermissionMutation,
  useSetDatabaseNeverExpiresMutation,
} from "@/features/databases/hooks/useDatabaseQuery";
import { DatabaseAdminList } from "@/features/databases/components/DatabaseAdminList";
import { useUsersQuery } from "@/features/users/hooks/useUserQuery";
import { UserAdminList } from "@/features/users/components/UserAdminList";
import { config } from "@/lib/config";

const monitoringLinks = [
  { label: "Logs", path: "/logs/" },
  { label: "VM Resources", path: "/resources/" },
];

const ReportingRoute = () => {
  const databasesQuery = useDatabasesQuery();
  const deleteDatabaseWithPermissionMutation = useDeleteDatabaseWithPermissionMutation({
    onError: () => toast.error("Couldn't delete database"),
    onSettled: () => databasesQuery.refetch(),
  });
  const setNeverExpiresMutation = useSetDatabaseNeverExpiresMutation({
    onError: () => toast.error("Couldn't change expiry"),
    onSettled: () => databasesQuery.refetch(),
  });
  const usersQuery = useUsersQuery();

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
        <section className="flex flex-col gap-4">
          <SectionHeading>
            Databases <Count value={databasesQuery.data?.length} />
          </SectionHeading>
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
          <SectionHeading>
            Users <Count value={usersQuery.data?.length} />
          </SectionHeading>
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

const Count = ({ value }: { value: number | undefined }) =>
  value === undefined ? null : (
    <span className="font-normal text-muted-foreground tabular-nums">
      ({value.toLocaleString()})
    </span>
  );

export default ReportingRoute;
