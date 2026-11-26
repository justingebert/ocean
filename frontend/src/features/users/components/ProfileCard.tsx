import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProperties } from "@/types/user";

export interface ProfileCardProps {
  user?: UserProperties;
  loading?: boolean;
}

function ProfileCard({ user, loading = false }: ProfileCardProps) {
  const profileFields = [
    {
      label: "Full name",
      value: user ? `${user.firstName} ${user.lastName}` : undefined,
    },
    {
      label: "Employee type",
      value: user?.employeeType,
    },
    {
      label: "Email address",
      value: user?.mail,
    },
    {
      label: "Username",
      value: user?.username,
    },
  ];

  return (
    <Card className="py-0">
      <dl aria-busy={loading} className="divide-y divide-border">
        {profileFields.map(({ label, value }) => (
          <div key={label} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
              {loading ? <Skeleton className={"h-4 w-40"} /> : (value ?? "..")}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default ProfileCard;
