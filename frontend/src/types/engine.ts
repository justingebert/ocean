export const EngineType = Object.freeze({
    PostgreSQL: "P",
    MongoDB: "M",
} as const);

export type EngineTypeValues = (typeof EngineType)[keyof typeof EngineType];
