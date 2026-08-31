# ERPNext Integration Foundation (Phase 17A)

This document explains the infrastructure built for future ERPNext integration.
**No ERPNext API is currently called** — the application continues to run on mock
services by default. This phase only lays the groundwork.

## Architecture Overview

```
React Component
      │
      ▼
   Hook (hooks/)
      │
      ▼
Service Interface (services/*Service.ts)
      │
      ▼
Repository Interface (repositories/types.ts)
      │             ┌───────────────────────────────┐
      ├────────────►│  MockRepository (now)          │
      │             ├───────────────────────────────┤
      └────────────►│  ErpNextRepository (future)    │
                    └───────────────────────────────┘
```

The UI depends only on the **service interface**. Services call **repository
interfaces**. Repositories are the only layer that touches the network or mock
data. Swapping mock → ERPNext requires only new repository implementations in
the `repositories/` folder — services, hooks, and components never change.

## API Client (`src/api/client.ts`)

The centralized Axios client handles:

- **Base URL & timeout** — from env config (`API_BASE_URL`, `API_TIMEOUT`)
- **Auth token injection** — Authorization header from the persisted auth store
- **Token expiration check** — validates/refreshes tokens before auth requests
- **Retry with backoff** — automatic retries (default 2) for GET requests on
  timeout/server errors, with exponential backoff + jitter
- **Request cancellation** — via `cancellableRequest()` (AbortController support)
- **Error normalization** — every failure becomes an `ApiError`
- **Dev-only logging** — request/response logging when enabled

### Usage

```ts
import { apiRequest, cancellableRequest, ApiError } from "@/api";

// Basic request
const data = await apiRequest<MyType>({ url: API_ROUTES.CATALOG.PRODUCTS, method: "get" });

// With cancellation
const { promise, cancel } = cancellableRequest<MyType>({ url: "/products" });
// later: cancel();

// Error handling
try {
  await apiRequest(...);
} catch (err) {
  if (err instanceof ApiError) {
    // err.category, err.status, err.fieldErrors, ...
  }
}
```

## Repository Pattern (`src/repositories/`)

Repositories own all data access. Each domain has a typed interface:

- `ICatalogRepository` — product, category, search, discovery methods
- `IAuthRepository` — login, register, logout, current user
- `ICartRepository`, `IOrderRepository`, `IAddressRepository`, `INotificationRepository`

The registry (`src/repositories/index.ts`) resolves mock vs. future ERPNext
implementations based on the `USE_MOCK_API` flag. Currently `USE_MOCK_API=true`
(always), so only mock repositories are constructed.

**To connect ERPNext later:**
1. Create `ErpNextCatalogRepository` (and friends) implementing the interfaces.
2. Import them in `src/repositories/index.ts` and branch on `USE_ERP_API`.
3. Done — no UI changes required.

## DTO Mapping (`src/mappers/`)

Mappers translate between ERPNext's snake_case DocType response shape and the
frontend's clean camelCase domain models. Each mapper implements `Mapper<TDto, TDomain>`:

- `userMapper` — ERPNext User → frontend `User`
- `productMapper` — ERPNext Item → frontend `Product`

Generic helpers:
- `mapAll(mapper, dtos)` — map arrays
- `mapResponse(mapper, apiResponse)` — map the inner `data`
- `mapPaginatedResponse(mapper, paginatedResponse)` — map `data.items`

## Error Model (`src/api/errors.ts`)

`ApiError` is the single error type for all API failures. Every HTTP status and
network condition maps to a category:

| 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500+ | timeout | offline | cancelled |
|-----|-----|-----|-----|-----|-----|-----|------|---------|---------|-----------|
| badRequest | unauthorized | forbidden | notFound | conflict | validationError | rateLimited | serverError | timeout | offline | cancelled |

`fromAxiosError(error)` converts any thrown value into an `ApiError`.
Helper getters: `isClientError`, `isServerError`, `isRetryable`, `isAuthError`.

## Authentication Flow (`src/auth/`)

- `tokenManager.ts` — JWT storage, expiration detection, `refreshAccessToken()`
  placeholder (returns false until ERPNext auth is implemented), and
  `ensureValidToken()` used by the request interceptor.
- The existing `authStore` (Zustand + localStorage) remains the session source
  of truth. No ERPNext auth screens were added or modified.

## Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `VITE_USE_MOCK_API` | `true` | Use mock service implementations |
| `VITE_USE_ERP_API` | `false` | Use real ERPNext HTTP client |
| `VITE_ENABLE_API_LOGGING` | `false` | Dev-only structured API logging |
| `VITE_ENABLE_DEV_TOOLS` | `true` (dev) | Dev tools overlay |

The application **continues to use mock services by default** (`USE_MOCK_API=true`).
API logging is automatically disabled in production regardless of the env value.

## Health Check (`src/services/healthCheck.ts`)

Interface-only preparation — `IHealthCheckService` with `ping()` and `check()`.
The `MockHealthCheckService` returns a healthy status. `ErpNextHealthCheckService`
is a placeholder stub. **No ERPNext calls are made.**

## Loading Infrastructure (`src/providers/LoadingProvider.tsx`)

Global request/loading state available via `useGlobalLoading()` /
`useIsApiLoading()`. Also `useApiLoading()` hook for per-request loading state.
This infrastructure enables a global loading indicator later without changing
the current UI.

## ERPNext Replacement Strategy

To go live with ERPNext:

1. Set `VITE_USE_ERP_API=true` and `VITE_USE_MOCK_API=false`.
2. Implement ERPNext service interfaces that call `apiRequest()` against
   `API_ROUTES` with DTO mappers.
3. Add `ErpNext*Repository` implementations and branch the repository registry.
4. Implement `refreshAccessToken()` in `tokenManager.ts` and enable
   `VITE_ENABLE_API_LOGGING=true` for connectivity debugging.
5. Wire the health check to `API_ROUTES.HEALTH.CHECK`.

No UI components, routing, layouts, checkout flow, or authentication screens
need changes.
