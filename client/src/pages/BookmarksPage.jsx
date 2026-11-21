import { Link } from 'react-router-dom';
import { Bookmark, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function BookmarksPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-charcoal">
            Saved Places & Stories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated list for <span className="font-semibold text-brand-emerald">{user?.name}</span>
          </p>
        </div>

        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-sand text-brand-emerald text-xs font-bold hover:bg-brand-emerald hover:text-white transition"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More Places</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-14 h-14 bg-brand-sand rounded-2xl flex items-center justify-center text-brand-emerald mx-auto">
          <Bookmark className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-brand-charcoal">Your Saved Vault is Empty</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Bookmark breathtaking northern valleys, heritage hotels, and insightful travelogues while browsing to access them on the go.
        </p>
        <div className="pt-2">
          <Link
            to="/destinations"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
          >
            Browse Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
