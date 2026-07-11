import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { routeBuilders, routePaths } from "@/app/navigation/routes.ts";
import { emptyDatabaseState } from "@/features/databases/constants/empty";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import DatabaseList from "@/features/databases/components/DatabaseList/DatabaseList";
import EmptyState from "@/components/common/EmptyState";
import Headline from "@/components/common/Headline";

const DatabasesRoute: React.FC = () => {
  const navigate = useNavigate();

  const { data: databases } = useQuery({
    queryKey: ["databases"],
    queryFn: () => DatabaseClient.getUserDatabases(),
  });

  return (
    <>
      <div className="max-w-6xl mx-auto mt-8 mb-6 px-4  sm:px-6 lg:px-8">
        <Headline title="Databases" size="large" />
      </div>
      {(databases || []).length === 0 ? (
        <EmptyState {...emptyDatabaseState} onClick={() => navigate(routePaths.createDatabase)} />
      ) : (
        <DatabaseList
          databases={databases || []}
          onClick={(id) => navigate(routeBuilders.databaseDetail(id))}
        />
      )}
    </>
  );
};

export default DatabasesRoute;
