/**
 * @fileoverview Automatic window scroll reset on route changes.
 * Ensures every navigation transition (such as clicking footer links)
 * immediately positions the viewport at the top (0, 0) of the newly rendered page.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. SPA Scroll Restoration Defect Remediation:
 *    - In traditional multi-page architectures, the browser naturally repaints
 *      from viewport coordinate (0, 0) upon receiving a new HTML document.
 *    - In Single-Page Applications (SPAs) powered by React Router, navigation occurs
 *      via browser History API (`pushState`) without reloading the page, which by
 *      default preserves the user's vertical scroll position at the bottom of the page.
 *    - `ScrollToTop` observes `useLocation().pathname` changes via `useEffect`,
 *      instantly resetting window scroll coordinates to `{ top: 0, left: 0 }`
 *      upon every route transition.
 * 
 * @module components/common/ScrollToTop
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}
