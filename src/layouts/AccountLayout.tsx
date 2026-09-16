/**
 * AccountLayout
 *
 * Shared shell for the customer account center. Renders the account sidebar
 * alongside the routed page content.
 *
 * - Desktop (lg+): sticky sidebar column + content area.
 * - Mobile/Tablet (<lg): horizontal tab strip (rendered by AccountSidebar)
 *   above the content.
 *
 * Child pages render ONLY their content (no outer container) — the layout
 * owns the page shell, background, gutters, and navigation.
 */

import { Outlet } from "react-router-dom";
import { Container } from "@/components/ui";
import { AccountSidebar } from "@/components/account";

export default function AccountLayout() {
  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="lg:w-64 lg:shrink-0">
            <AccountSidebar className="lg:sticky lg:top-[calc(var(--layout-header-main-h)+var(--layout-header-cat-h)+1rem)]" />
          </aside>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </Container>
    </div>
  );
}