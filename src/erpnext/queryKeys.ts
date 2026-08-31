/**
 * ERPNext Query Key Factories
 *
 * Centralized, hierarchical React Query key factories for all ERP modules.
 * Using a factory pattern ensures consistent cache key structure and enables
 * targeted cache invalidation across the application.
 *
 * Usage:
 *   const queryClient = useQueryClient();
 *   queryClient.invalidateQueries({ queryKey: erpQueryKeys.items.all });
 *
 * Key hierarchy:
 *   ["erpnext"] → root
 *   ["erpnext", "items"] → module
 *   ["erpnext", "items", "list", { filters }] → specific query
 *   ["erpnext", "items", "detail", "ITEM-001"] → single entity
 */

/* ── Root namespace ── */

/** Root key for all ERPNext queries. */
const ERP_ROOT = ["erpnext"] as const;

/* ── Module key factories ── */

/** Item / Product module keys. */
export const erpItemKeys = {
  all: [...ERP_ROOT, "items"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpItemKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpItemKeys.all, "detail", id] as const,
  search: (query: string) =>
    [...erpItemKeys.all, "search", query] as const,
  stock: (id: string) =>
    [...erpItemKeys.all, "stock", id] as const,
  pricing: (id: string) =>
    [...erpItemKeys.all, "pricing", id] as const,
};

/** Item Group / Category module keys. */
export const erpItemGroupKeys = {
  all: [...ERP_ROOT, "item_groups"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpItemGroupKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpItemGroupKeys.all, "detail", id] as const,
  tree: () =>
    [...erpItemGroupKeys.all, "tree"] as const,
};

/** Customer module keys. */
export const erpCustomerKeys = {
  all: [...ERP_ROOT, "customers"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpCustomerKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpCustomerKeys.all, "detail", id] as const,
  current: () =>
    [...erpCustomerKeys.all, "current"] as const,
};

/** Sales Order module keys. */
export const erpOrderKeys = {
  all: [...ERP_ROOT, "orders"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpOrderKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpOrderKeys.all, "detail", id] as const,
  items: (orderId: string) =>
    [...erpOrderKeys.all, "items", orderId] as const,
  invoice: (orderId: string) =>
    [...erpOrderKeys.all, "invoice", orderId] as const,
  tracking: (orderId: string) =>
    [...erpOrderKeys.all, "tracking", orderId] as const,
};

/** Address module keys. */
export const erpAddressKeys = {
  all: [...ERP_ROOT, "addresses"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpAddressKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpAddressKeys.all, "detail", id] as const,
  byCustomer: (customerId: string) =>
    [...erpAddressKeys.all, "customer", customerId] as const,
};

/** Contact module keys. */
export const erpContactKeys = {
  all: [...ERP_ROOT, "contacts"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...erpContactKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...erpContactKeys.all, "detail", id] as const,
};

/** File / Attachment module keys. */
export const erpFileKeys = {
  all: [...ERP_ROOT, "files"] as const,
  list: (doctype: string, docname: string) =>
    [...erpFileKeys.all, doctype, docname] as const,
  detail: (id: string) =>
    [...erpFileKeys.all, "detail", id] as const,
};

/** User module keys. */
export const erpUserKeys = {
  all: [...ERP_ROOT, "users"] as const,
  current: () =>
    [...erpUserKeys.all, "current"] as const,
  detail: (id: string) =>
    [...erpUserKeys.all, "detail", id] as const,
  roles: (id: string) =>
    [...erpUserKeys.all, "roles", id] as const,
};

/** Healthcare module keys (Patient, Practitioner, etc.). */
export const erpHealthcareKeys = {
  all: [...ERP_ROOT, "healthcare"] as const,
  patients: {
    all: [...ERP_ROOT, "healthcare", "patients"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...erpHealthcareKeys.patients.all, "list", filters] as const,
    detail: (id: string) =>
      [...erpHealthcareKeys.patients.all, "detail", id] as const,
  },
  practitioners: {
    all: [...ERP_ROOT, "healthcare", "practitioners"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...erpHealthcareKeys.practitioners.all, "list", filters] as const,
    detail: (id: string) =>
      [...erpHealthcareKeys.practitioners.all, "detail", id] as const,
  },
  appointments: {
    all: [...ERP_ROOT, "healthcare", "appointments"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...erpHealthcareKeys.appointments.all, "list", filters] as const,
    detail: (id: string) =>
      [...erpHealthcareKeys.appointments.all, "detail", id] as const,
  },
  prescriptions: {
    all: [...ERP_ROOT, "healthcare", "prescriptions"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...erpHealthcareKeys.prescriptions.all, "list", filters] as const,
    detail: (id: string) =>
      [...erpHealthcareKeys.prescriptions.all, "detail", id] as const,
  },
};

/** Settings / Configuration module keys. */
export const erpSettingsKeys = {
  all: [...ERP_ROOT, "settings"] as const,
  commerce: () =>
    [...erpSettingsKeys.all, "commerce"] as const,
  healthcare: () =>
    [...erpSettingsKeys.all, "healthcare"] as const,
  custom: (name: string) =>
    [...erpSettingsKeys.all, name] as const,
};

/* ── Generic module factory ── */

/**
 * Create a query key factory for an arbitrary ERPNext module.
 * Use this for new modules not covered by the predefined factories.
 *
 * @example
 * const prescriptionKeys = createModuleKeys("prescriptions");
 * prescriptionKeys.list({ status: "active" });
 * prescriptionKeys.detail("PRESC-001");
 */
export function createModuleKeys<T extends string>(module: T) {
  const root = [...ERP_ROOT, module] as const;
  return {
    all: root,
    list: (filters?: Record<string, unknown>) => [...root, "list", filters] as const,
    detail: (id: string) => [...root, "detail", id] as const,
  };
}

/* ── Root export ── */

export { ERP_ROOT };
