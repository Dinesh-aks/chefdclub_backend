import type { HealthStatus } from "./health.types.js";

export function getHealthStatus(): HealthStatus {
  return { timestamp: new Date().toISOString() };
}
