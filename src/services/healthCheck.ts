/**
 * HealthCheck Service
 *
 * Interface-only implementation for ERPNext server health monitoring.
 * This is a placeholder — no actual ERPNext calls are made in Phase 17A.
 *
 * When ERPNext is connected, implement `ErpNextHealthCheckService` that:
 *   1. Calls the ping/check endpoint
 *   2. Measures response latency
 *   3. Verifies database connectivity
 *   4. Returns structured health status
 */

export interface HealthStatus {
  /** Whether the server is reachable. */
  reachable: boolean;
  /** Response latency in milliseconds (null if unreachable). */
  latencyMs: number | null;
  /** Server version string, if provided. */
  version: string | null;
  /** Human-readable status message. */
  message: string;
  /** Timestamp of the check. */
  timestamp: string;
}

export interface IHealthCheckService {
  /** Unique identifier for this health check implementation. */
  readonly name: string;

  /** Perform a basic connectivity check (ping). */
  ping(): Promise<HealthStatus>;

  /** Full health check including database and service status. */
  check(): Promise<HealthStatus>;
}

/**
 * Mock health check that always returns healthy.
 * Used during development and when USE_MOCK_API is true.
 */
export class MockHealthCheckService implements IHealthCheckService {
  readonly name = "MockHealthCheckService";

  async ping(): Promise<HealthStatus> {
    return {
      reachable: true,
      latencyMs: 1,
      version: "mock-1.0.0",
      message: "Mock server is running",
      timestamp: new Date().toISOString(),
    };
  }

  async check(): Promise<HealthStatus> {
    return this.ping();
  }
}

/**
 * Placeholder for ERPNext health check.
 * Replace the body when connecting to the real backend.
 */
export class ErpNextHealthCheckService implements IHealthCheckService {
  readonly name = "ErpNextHealthCheckService";

  async ping(): Promise<HealthStatus> {
    // Placeholder — will call API_ROUTES.HEALTH.PING via apiClient
    return {
      reachable: false,
      latencyMs: null,
      version: null,
      message: "ERPNext health check not yet connected",
      timestamp: new Date().toISOString(),
    };
  }

  async check(): Promise<HealthStatus> {
    return this.ping();
  }
}

/** Default health check instance (mock until ERPNext is connected). */
export const healthCheckService: IHealthCheckService = new MockHealthCheckService();
