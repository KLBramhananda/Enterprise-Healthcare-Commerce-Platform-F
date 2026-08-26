/**
 * useScrollLayout
 *
 * Measures header section heights and keeps CSS custom properties in sync.
 *
 * Architecture contract:
 *   - Sets --layout-header-main-h, --layout-header-cat-h, --layout-header-announce-h
 *   - Sets --layout-scroll-padding, --layout-sticky-offset
 *   - Page offset is provided by <header>'s DOM flow position (no padding on <main>)
 *
 * All CSS custom property updates are batched via requestAnimationFrame to
 * avoid layout thrashing. Element heights are measured only on mount and
 * resize — not on every scroll event.
 */

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface LayoutRefs {
  mainNav: RefObject<HTMLElement | null>;
  catNav: RefObject<HTMLElement | null>;
  announceBar: RefObject<HTMLDivElement | null>;
}

function pxToRem(px: number): string {
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return `${px / root}rem`;
}

function measureLayout(refs: LayoutRefs) {
  const mainNav = refs.mainNav.current;
  if (!mainNav) return;

  const catNav = refs.catNav.current;
  const announceBar = refs.announceBar.current;

  const mainH = mainNav.getBoundingClientRect().height;
  const catH = catNav?.getBoundingClientRect().height ?? 0;
  const announceH = announceBar?.getBoundingClientRect().height ?? 0;

  const root = document.documentElement;
  root.style.setProperty("--layout-header-main-h", pxToRem(mainH));
  root.style.setProperty("--layout-header-cat-h", pxToRem(catH));
  root.style.setProperty("--layout-header-announce-h", pxToRem(announceH));
  root.style.setProperty("--layout-scroll-padding", pxToRem(mainH + catH));
  root.style.setProperty("--layout-sticky-offset", pxToRem(mainH + catH + 16));
}

export function useScrollLayout(refs: LayoutRefs) {
  const refsRef = useRef<LayoutRefs>(refs);

  useEffect(() => {
    refsRef.current = refs;
  });

  useEffect(() => {
    measureLayout(refsRef.current);

    const rafId = { current: 0 };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => measureLayout(refsRef.current));
    });

    const mainNav = refsRef.current.mainNav.current;
    const catNav = refsRef.current.catNav.current;
    const announceBar = refsRef.current.announceBar.current;

    if (mainNav) ro.observe(mainNav);
    if (catNav) ro.observe(catNav);
    if (announceBar) ro.observe(announceBar);

    const handleResize = () => measureLayout(refsRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId.current);
    };
  }, []);
}
