import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-sand flex items-center justify-center text-brand-emerald mb-6">
        <Compass className="w-9 h-9" />
      </div>
      <h1 className="text-5xl font-black text-brand-charcoal tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Off the Beaten Trail</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The destination, hotel, or guide you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-brand-mint" />
        <span>Return to Basecamp</span>
      </Link>
    </div>
  );
}
