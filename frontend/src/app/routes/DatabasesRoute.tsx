import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { routeBuilders, routePaths } from "@/app/navigation/routes.ts";
import { emptyDatabaseState } from "@/features/databases/constants/empty";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import DatabaseList from "@/features/databases/components/DatabaseList/DatabaseList";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import ListSkeleton from "@/components/common/ListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

const DatabasesRoute: React.FC = () => {
  const navigate = useNavigate();

  const databasesQuery = useQuery({
    queryKey: ["databases"],
    queryFn: () => DatabaseClient.getUserDatabases(),
    meta: { errorMessage: "Couldn't load databases" },
  });

  const databases = databasesQuery.data ?? [];

  return (
    <>
      <PageHeader title="Databases" />
      {databasesQuery.isPending ? (
        <ListSkeleton rows={4} />
      ) : databasesQuery.isError ? (
        <ErrorState
          title="Couldn't load databases"
          onRetry={() => databasesQuery.refetch()}
        />
      ) : databases.length === 0 ? (
        <EmptyState {...emptyDatabaseState} onClick={() => navigate(routePaths.createDatabase)} />
      ) : (
        <DatabaseList
          databases={databases}
          onClick={(id) => navigate(routeBuilders.databaseDetail(id))}
        />
      )}
    </>
  );
};

export default DatabasesRoute;
