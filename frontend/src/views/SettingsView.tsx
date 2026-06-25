import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SettingsNavigation } from "../constants/menu.ts";
import { settingsViewTabs } from "../constants/tabs";
import { UserClient } from "../api/userClient";
import AppLayout from "../layouts/AppLayout";
import Headline from "../components/Headline";
import ProfileCard from "../components/ProfileCard/ProfileCard";
import { Tabs } from "../components/Navigation/Tabs/Tabs";

const SettingsView: React.FC = () => {
  const [activeId, setActiveId] = useState(settingsViewTabs[0].id);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  return (
    <AppLayout selectedNavigation={SettingsNavigation.name}>
      <div>
        <Headline title="Settings" size="large" />
        <Tabs tabs={settingsViewTabs} activeId={activeId} onSelect={setActiveId} />
        <ProfileCard user={userQuery.data} loading={userQuery.isFetching} />
      </div>
    </AppLayout>
  );
};

export default SettingsView;
