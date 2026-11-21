import { BookOpen, User, Calendar } from 'lucide-react';

export default function BlogsPage() {
  const sampleBlogs = [
    {
      id: 1,
      title: '7 Days in Hunza: From Karimabad Sunsets to Passu Cones',
      author: 'Ayesha Khan',
      date: 'November 2026',
      readTime: '6 min read',
      excerpt:
        'A comprehensive guide to experiencing local Wakhi culture, visiting 900-year-old forts, and tasting authentic Chapshuro.',
      category: 'Expedition Journal',
    },
    {
      id: 2,
      title: 'Conquering the Deosai Plateau: Tips for High-Altitude Camping',
      author: 'Bilal Ahmed',
      date: 'October 2026',
      readTime: '8 min read',
      excerpt:
        'Everything you need to know about weather preparedness, wildlife conservation, and night sky photography on the roof of the world.',
      category: 'Adventure Guide',
    },
    {
      id: 3,
      title: 'Culinary Trail of Old Lahore: Beyond Gawalmandi',
      author: 'Zainab Tariq',
      date: 'September 2026',
      readTime: '5 min read',
      excerpt:
        'Uncovering hidden Nihari spots, aromatic Cardamom tea, and clay-oven kulchas in the historic Delhi Gate alleys.',
      category: 'Culinary Heritage',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-brand-emerald text-sm font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Traveler Chronicles</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-charcoal">Community Travel Blogs</h1>
        <p className="text-slate-600 mt-2">
          Read genuine narratives, photographic logs, and practical route guides published by travelers across Pakistan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sampleBlogs.map((blog) => (
          <article
            key={blog.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
          >
            <div className="h-48 bg-gradient-to-tr from-brand-emerald to-slate-800 p-6 flex flex-col justify-between text-white">
              <span className="self-start text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-brand-mint text-brand-charcoal">
                {blog.category}
              </span>
              <h2 className="text-lg font-bold line-clamp-2">{blog.title}</h2>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {blog.excerpt}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{blog.date}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
