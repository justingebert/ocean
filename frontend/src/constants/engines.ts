import mongodbLogo from "@/img/mongodb-logo.svg";
import postgresqlLogo from "@/img/postgresql-logo.svg";
import type { EngineTypeValues } from "@/types/engine";

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
