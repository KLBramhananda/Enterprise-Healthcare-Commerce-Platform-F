/**
 * HealthCheck Service
 *
 * Interface and implementations for ERPNext server health monitoring.
 *
 * MockHealthCheckService: Always returns healthy. Used when USE_MOCK_API is true.
 * ErpNextHealthCheckService: Calls ERPNext's ping and current-user endpoints
 * to verify connectivity, authentication, and database reachability.
 */

import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/config/api";

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
 * ERPNext health check implementation.
 * Verifies connectivity by calling the ping endpoint and the
 * current-user endpoint to confirm both network reachability
 * and active session authentication.
 */
export class ErpNextHealthCheckService implements IHealthCheckService {
  readonly name = "ErpNextHealthCheckService";

  async ping(): Promise<HealthStatus> {
    const start = performance.now();
    try {
      await apiClient.get(API_ROUTES.HEALTH.PING);
      const latencyMs = Math.round(performance.now() - start);
      return {
        reachable: true,
        latencyMs,
        version: null,
        message: "ERPNext server is reachable",
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const message =
        error instanceof Error ? error.message : "Connection failed";
      return {
        reachable: false,
        latencyMs,
        version: null,
        message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async check(): Promise<HealthStatus> {
    const start = performance.now();
    try {
      const [pingRes, userRes] = await Promise.allSettled([
        apiClient.get(API_ROUTES.HEALTH.PING),
        apiClient.get("frappe.auth.get_logged_user"),
      ]);
      const latencyMs = Math.round(performance.now() - start);

      if (pingRes.status === "rejected") {
        return {
          reachable: false,
          latencyMs,
          version: null,
          message: `Ping failed: ${pingRes.reason instanceof Error ? pingRes.reason.message : "unknown"}`,
          timestamp: new Date().toISOString(),
        };
      }

      const authenticated = userRes.status === "fulfilled";
      return {
        reachable: true,
        latencyMs,
        version: null,
        message: authenticated
          ? "ERPNext healthy — authenticated"
          : "ERPNext reachable — session expired or unauthenticated",
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const message =
        error instanceof Error ? error.message : "Health check failed";
      return {
        reachable: false,
        latencyMs,
        version: null,
        message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
