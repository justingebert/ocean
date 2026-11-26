import React from "react";
import { DatabaseIcon } from "lucide-react";

import mongodbLogo from "@/features/databases/assets/mongodb-logo.svg";
import postgresqlLogo from "@/features/databases/assets/postgresql-logo.svg";
import { EngineType } from "@/features/databases/model/engine.ts";
import { cn } from "cn";

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
      <DatabaseIcon className={cn("shrink-0 text-muted-foreground", className)} aria-hidden="true" />
    );
  }

  return (
    <img className={cn("shrink-0 object-contain", className)} src={logo.src} alt={logo.alt} />
  );
};

export default DatabaseEngineLogo;
