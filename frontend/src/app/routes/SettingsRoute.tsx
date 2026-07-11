import React from "react";
import { useQuery } from "@tanstack/react-query";

import { UserClient } from "@/api/userClient";
import Headline from "@/components/common/Headline";
import ProfileCard from "@/features/users/components/ProfileCard";

const SettingsRoute: React.FC = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  return (
    <div>
      <Headline title="Settings" size="large" />
      <ProfileCard user={userQuery.data} loading={userQuery.isFetching} />
    </div>
  );
};

export default SettingsRoute;
