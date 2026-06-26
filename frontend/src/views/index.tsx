import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Navigate, Routes, Outlet } from "react-router-dom";

import { useAuth } from "../auth/authContext";
import { AuthLoadingScreen } from "../components/AuthLoadingScreen";
import { routePaths } from "../navigation/routes.ts";
import SignInView from "./SignInView";
import LoadingView from "./LoadingView";

const OverviewView = React.lazy(() => import("./OverviewView"));
const DatabasesView = React.lazy(() => import("./databases/DatabasesView"));
const CreateDatabaseView = React.lazy(() => import("./databases/CreateDatabaseView"));
const DatabaseDetailView = React.lazy(() => import("./databases/DatabaseDetailView"));
const ReportingView = React.lazy(() => import("./ReportingView"));
const SettingsView = React.lazy(() => import("./SettingsView"));
const FAQView = React.lazy(() => import("./FAQView"));
const PageNotFoundView = React.lazy(() => import("./PageNotFoundView"));

const RootView: React.FC = () => {
  const { status } = useAuth();

  if (status === "checking") {
    return <AuthLoadingScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingView />}>
        <Routes>
          <Route
            path={routePaths.root}
            element={
              <Navigate
                to={status === "authenticated" ? routePaths.overview : routePaths.login}
                replace
              />
            }
          />

          <Route path={routePaths.login} element={<SignInView />} />

          <Route element={<ProtectedRoute />}>
            <Route path={routePaths.overview} element={<OverviewView />} />
            <Route path={routePaths.databases} element={<DatabasesView />} />
            <Route path={routePaths.createDatabase} element={<CreateDatabaseView />} />
            <Route path={routePaths.databaseDetail} element={<DatabaseDetailView />} />
            <Route path={routePaths.reporting} element={<ReportingView />} />
            <Route path={routePaths.settings} element={<SettingsView />} />
            <Route path={routePaths.faq} element={<FAQView />} />
          </Route>

          <Route path={routePaths.error} element={<PageNotFoundView />} />

          <Route path="*" element={<Navigate to={routePaths.error} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

const ProtectedRoute = () => {
  const { status } = useAuth();

  if (status === "checking") {
    return <AuthLoadingScreen />;
  }

  return status === "authenticated" ? <Outlet /> : <Navigate to={routePaths.login} replace />;
};

export default RootView;
