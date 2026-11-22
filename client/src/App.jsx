/**
 * @fileoverview Main Client Application routing configuration for myjourney.pk.
 * Mounts standard public routes, informational footer pages, authenticated
 * protected routes, and 404 fallback page within MainLayout.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Declarative Client-Side Routing:
 *    - Utilizes React Router DOM v6/v7 `<Routes>` and nested `<Route>` structure.
 *    - Nested layout design ensures that `MainLayout` (Navbar, Footer, Floating controls)
 *      persists across page transitions without unmounting or re-rendering unnecessarily.
 * 
 * 2. Role-Based Access Control (RBAC) Route Protection:
 *    - `<ProtectedRoute>` intercepts unauthorized navigation attempts to administrative
 *      or creator-exclusive routes (`/blogs/create`), redirecting unauthenticated users
 *      to `/login` with referer state preservation.
 * 
 * 3. Information Architecture Expansion:
 *    - Integrates four dedicated tourism advisory pages (`/advisory`, `/safety`,
 *      `/etiquette`, `/eco-trekking`) supporting academic evaluation requirements.
 * 
 * @module App
 */

import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import WriteBlogPage from './pages/WriteBlogPage';
import PlannerPage from './pages/PlannerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import BookmarksPage from './pages/BookmarksPage';
import MyPlansPage from './pages/MyPlansPage';
import NotFoundPage from './pages/NotFoundPage';

// Informational Tourism Pages
import TravelAdvisory from './pages/TravelAdvisory';
import SafetyGuidelines from './pages/SafetyGuidelines';
import LocalEtiquette from './pages/LocalEtiquette';
import EcoTrekking from './pages/EcoTrekking';

// Scroll Restoration
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Exploration & Directory Routes */}
        <Route index element={<HomePage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="destinations/:slug" element={<DestinationDetailPage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="hotels/:slug" element={<HotelDetailPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="blogs/:slug" element={<BlogDetailPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Informational Guidance Pages */}
        <Route path="advisory" element={<TravelAdvisory />} />
        <Route path="safety" element={<SafetyGuidelines />} />
        <Route path="etiquette" element={<LocalEtiquette />} />
        <Route path="eco-trekking" element={<EcoTrekking />} />

        {/* Authenticated / Role-Guarded Routes */}
        <Route
          path="blogs/create"
          element={
            <ProtectedRoute allowedRoles={['creator', 'admin']}>
              <WriteBlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-plans"
          element={
            <ProtectedRoute>
              <MyPlansPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  );
}
