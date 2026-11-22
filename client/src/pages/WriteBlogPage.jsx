import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PenTool,
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Tag,
  FileText,
  AlertCircle,
  Sparkles,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';
import { api } from '../api/axios';

const PRESET_COVERS = [
  {
    name: 'Hunza Valley',
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Passu Cones',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Deosai High Plains',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Historic Lahore',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function WriteBlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    coverImage: '',
    destination: '',
    tags: '',
    content: '',
    status: 'published',
  });

  const [validationError, setValidationError] = useState('');

  // Fetch destinations for selection
  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations-for-writing'],
    queryFn: async () => {
      const response = await api.get('/destinations');
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Create Blog Mutation
  const createBlogMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/blogs', payload);
      return response.data?.data;
    },
    onSuccess: (newBlog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      const targetSlug = newBlog?.slug || newBlog?._id;
      navigate(`/blogs/${targetSlug}`, { replace: true });
    },
    onError: (err) => {
      setValidationError(
        err.response?.data?.message || err.message || 'Failed to publish blog post. Please verify all fields.'
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError('');
  };

  const handlePresetCover = (url) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: url,
    }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const title = formData.title.trim();
    const excerpt = formData.excerpt.trim();
    const coverImage = formData.coverImage.trim();
    const content = formData.content.trim();

    if (!title) {
      setValidationError('Please provide a compelling title for your story.');
      return;
    }
    if (title.length > 200) {
      setValidationError('Title cannot exceed 200 characters.');
      return;
    }
    if (!excerpt) {
      setValidationError('Please provide a short summary/excerpt (under 300 characters).');
      return;
    }
    if (excerpt.length > 300) {
      setValidationError('Excerpt cannot exceed 300 characters.');
      return;
    }
    if (!coverImage) {
      setValidationError('Please specify a cover photo URL or select one from presets.');
      return;
    }
    if (!content) {
      setValidationError('Please write your story content in the main body section.');
      return;
    }

    // Process tags
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const payload = {
      title,
      excerpt,
      coverImage,
      content,
      destination: formData.destination || undefined,
      tags: tagsArray,
      status: formData.status,
    };

    createBlogMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-18 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-emerald transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Story Mode: <span className="text-brand-emerald font-bold capitalize">{formData.status}</span>
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createBlogMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald min-h-[44px]"
            >
              {createBlogMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-brand-mint" />
                  <span>Publish Story</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand text-brand-emerald text-xs font-bold uppercase tracking-wider mb-2">
            <PenTool className="w-3.5 h-3.5 text-brand-mint" />
            <span>Creator Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal">
            Write a Community Travelogue
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Share authentic road journeys, trekking itineraries, lodging secrets, and cultural memories.
          </p>
        </div>

        {/* Validation or API Error Banner */}
        {validationError && (
          <div
            className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-bold">Please check your submission</p>
              <p className="mt-0.5">{validationError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
          {/* Title Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title" className="block text-sm font-bold text-brand-charcoal">
                Story Title <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{formData.title.length} / 200</span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 5 Days Across Shimshal: Crossing the White Glacier on Foot"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-base font-semibold text-brand-charcoal placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Excerpt Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="excerpt" className="block text-sm font-bold text-brand-charcoal">
                Story Excerpt / Teaser <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{formData.excerpt.length} / 300</span>
            </div>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              required
              maxLength={300}
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="A brief 1-2 sentence hook displayed on discovery cards and social previews..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal placeholder:text-slate-400"
            />
          </div>

          {/* Destination & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Linked Destination */}
            <div>
              <label htmlFor="destination" className="block text-sm font-bold text-brand-charcoal mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-emerald" />
                  <span>Linked Destination (Optional)</span>
                </span>
              </label>
              <select
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal bg-white cursor-pointer"
              >
                <option value="">None / General Exploration</option>
                {destinations.map((dest) => (
                  <option key={dest._id || dest.slug} value={dest._id}>
                    {dest.name} ({dest.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-bold text-brand-charcoal mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-emerald" />
                  <span>Publication Status</span>
                </span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal bg-white cursor-pointer"
              >
                <option value="published">Published (Visible to all travelers)</option>
                <option value="draft">Draft (Private to author & admins)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-brand-charcoal mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-emerald" />
                <span>Story Tags (Comma-separated)</span>
              </span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="NorthernPakistan, Trekking, Skardu, Camping, RoadTrip"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal placeholder:text-slate-400"
            />
            <p className="mt-1 text-xs text-slate-400">
              Add tags separated by commas. These help travelers filter stories by travel style or region.
            </p>
          </div>

          {/* Cover Photo URL & Presets */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-bold text-brand-charcoal mb-2">
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-emerald" />
                <span>Cover Image URL <span className="text-red-500">*</span></span>
              </span>
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="url"
              required
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal placeholder:text-slate-400"
            />

            {/* Quick Pick Presets */}
            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-500 mr-2">Or choose a scenic preset:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetCover(preset.url)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition min-h-[36px] flex items-center gap-1.5 ${
                      formData.coverImage === preset.url
                        ? 'border-brand-emerald bg-brand-sand text-brand-emerald font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {formData.coverImage === preset.url && <Check className="w-3.5 h-3.5 text-brand-emerald" />}
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Preview */}
            {formData.coverImage && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                <img
                  src={formData.coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Main Story Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-bold text-brand-charcoal">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-emerald" />
                  <span>Story Content <span className="text-red-500">*</span></span>
                </span>
              </label>
              <span className="text-xs text-slate-400">
                {formData.content.trim() ? `${formData.content.trim().split(/\s+/).length} words` : '0 words'}
              </span>
            </div>

            {/* Formatting Hints helper */}
            <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Formatting tips: </span>
                Separate paragraphs with a blank line. Use <code className="bg-slate-200/70 px-1 py-0.5 rounded">## Heading</code> for major sections, <code className="bg-slate-200/70 px-1 py-0.5 rounded">- item</code> for packing lists, and <code className="bg-slate-200/70 px-1 py-0.5 rounded">&gt; quote</code> for tips. All text is rendered securely with native XSS escaping.
              </div>
            </div>

            <textarea
              id="content"
              name="content"
              rows={16}
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your adventure story here...&#10;&#10;## Day 1: The Departure&#10;We set out at dawn from Gilgit with our backpacks loaded...&#10;&#10;## Essential Tips for Travelers&#10;- Carry cash since ATMs are scarce beyond Passu&#10;- Acclimatize before tackling higher trails"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-base font-normal text-slate-800 leading-relaxed font-sans placeholder:text-slate-400"
            />
          </div>

          {/* Submission Bottom Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/blogs"
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition min-h-[44px] flex items-center"
            >
              Discard Changes
            </Link>

            <button
              type="submit"
              disabled={createBlogMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-md shadow-brand-emerald/20 transition min-h-[44px]"
            >
              {createBlogMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Story...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-brand-mint" />
                  <span>Publish Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
