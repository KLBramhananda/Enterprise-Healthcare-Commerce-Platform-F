/**
 * App
 *
 * Root application component.
 * Wraps the router with all global providers.
 */

import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
