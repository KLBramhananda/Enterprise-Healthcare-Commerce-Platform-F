/**
 * CommerceLayout
 *
 * Top-level commerce application shell with header, content, and footer.
 */

import { Outlet } from "react-router-dom";
import { CommerceHeader, CommerceFooter } from "@/components/layout";
import { LayoutProvider } from "@/providers/LayoutProvider";
import { ToastContainer } from "@/components/ui";

export default function CommerceLayout() {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <CommerceHeader />

        <main className="flex-1">
          <Outlet />
        </main>

        <CommerceFooter />

        <ToastContainer />
      </div>
    </LayoutProvider>
  );
}
