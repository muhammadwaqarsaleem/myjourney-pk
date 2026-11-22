import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Route guard checking loading state, authentication, and RBAC roles
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center p-6"
        role="status"
        aria-live="polite"
      >
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
        <span className="sr-only">Validating authorization...</span>
        <p className="mt-4 text-sm font-medium text-slate-500">Securing your session...</p>
      </div>
    );
  }

  // Validate internal path against open-redirect vulnerabilities
  if (!isAuthenticated) {
    const isSafeRelativePath =
      location.pathname.startsWith('/') && !location.pathname.startsWith('//');
    const redirectTarget = isSafeRelativePath
      ? `${location.pathname}${location.search}`
      : '/';

    return <Navigate to="/login" state={{ from: redirectTarget }} replace />;
  }

  // Check RBAC permissions if allowedRoles constraint is provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            !
          </div>
          <h2 className="text-xl font-bold text-brand-charcoal mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your role (<span className="font-semibold">{user?.role || 'user'}</span>) does not have
            sufficient permissions to view this resource.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
