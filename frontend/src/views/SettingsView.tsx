import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SettingsNavigation } from "../constants/menu.ts";
import { settingsViewTabs } from "../constants/tabs";
import { UserClient } from "../api/userClient";
import AppLayout from "../layouts/AppLayout";
import Headline from "../components/Headline";
import ProfileCard from "../components/ProfileCard/ProfileCard";
import { Tabs } from "../components/Navigation/Tabs/Tabs";

/**
 * The settings page where users can manage their personal information.
 * - Fetches the current user's data.
 * - Displays user profile details.
 * - Provides navigation between different settings tabs.
 */
const SettingsView: React.FC = () => {
  const [activeId, setActiveId] = useState(settingsViewTabs[0].id);
  /**
   * Fetches the authenticated user's profile information.
   */
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
