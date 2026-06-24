type OceanConfig = {
  apiUrl: string;
  postgresqlHostname: string;
  postgresqlPort: string;
  mongodbHostname: string;
  mongodbPort: string;
  mongodbTls: boolean;
  adminerUrl: string;
  adminerPostgresqlServer: string;
};

type RuntimeOceanConfig = {
  postgresqlHostname?: string;
  mongodbHostname?: string;
  mongodbTls?: boolean;
};

declare global {
  interface Window {
    __OCEAN_CONFIG__?: RuntimeOceanConfig;
  }
}

const runtimeConfig = window.__OCEAN_CONFIG__ ?? {};
const env = import.meta.env;

const postgresqlHostname = runtimeConfig.postgresqlHostname || env.VITE_POSTGRESQL_HOSTNAME || "";
const mongodbHostname = runtimeConfig.mongodbHostname || env.VITE_MONGODB_HOSTNAME || "";
const mongodbTls = runtimeConfig.mongodbTls ?? env.VITE_MONGODB_TLS === "true";

export const config: OceanConfig = {
  apiUrl: env.VITE_API_URL || "/v1",
  postgresqlHostname,
  postgresqlPort: env.VITE_POSTGRESQL_PORT || "5432",
  mongodbHostname,
  mongodbPort: env.VITE_MONGODB_PORT || "27017",
  mongodbTls,
  adminerUrl: env.VITE_ADMINER_URL || (postgresqlHostname ? `https://${postgresqlHostname}/` : ""),
  adminerPostgresqlServer: env.VITE_ADMINER_POSTGRESQL_SERVER || "pg_cluster:5432",
};
