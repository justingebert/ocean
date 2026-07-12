import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface IStats {
  name: string;
  value: string;
}

export const Stats = ({ name, value }: IStats) => (
  <Card>
    <CardHeader>
      <CardDescription>{name}</CardDescription>
      <CardTitle className="text-3xl">{value}</CardTitle>
    </CardHeader>
  </Card>
);