import { Link } from 'react-router-dom';
import { MapPin, Compass } from 'lucide-react';

export default function DestinationsPage() {
  const sampleDestinations = [
    {
      name: 'Hunza Valley',
      slug: 'hunza-valley',
      province: 'Gilgit-Baltistan',
      description: 'Majestic Karakoram vistas, Baltit Fort, and serene apricot orchards.',
      category: 'Mountain Valley',
    },
    {
      name: 'Skardu & Deosai',
      slug: 'skardu-deosai',
      province: 'Gilgit-Baltistan',
      description: 'Gateway to K2, the plains of giants, and turquoise alpine lakes.',
      category: 'High Altitude Wilderness',
    },
    {
      name: 'Walled City of Lahore',
      slug: 'lahore-walled-city',
      province: 'Punjab',
      description: 'Mughal architectural masterpieces, vibrant food streets, and rich history.',
      category: 'Cultural Heritage',
    },
    {
      name: 'Gwadar & Makran Coast',
      slug: 'gwadar-makran',
      province: 'Balochistan',
      description: 'Pristine coastal highway, Hammerhead rock, and untouched Arabian Sea beaches.',
      category: 'Coastal Adventure',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-brand-emerald text-sm font-semibold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Regional Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-charcoal">Destinations in Pakistan</h1>
        <p className="text-slate-600 mt-2">
          Browse verified destinations, seasonal highlights, and cultural landmarks across all provinces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleDestinations.map((dest) => (
          <div
            key={dest.slug}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-mint/40 transition flex flex-col"
          >
            <div className="h-44 bg-gradient-to-tr from-brand-emerald/90 to-brand-mint/70 flex items-center justify-center text-white p-4 text-center">
              <div>
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <span className="text-xs uppercase font-bold tracking-widest opacity-80">
                  {dest.province}
                </span>
                <h3 className="text-lg font-bold">{dest.name}</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-sand text-brand-emerald mb-2">
                  {dest.category}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{dest.description}</p>
              </div>
              <Link
                to={`/destinations/${dest.slug}`}
                className="text-xs font-bold text-brand-emerald hover:text-brand-mint transition"
              >
                Explore Details & Activities →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
