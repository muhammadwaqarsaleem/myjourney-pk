/**
 * @fileoverview Primary application shell layout for myjourney.pk.
 * Mounts standard navigation header, scrollable page route outlets,
 * footer directory, and floating action elements (BackToTop, FloatingAiWidget).
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Single Page Application (SPA) Nested Route Outlet:
 *    - Uses React Router 6/7 `<Outlet />` to render matched child route views
 *      without unmounting the outer layout chrome (Navbar, Footer).
 * 2. Visual Stacking & Z-Index Layering:
 *    - BackToTop is pinned at `z-40` above the viewport, while the AI Concierge
 *      operates at `z-50`.
 *    - Mobile drawers and dialogs mount at `z-50` with isolated modal backdrops.
 * @module components/layout/MainLayout
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAiWidget from '../ai/FloatingAiWidget';
import BackToTop from '../common/BackToTop';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Top Header Navigation */}
      <Navbar />

      {/* Main Routed Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Persistent Global Footer */}
      <Footer />

      {/* Floating Action Controls */}
      <BackToTop />
      <FloatingAiWidget />
    </div>
  );
}
