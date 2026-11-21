import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Hotel, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand to-slate-50 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
            Next-Gen Pakistan Tourism Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-brand-charcoal tracking-tight max-w-4xl mx-auto leading-tight">
            Discover the Soul and Splendor of{' '}
            <span className="text-brand-emerald underline decoration-brand-mint decoration-4 underline-offset-6">
              Pakistan
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From the sky-touching peaks of Karakoram to the ancient streets of Lahore and coastal
            breezes of Gwadar, plan your authentic journey with verified community insights and AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/planner"
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-brand-emerald hover:bg-emerald-800 shadow-md shadow-brand-emerald/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-brand-mint" />
              <span>Launch AI Planner</span>
            </Link>
            <Link
              to="/destinations"
              className="px-6 py-3.5 rounded-xl font-bold text-brand-charcoal bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>Explore Destinations</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
            Everything You Need for Seamless Exploration
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Curated databases, verified local stays, and traveler narratives across Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-brand-mint/40 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-charcoal mb-2">Curated Destinations</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Explore northern wonders like Hunza, Skardu, and Fairy Meadows alongside cultural icons
              in Punjab, Sindh, and Balochistan.
            </p>
            <Link to="/destinations" className="text-sm font-semibold text-brand-emerald hover:text-brand-mint transition">
              Browse Locations →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-brand-mint/40 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald mb-4">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-charcoal mb-2">Verified Stays</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Find transparently reviewed boutique heritage stays, mountain resorts, and budget
              guesthouses across the country.
            </p>
            <Link to="/hotels" className="text-sm font-semibold text-brand-emerald hover:text-brand-mint transition">
              Find Stays →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-brand-mint/40 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-charcoal mb-2">Traveler Stories</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Real itineraries, photography, and culinary dispatches written by local creators and
              seasoned mountaineers.
            </p>
            <Link to="/blogs" className="text-sm font-semibold text-brand-emerald hover:text-brand-mint transition">
              Read Travelogs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
