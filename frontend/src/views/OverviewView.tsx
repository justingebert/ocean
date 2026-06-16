import React from "react";

import AppLayout from "../layouts/AppLayout";
import { OverviewNavigation } from "../constants/menu.ts";
import { startingPoints } from "../constants/starting";
import Headline from "../components/Headline";
import StartingPoints from "../components/StartingPoints";

/**
 * The overview page that serves as the main landing page after login.
 * - Displays an introduction headline.
 * - Provides links to starting points for quick navigation.
 */
const OverviewView: React.FC = () => {
  return (
    <AppLayout selectedNavigation={OverviewNavigation.name}>
      <Headline title="Overview" size="large" />
      <StartingPoints
        title="Getting started"
        description="Get started by selecting a template."
        startingPoints={startingPoints}
      />
    </AppLayout>
  );
};

export default OverviewView;
