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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="destinations/:slug" element={<DestinationDetailPage />} />
        <Route path="hotels" element={<HotelsPage />} />
        <Route path="hotels/:slug" element={<HotelDetailPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route
          path="blogs/create"
          element={
            <ProtectedRoute allowedRoles={['creator', 'admin']}>
              <WriteBlogPage />
            </ProtectedRoute>
          }
        />
        <Route path="blogs/:slug" element={<BlogDetailPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Authenticated Protected Routes */}
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

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
