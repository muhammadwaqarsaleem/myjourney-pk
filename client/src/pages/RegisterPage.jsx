import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Compass, Lock, Mail, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Immediate redirect if session is already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Client-side validations
    if (!trimmedName) {
      setError('Please provide your full name.');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Name cannot exceed 50 characters.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please provide your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please provide a valid email address (e.g., traveler@example.com).');
      return;
    }

    if (!password) {
      setError('Please provide a password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl max-w-md w-full p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-sand rounded-2xl flex items-center justify-center text-brand-emerald mx-auto mb-3 shadow-xs">
            <Compass className="w-7 h-7 text-brand-emerald" />
          </div>
          <h1 className="text-2xl font-black text-brand-charcoal">Join myjourney.pk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with the community, bookmark destinations, and publish travel stories
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="register-name"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="register-name"
                type="text"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Khan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-password"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Password (min. 6 chars)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-0 top-0 h-full min-h-[44px] min-w-[44px] px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:text-brand-emerald rounded-r-xl transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-confirm-password"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                aria-pressed={showConfirmPassword}
                className="absolute right-0 top-0 h-full min-h-[44px] min-w-[44px] px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:text-brand-emerald rounded-r-xl transition"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-role"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Account Role
            </label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald bg-white transition"
            >
              <option value="user">Traveler / Explorer (Default)</option>
              <option value="creator">Travel Blogger / Creator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-emerald hover:bg-emerald-800 disabled:opacity-70 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 text-brand-mint" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-emerald hover:text-brand-mint transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
