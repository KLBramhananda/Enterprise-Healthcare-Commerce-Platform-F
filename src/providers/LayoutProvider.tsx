/**
 * Layout Provider
 *
 * Manages layout-level state such as page title and subtitle.
 */

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface LayoutContextType {
  title: string;
  subtitle: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState("Welcome to KeeMeds Commerce");

  const handleSetTitle = useCallback((value: string) => setTitle(value), []);
  const handleSetSubtitle = useCallback((value: string) => setSubtitle(value), []);

  return (
    <LayoutContext.Provider
      value={{ title, subtitle, setTitle: handleSetTitle, setSubtitle: handleSetSubtitle }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLayoutConfig() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayoutConfig must be used within a LayoutProvider");
  }
  return context;
}
