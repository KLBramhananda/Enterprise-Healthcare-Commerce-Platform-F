/**
 * Homepage Service Interface
 *
 * Defines the contract for all homepage content operations.
 * The UI layer depends ONLY on this interface — never on a concrete implementation.
 * To integrate with ERPNext, implement IHomepageService and swap the export in services/index.ts.
 */

import type { HomepageContent } from "@/types/homepage";

export interface IHomepageService {
  getHomepageContent(): Promise<HomepageContent>;
}
