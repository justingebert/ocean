import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProperties } from "../../types/user";

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
    <div>
      <div className="mt-6">
        <h3 className="text-lg leading-6 font-medium text-foreground">Profile</h3>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Personal account details.</p>
      </div>
      <Separator className="mt-5" />
      <dl aria-busy={loading} className="sm:divide-y sm:divide-border">
        {profileFields.map(({ label, value }) => (
          <div key={label} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
              {loading ? <Skeleton className={"h-4 w-40"} /> : (value ?? "..")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default ProfileCard;
