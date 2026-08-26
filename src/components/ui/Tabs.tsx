/**
 * Tabs
 *
 * Accessible tab component with keyboard navigation.
 * All styles reference design tokens from tokens.css.
 */

import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

export default function Tabs({ tabs, activeTab: controlledTab, onTabChange, children, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "");
  const activeTab = controlledTab ?? internalTab;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setInternalTab(tabId);
      onTabChange(tabId);
    },
    [onTabChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex;
      if (e.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      handleTabChange(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    },
    [tabs, handleTabChange],
  );

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-surface-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-surface-500 hover:border-surface-300 hover:text-surface-700",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  activeTab === tab.id
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface-100 text-surface-500",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {children}
      </div>
    </div>
  );
}
