import React from "react";
import { useQuery } from "@tanstack/react-query";

import { UserClient } from "@/api/userClient";
import { PageHeader } from "@/components/common/PageHeader";
import ProfileCard from "@/features/users/components/ProfileCard";

const SettingsRoute: React.FC = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  return (
    <div>
      <PageHeader title="Profile" />
      <ProfileCard user={userQuery.data} loading={userQuery.isFetching} />
    </div>
  );
};

export default SettingsRoute;
