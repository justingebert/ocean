import React from "react";
import { useQuery } from "@tanstack/react-query";

import { UserClient } from "@/api/userClient";
import { PageHeader } from "@/components/common/PageHeader";
import ErrorState from "@/components/common/ErrorState";
import ProfileCard from "@/features/users/components/ProfileCard";

const SettingsRoute: React.FC = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
    meta: { errorMessage: "Couldn't load profile" },
  });

  return (
    <div>
      <PageHeader title="Profile" />
      {userQuery.isError ? (
        <ErrorState title="Couldn't load profile" onRetry={() => userQuery.refetch()} />
      ) : (
        <ProfileCard user={userQuery.data} loading={userQuery.isFetching} />
      )}
    </div>
  );
};

export default SettingsRoute;
