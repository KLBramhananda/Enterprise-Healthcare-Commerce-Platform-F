/**
 * ScrollToTop
 *
 * Scrolls the window to the top on every route change.
 * Handles both hash navigation (scroll to element) and normal navigation.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
