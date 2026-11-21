import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Hotel, MapPin, ShieldCheck, Star } from 'lucide-react';

export default function HotelDetailPage() {
  const { slug } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/hotels"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-emerald mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hotels
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-1">
              <Hotel className="w-4 h-4" />
              <span>Verified Hotel Listing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold capitalize text-brand-charcoal">
              {slug?.replace(/-/g, ' ')}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <MapPin className="w-4 h-4 text-brand-mint" />
              <span>Pakistan Tourism Accredited Partner</span>
            </div>
          </div>

          <div className="bg-brand-sand p-4 rounded-2xl text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-amber-500 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.8 / 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Based on community reviews</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-charcoal">Property Overview</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Experience exceptional comfort surrounded by scenic views and authentic regional gastronomy.
            Equipped with round-the-clock power backup, heated rooms in winter, high-speed Wi-Fi, and guided excursion desks.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-mint shrink-0" />
            <div>
              <p className="text-xs font-bold text-brand-charcoal">Verified Clean & Secure</p>
              <p className="text-xs text-slate-500">Adheres to Pakistan tourism health & safety protocols</p>
            </div>
          </div>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
          >
            Check Room Availability
          </button>
        </div>
      </div>
    </div>
  );
}
