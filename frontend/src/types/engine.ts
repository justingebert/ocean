export const EngineType = Object.freeze({
    PostgreSQL: "P" as "P",
    MongoDB: "M" as "M",
});

// ✅ Define a type explicitly
export type EngineTypeValues = (typeof EngineType)[keyof typeof EngineType];

console.log("🚀 EngineType initialized:", EngineType);
