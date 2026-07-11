import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import RootView from "./router";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootView />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
