import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  MapPin,
  Hotel,
  BookOpen,
  Bookmark,
  Calendar,
  PenTool,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const closeMenus = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  // Close menus on outside click, escape key, or browser history navigation
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('popstate', closeMenus);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', closeMenus);
    };
  }, []);

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Destinations', path: '/destinations', icon: MapPin },
    { label: 'Hotels', path: '/hotels', icon: Hotel },
    { label: 'Community Blogs', path: '/blogs', icon: BookOpen },
    { label: 'AI Planner', path: '/planner', icon: Sparkles, highlight: true },
  ];

  const canWriteBlog = user?.role === 'creator' || user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-emerald flex items-center justify-center text-white shadow-md shadow-brand-emerald/20 transition-transform group-hover:scale-105">
              <Compass className="w-6 h-6 text-brand-mint" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-brand-emerald">
                myjourney<span className="text-brand-mint">.pk</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500">
                Pakistan Tourism
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      link.highlight
                        ? isActive
                          ? 'bg-brand-emerald text-white shadow-sm'
                          : 'bg-brand-sand/70 text-brand-emerald hover:bg-brand-sand hover:text-brand-emerald'
                        : isActive
                        ? 'bg-brand-emerald/10 text-brand-emerald font-bold'
                        : 'text-slate-600 hover:text-brand-emerald hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon
                    className={`w-4 h-4 ${
                      link.highlight ? 'text-brand-mint' : 'text-slate-400 group-hover:text-brand-emerald'
                    }`}
                  />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Dynamic Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile and account settings"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-brand-emerald/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-brand-charcoal truncate max-w-[110px]">
                      {user?.name || 'Explorer'}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'user'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-brand-charcoal truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-brand-mint/20 text-brand-emerald rounded-full">
                        {user?.role || 'user'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/bookmarks"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <Link
                        to="/my-plans"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>My Itineraries</span>
                      </Link>

                      {canWriteBlog && (
                        <Link
                          to="/blogs/create"
                          onClick={closeMenus}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-emerald font-medium hover:bg-brand-sand/60 transition"
                          role="menuitem"
                        >
                          <PenTool className="w-4 h-4 text-brand-mint" />
                          <span>Write Blog Story</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="px-4 py-2 text-sm font-semibold text-brand-charcoal hover:text-brand-emerald hover:bg-slate-100/70 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenus}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-emerald hover:bg-emerald-800 rounded-xl shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - min 44x44px touch target */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeMenus}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-brand-emerald" />
                <span className="font-bold text-brand-emerald text-lg">myjourney.pk</span>
              </div>
              <button
                type="button"
                onClick={closeMenus}
                aria-label="Close navigation menu"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-base font-semibold transition ${
                        link.highlight
                          ? isActive
                            ? 'bg-brand-emerald text-white'
                            : 'bg-brand-sand text-brand-emerald'
                          : isActive
                          ? 'bg-brand-emerald/10 text-brand-emerald'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}

              {isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    My Account
                  </p>
                  <Link
                    to="/bookmarks"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-700 hover:bg-slate-100 text-base"
                  >
                    <Bookmark className="w-5 h-5 text-slate-400" />
                    <span>Saved Bookmarks</span>
                  </Link>
                  <Link
                    to="/my-plans"
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-700 hover:bg-slate-100 text-base"
                  >
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span>My Itineraries</span>
                  </Link>
                  {canWriteBlog && (
                    <Link
                      to="/blogs/create"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-brand-emerald font-semibold hover:bg-brand-sand text-base"
                    >
                      <PenTool className="w-5 h-5 text-brand-mint" />
                      <span>Write Blog Story</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Auth Bottom Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-brand-emerald text-white flex items-center justify-center font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-brand-charcoal truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="min-h-[44px] flex items-center justify-center px-4 py-2 rounded-xl text-center font-semibold text-sm border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="min-h-[44px] flex items-center justify-center px-4 py-2 rounded-xl text-center font-semibold text-sm bg-brand-emerald text-white hover:bg-emerald-800 transition shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
