import React from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import RootView from "./router";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const message =
        typeof query.meta?.errorMessage === "string"
          ? query.meta.errorMessage
          : "Something went wrong";
      toast.error(message);
    },
  }),
});

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
