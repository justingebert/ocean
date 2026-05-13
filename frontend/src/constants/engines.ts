import { IEngineOption } from "../components/forms/EngineGroup/EngineOption";

import mongodbLogo from "../img/mongodb-logo.svg";
import postgresqlLogo from "../img/postgresql-logo.svg";

/**
 * Predefined list of database engine options available for selection.
 * Each engine option contains a unique ID, label, value, image source, and alt text.
 */
export const engineOptions: ReadonlyArray<IEngineOption> = [
  {
    id: 1,
    label: "PostgreSQL",
    value: "P",
    imageSrc: postgresqlLogo,
    alt: "postgresql logo",
  },
  {
    id: 2,
    label: "MongoDB",
    value: "M",
    imageSrc: mongodbLogo,
    alt: "mongodb logo",
  },
];
