import { Skeleton } from "@/components/ui/skeleton";
import { OceanLogo } from "@/components/common/OceanLogo";

type AppShellLoadingProps = {
  label: string;
};

/** Mirrors the app shell (sidebar + list page) so the swap to real content doesn't jump. */
export function AppShellLoading({ label }: AppShellLoadingProps) {
  return (
    <div
      className="flex min-h-screen bg-background"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-3 md:flex">
        <OceanLogo className="m-1" alt="" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
        </div>
      </aside>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    </div>
  );
}
