import { Link } from 'react-router-dom';
import { Hotel, Star, MapPin } from 'lucide-react';

export default function HotelsPage() {
  const sampleHotels = [
    {
      name: 'Serena Altit Fort Residence',
      slug: 'serena-altit-fort',
      city: 'Hunza',
      price: 'PKR 35,000 / night',
      rating: 4.9,
      type: 'Heritage Resort',
    },
    {
      name: 'Shangrila Resort Skardu',
      slug: 'shangrila-skardu',
      city: 'Skardu',
      price: 'PKR 28,000 / night',
      rating: 4.8,
      type: 'Lakeside Resort',
    },
    {
      name: 'Pearl Continental Bhurban',
      slug: 'pc-bhurban',
      city: 'Bhurban / Murree',
      price: 'PKR 32,000 / night',
      rating: 4.6,
      type: 'Mountain View Hotel',
    },
    {
      name: 'Avari Towers Lahore',
      slug: 'avari-towers-lahore',
      city: 'Lahore',
      price: 'PKR 26,000 / night',
      rating: 4.7,
      type: 'City Luxury Hotel',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-brand-emerald text-sm font-semibold uppercase tracking-wider mb-2">
          <Hotel className="w-4 h-4" />
          <span>Accommodations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-charcoal">Hotels & Stays in Pakistan</h1>
        <p className="text-slate-600 mt-2">
          Discover verified resorts, boutique mountain lodges, and city hotels with genuine traveler reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleHotels.map((hotel) => (
          <div
            key={hotel.slug}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
          >
            <div className="h-40 bg-slate-800 text-white p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-emerald text-white">
                  {hotel.type}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{hotel.rating}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-brand-mint" />
                  <span>{hotel.city}</span>
                </div>
                <h3 className="text-base font-bold text-white truncate">{hotel.name}</h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="mb-4">
                <p className="text-xs text-slate-500">Starting from</p>
                <p className="text-base font-extrabold text-brand-emerald">{hotel.price}</p>
              </div>

              <Link
                to={`/hotels/${hotel.slug}`}
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-sand text-brand-emerald hover:bg-brand-emerald hover:text-white transition"
              >
                View Rooms & Policies
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
