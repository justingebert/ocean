import React from "react";

import AppLayout from "../layouts/AppLayout";
import { OverviewNavigation } from "../constants/menu.";
import { startingPoints } from "../constants/starting";
import Headline from "../components/Headline";
import StartingPoints from "../components/StartingPoints";

/** The issue tracking link, fetched from environment variables. */
const { VITE_ISSUE_LINK } = import.meta.env;
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
        moreHref={VITE_ISSUE_LINK || "#"}
      />
    </AppLayout>
  );
};

export default OverviewView;
