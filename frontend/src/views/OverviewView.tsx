import React from "react";

import AppLayout from "../layouts/AppLayout";
import { OverviewNavigation } from "../navigation/navigation.ts";
import { startingPoints } from "../constants/starting";
import StartingPoints from "../components/StartingPoints";

const OverviewView: React.FC = () => {
  return (
    <AppLayout selectedNavigation={OverviewNavigation.name}>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Provision and manage your databases in one place.
        </p>
      </header>
      <StartingPoints startingPoints={startingPoints} />
    </AppLayout>
  );
};

export default OverviewView;
