/**
 * usePageTitle
 *
 * Sets the document title and updates the LayoutProvider context.
 */

import { useEffect } from "react";
import { useLayoutConfig } from "@/providers/LayoutProvider";
import { APP_NAME } from "@/config/constants";

export function usePageTitle(title: string, subtitle?: string) {
  const { setTitle, setSubtitle } = useLayoutConfig();

  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
    setTitle(title);
    if (subtitle) setSubtitle(subtitle);
  }, [title, subtitle, setTitle, setSubtitle]);
}
