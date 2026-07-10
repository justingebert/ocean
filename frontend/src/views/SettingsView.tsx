import React from "react";
import { useQuery } from "@tanstack/react-query";

import { SettingsNavigation } from "../navigation/navigation.ts";
import { UserClient } from "../api/userClient";
import AppLayout from "../layouts/AppLayout";
import Headline from "../components/Headline";
import ProfileCard from "../components/ProfileCard/ProfileCard";

const SettingsView: React.FC = () => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  return (
    <AppLayout selectedNavigation={SettingsNavigation.name}>
      <div>
        <Headline title="Settings" size="large" />
        <ProfileCard user={userQuery.data} loading={userQuery.isFetching} />
      </div>
    </AppLayout>
  );
};

export default SettingsView;
