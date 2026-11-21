import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Calendar, Compass, Shield } from 'lucide-react';

export default function DestinationDetailPage() {
  const { slug } = useParams();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/destinations"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-emerald mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Destinations
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-64 sm:h-80 bg-gradient-to-r from-brand-emerald to-slate-900 flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="flex items-center gap-2 text-brand-mint text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>Pakistan Destination Archive</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold capitalize">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">
            Detailed itinerary recommendations, weather alerts, historical context, and verified local points of interest.
          </p>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal mb-3">About this Destination</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                This destination is verified within the myjourney.pk tourism repository. Explore local culinary traditions, historical monuments, and seasonal travel advice contributed by authenticated travelers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-sand/60 p-4 rounded-2xl border border-brand-sand">
                <div className="flex items-center gap-2 text-brand-emerald text-sm font-bold mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Best Season</span>
                </div>
                <p className="text-xs text-slate-600">April to October (Recommended)</p>
              </div>

              <div className="bg-brand-sand/60 p-4 rounded-2xl border border-brand-sand">
                <div className="flex items-center gap-2 text-brand-emerald text-sm font-bold mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Altitude & Terrain</span>
                </div>
                <p className="text-xs text-slate-600">Scenic valleys & mountain trails</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-brand-charcoal text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-mint" />
                <span>Traveler Tip</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Respect local cultural norms, carry cash for remote vendors, and minimize plastic footprint to keep Pakistan clean.
              </p>
              <Link
                to="/planner"
                className="w-full inline-block text-center px-4 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
              >
                Plan Itinerary Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
