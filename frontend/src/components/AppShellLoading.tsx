import { Skeleton } from "@/components/ui/skeleton";

type AppShellLoadingProps = {
  label: string;
};

export function AppShellLoading({ label }: AppShellLoadingProps) {
  return (
    <div
      className="flex min-h-screen bg-background"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <aside className="hidden w-64 shrink-0 flex-col gap-8 bg-sidebar p-4 lg:flex">
        <img className="h-8 w-auto self-start" src="/ocean-logo.png" alt="" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-9 w-3/4" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-end gap-3 border-b border-border px-4 sm:px-6 lg:px-8">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="size-9 rounded-full" />
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 lg:p-8">
          <Skeleton className="h-9 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
