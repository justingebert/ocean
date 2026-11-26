import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { routeBuilders, routePaths } from "@/app/navigation/routes.ts";
import { UserClient } from "@/api/userClient";
import { emptyDatabaseState } from "@/features/databases/constants/empty";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import DatabaseList from "@/features/databases/components/DatabaseList/DatabaseList";
import { summarizeDatabases } from "@/features/databases/components/DatabaseList/databaseListFormat";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import ListSkeleton from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/greeting";

const DatabasesRoute: React.FC = () => {
  // Rolled once per visit, so the greeting doesn't change on re-render.
  const [greetingRoll] = useState(Math.random);
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });
  const databasesQuery = useQuery({
    queryKey: ["databases"],
    queryFn: () => DatabaseClient.getUserDatabases(),
    meta: { errorMessage: "Couldn't load databases" },
  });

  const databases = databasesQuery.data ?? [];

  return (
    <>
      <PageHeader
        title={getGreeting(userQuery.data?.firstName, greetingRoll)}
        description={databases.length > 0 ? summarizeDatabases(databases) : undefined}
        actions={
          databases.length > 0 ? (
            <Button render={<Link to={routePaths.createDatabase} />}>
              <PlusIcon data-icon="inline-start" />
              New database
            </Button>
          ) : undefined
        }
      />
      {databasesQuery.isPending ? (
        <ListSkeleton rows={4} />
      ) : databasesQuery.isError ? (
        <ErrorState title="Couldn't load databases" onRetry={() => databasesQuery.refetch()} />
      ) : databases.length === 0 ? (
        <EmptyState {...emptyDatabaseState} to={routePaths.createDatabase} />
      ) : (
        <DatabaseList databases={databases} getHref={routeBuilders.databaseDetail} />
      )}
    </>
  );
};

export default DatabasesRoute;
