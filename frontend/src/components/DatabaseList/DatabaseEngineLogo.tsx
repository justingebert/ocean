import React from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";

import mongodbLogo from "../../img/mongodb-logo.svg";
import postgresqlLogo from "../../img/postgresql-logo.svg";
import { EngineType } from "../../types/engine";
import { cn } from "../../lib/utils";

interface DatabaseEngineLogoProps {
  engine: string;
  className?: string;
}

interface DatabaseEngineLogoAsset {
  src: string;
  alt: string;
}

const getDatabaseEngineLogo = (engine: string): DatabaseEngineLogoAsset | undefined => {
  if (engine === EngineType.PostgreSQL) {
    return {
      src: postgresqlLogo,
      alt: "PostgreSQL logo",
    };
  }

  if (engine === EngineType.MongoDB) {
    return {
      src: mongodbLogo,
      alt: "MongoDB logo",
    };
  }

  return undefined;
};

const DatabaseEngineLogo: React.FC<DatabaseEngineLogoProps> = ({ engine, className }) => {
  const logo = getDatabaseEngineLogo(engine);

  if (!logo) {
    return (
      <CircleStackIcon
        className={cn("flex-shrink-0 text-gray-400", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <img className={cn("flex-shrink-0 object-contain", className)} src={logo.src} alt={logo.alt} />
  );
};

export default DatabaseEngineLogo;
