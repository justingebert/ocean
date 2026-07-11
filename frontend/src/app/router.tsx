import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Navigate, Routes, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { AuthLoadingScreen } from "@/features/auth/components/AuthLoadingScreen";
import { routePaths } from "@/app/navigation/routes.ts";
import SignInRoute from "./routes/SignInRoute";
import LoadingRoute from "./routes/LoadingRoute";

const AppLayout = React.lazy(() => import("./layout/AppLayout"));
const OverviewRoute = React.lazy(() => import("./routes/OverviewRoute"));
const DatabasesRoute = React.lazy(() => import("./routes/DatabasesRoute"));
const CreateDatabaseRoute = React.lazy(() => import("./routes/CreateDatabaseRoute"));
const DatabaseDetailRoute = React.lazy(() => import("./routes/DatabaseDetailRoute"));
const ReportingRoute = React.lazy(() => import("./routes/ReportingRoute"));
const SettingsRoute = React.lazy(() => import("./routes/SettingsRoute"));
const FAQRoute = React.lazy(() => import("./routes/FAQRoute"));
const NotFoundRoute = React.lazy(() => import("./routes/NotFoundRoute"));

const RootView: React.FC = () => {
  const { status } = useAuth();

  if (status === "checking") {
    return <AuthLoadingScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingRoute />}>
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

          <Route path={routePaths.login} element={<SignInRoute />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={routePaths.overview} element={<OverviewRoute />} />
              <Route path={routePaths.databases} element={<DatabasesRoute />} />
              <Route path={routePaths.createDatabase} element={<CreateDatabaseRoute />} />
              <Route path={routePaths.databaseDetail} element={<DatabaseDetailRoute />} />
              <Route path={routePaths.reporting} element={<ReportingRoute />} />
              <Route path={routePaths.settings} element={<SettingsRoute />} />
              <Route path={routePaths.faq} element={<FAQRoute />} />
            </Route>
          </Route>

          <Route path={routePaths.error} element={<NotFoundRoute />} />

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
