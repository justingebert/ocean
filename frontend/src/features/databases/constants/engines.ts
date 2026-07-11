import mongodbLogo from "@/features/databases/assets/mongodb-logo.svg";
import postgresqlLogo from "@/features/databases/assets/postgresql-logo.svg";
import type { EngineTypeValues } from "@/features/databases/model/engine";

export interface DatabaseEngineOption {
  id: number;
  value: EngineTypeValues;
  label: string;
  imageSrc: string;
}

export const engineOptions: ReadonlyArray<DatabaseEngineOption> = [
  {
    id: 1,
    label: "PostgreSQL",
    value: "P",
    imageSrc: postgresqlLogo,
  },
  {
    id: 2,
    label: "MongoDB",
    value: "M",
    imageSrc: mongodbLogo,
  },
];
