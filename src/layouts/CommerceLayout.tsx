/**
 * CommerceLayout
 *
 * Top-level commerce application shell with header, content, and footer.
 *
 * Architecture:
 *   - <header> (via CommerceHeader) is a flex sibling BEFORE <main> in the
 *     DOM flow. Its own height pushes <main> below the navigation — no
 *     additional padding-top on <main> is needed.
 *   - <main> uses `isolation: isolate` to establish a stacking context that
 *     contains all page content beneath the global header (z-main-nav / z-dropdown).
 *   - scroll-padding-top on <html> (set via CSS variable) ensures anchor links
 *     scroll below the sticky header.
 *   - The sticky navs are bounded by their parent <header> and scroll off with
 *     it, so page content can never overlap with stuck navigation.
 *   - No page-specific spacing fixes are needed — the layout contract is inherited.
 */

import { Outlet } from "react-router-dom";
import { CommerceHeader, CommerceFooter } from "@/components/layout";
import { LayoutProvider } from "@/providers/LayoutProvider";
import { ToastContainer } from "@/components/ui";

export default function CommerceLayout() {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen flex-col bg-surface-50">
        <CommerceHeader />

        <main className="flex-1 isolate">
          <Outlet />
        </main>

        <CommerceFooter />

        <ToastContainer />
      </div>
    </LayoutProvider>
  );
}
