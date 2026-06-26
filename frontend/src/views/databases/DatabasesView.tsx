import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DatabasesNavigation } from "../../navigation/navigation.ts";
import { routeBuilders, routePaths } from "../../navigation/routes.ts";
import { emptyDatabaseState } from "../../constants/empty";
import { DatabaseClient } from "../../api/databaseClient";
import AppLayout from "../../layouts/AppLayout";
import DatabaseList from "../../components/DatabaseList/DatabaseList";
import EmptyState from "../../components/EmptyState";
import Headline from "../../components/Headline";

const DatabasesView: React.FC = () => {
  const navigate = useNavigate();

  const { data: databases } = useQuery({
    queryKey: ["databases"],
    queryFn: () => DatabaseClient.getUserDatabases(),
  });

  return (
    <AppLayout selectedNavigation={DatabasesNavigation.name}>
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
    </AppLayout>
  );
};

export default DatabasesView;
