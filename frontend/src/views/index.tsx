import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Navigate, Routes, Outlet } from "react-router-dom";

import { useAuth } from "../auth/authContext";
import { AuthLoadingScreen } from "../components/AuthLoadingScreen";
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
            path="/"
            element={<Navigate to={status === "authenticated" ? "/overview" : "/login"} replace />}
          />

          <Route path="/login" element={<SignInView />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<OverviewView />} />
            <Route path="/databases" element={<DatabasesView />} />
            <Route path="/overview/databases" element={<DatabasesView />} />
            <Route path="/databases/new" element={<CreateDatabaseView />} />
            <Route path="/overview/databases/new" element={<CreateDatabaseView />} />
            <Route path="/databases/:id" element={<DatabaseDetailView />} />
            <Route path="/reporting" element={<ReportingView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/overview/settings" element={<SettingsView />} />
            <Route path="/faq" element={<FAQView />} />
          </Route>

          <Route path="/error" element={<PageNotFoundView />} />

          <Route path="*" element={<Navigate to="/error" />} />
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

  return status === "authenticated" ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RootView;
