import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CloudSun,
  Star,
  Bookmark,
  Utensils,
  Camera,
  Ticket,
  Send,
  User,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function DestinationDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Active tab state: 'sites' or 'foods'
  const [activeTab, setActiveTab] = useState('sites');

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // 1. Fetch destination details by slug
  const {
    data: destination,
    isLoading: isDestLoading,
    isError: isDestError,
    error: destError,
  } = useQuery({
    queryKey: ['destination', slug],
    queryFn: async () => {
      const response = await api.get(`/destinations/${slug}`);
      return response.data?.data;
    },
    enabled: Boolean(slug),
  });

  // 2. Fetch authenticated user's bookmarks to detect bookmarked status
  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks');
      return response.data?.data;
    },
    enabled: isAuthenticated,
  });

  // Determine if this destination is currently bookmarked
  const isBookmarked = Boolean(
    destination?._id &&
      (bookmarksData?.destinations?.some(
        (d) => (d._id || d).toString() === destination._id.toString()
      ) ||
        (Array.isArray(user?.bookmarks?.destinations) &&
          user.bookmarks.destinations.some(
            (id) => (id._id || id).toString() === destination._id.toString()
          )))
  );

  // 3. Fetch reviews for this destination
  const {
    data: reviewsList = [],
    isLoading: isReviewsLoading,
  } = useQuery({
    queryKey: ['reviews', destination?._id],
    queryFn: async () => {
      const response = await api.get(`/reviews/destination/${destination._id}`);
      return response.data?.data || [];
    },
    enabled: Boolean(destination?._id),
  });

  // Bookmark toggle mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/bookmarks/toggle', {
        itemId: destination._id,
        itemType: 'destination',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      checkAuth();
    },
  });

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    toggleBookmarkMutation.mutate();
  };

  // Review submission mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewPayload) => {
      const response = await api.post(
        `/reviews/destination/${destination._id}`,
        reviewPayload
      );
      return response.data;
    },
    onSuccess: () => {
      setReviewSuccess('Thank you! Your review has been published.');
      setComment('');
      setVisitDate('');
      setRating(5);
      setReviewError('');
      queryClient.invalidateQueries({ queryKey: ['reviews', destination._id] });
      queryClient.invalidateQueries({ queryKey: ['destination', slug] });
    },
    onError: (err) => {
      setReviewError(err.message || 'Failed to submit review.');
      setReviewSuccess('');
    },
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Please enter your review comments.');
      return;
    }

    addReviewMutation.mutate({
      rating,
      comment: comment.trim(),
      visitDate: visitDate.trim() || undefined,
    });
  };

  // Check if current authenticated user has already submitted a review
  const hasUserReviewed = Boolean(
    isAuthenticated &&
      user?._id &&
      reviewsList.some(
        (rev) => rev.user?._id?.toString() === user._id.toString() || rev.user === user._id.toString()
      )
  );

  if (isDestLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-sm w-36" />
        <div className="h-80 bg-slate-200 rounded-3xl" />
        <div className="h-40 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (isDestError || !destination) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-sm">
          {destError?.message || 'Destination not found.'}
        </div>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Destinations Explorer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/destinations"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Destinations</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-72 sm:h-96 bg-slate-900">
          <img
            src={
              destination.bannerImage ||
              'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1600&q=80'
            }
            alt={destination.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top Badges & Actions */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-emerald text-white shadow-xs">
              {destination.province}
            </span>

            {/* Interactive Bookmark Button */}
            <button
              type="button"
              onClick={handleBookmarkClick}
              disabled={toggleBookmarkMutation.isPending}
              className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition shadow-md cursor-pointer ${
                isBookmarked
                  ? 'bg-brand-emerald text-white hover:bg-emerald-800'
                  : 'bg-white/90 backdrop-blur-md text-brand-charcoal hover:bg-white'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this destination'}
              aria-pressed={isBookmarked}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-brand-mint text-brand-mint' : 'text-slate-600'}`}
              />
              <span>{isBookmarked ? 'Saved' : 'Save Place'}</span>
            </button>
          </div>

          {/* Bottom Title & Stats */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{destination.name}</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{Number(destination.averageRating || 0).toFixed(1)}</span>
                <span className="text-white/80 font-normal">
                  ({destination.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Metadata Strip */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald shrink-0 mt-0.5">
              <Calendar className="w-5 h-5 text-brand-mint" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Best Time to Visit
              </p>
              <p className="text-xs font-semibold text-brand-charcoal mt-0.5">
                {destination.bestTimeToVisit || 'Year-round'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald shrink-0 mt-0.5">
              <CloudSun className="w-5 h-5 text-brand-mint" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Climate &amp; Weather
              </p>
              <p className="text-xs font-semibold text-brand-charcoal mt-0.5">
                {destination.climateInfo || 'Comfortable seasonal conditions'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-sand flex items-center justify-center text-brand-emerald shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-brand-mint" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Geographic Region
              </p>
              <p className="text-xs font-semibold text-brand-charcoal mt-0.5">
                {destination.province}, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-brand-charcoal">About {destination.name}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {destination.description}
          </p>
        </div>
      </div>

      {/* Tabbed Section: Sites to Visit vs. Famous Foods */}
      <div className="space-y-6">
        <div
          role="tablist"
          className="flex border-b border-slate-200 gap-6"
          aria-label="Destination details navigation"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sites'}
            onClick={() => setActiveTab('sites')}
            className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sites'
                ? 'border-brand-emerald text-brand-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Sites to Visit ({destination.sitesToVisit?.length || 0})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'foods'}
            onClick={() => setActiveTab('foods')}
            className={`min-h-[44px] pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'foods'
                ? 'border-brand-emerald text-brand-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Famous Regional Foods ({destination.famousFoods?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Sites to Visit */}
        {activeTab === 'sites' && (
          <div className="space-y-4">
            {(!destination.sitesToVisit || destination.sitesToVisit.length === 0) && (
              <p className="text-sm text-slate-500 italic p-6 bg-white rounded-2xl border border-slate-200">
                No tourist sites recorded for this location yet.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.sitesToVisit?.map((site, index) => (
                <div
                  key={site._id || index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {site.image && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={site.image}
                        alt={site.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-sand text-brand-emerald">
                          {site.category || 'Attraction'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-brand-charcoal">{site.name}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {site.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                      <Ticket className="w-3.5 h-3.5 text-brand-mint shrink-0" />
                      <span>{site.ticketInfo || 'Standard admissions policy'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Famous Foods */}
        {activeTab === 'foods' && (
          <div className="space-y-4">
            {(!destination.famousFoods || destination.famousFoods.length === 0) && (
              <p className="text-sm text-slate-500 italic p-6 bg-white rounded-2xl border border-slate-200">
                No culinary specialties recorded for this location yet.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.famousFoods?.map((food, index) => (
                <div
                  key={food._id || index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {food.image && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={food.image}
                        alt={food.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-brand-charcoal">{food.name}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {food.description}
                      </p>
                    </div>

                    {food.mustTrySpot && (
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Utensils className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Must Try At: {food.mustTrySpot}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Traveler Reviews & Ratings Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-1">
            <Star className="w-4 h-4 text-brand-mint" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-charcoal">
            Traveler Reviews &amp; Ratings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Genuine accounts and advice shared by visitors to {destination.name}.
          </p>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {isReviewsLoading && (
            <p className="text-xs text-slate-500 italic">Loading community reviews...</p>
          )}

          {!isReviewsLoading && reviewsList.length === 0 && (
            <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
              No reviews submitted yet for {destination.name}. Be the first to share your experience!
            </div>
          )}

          {!isReviewsLoading && reviewsList.length > 0 && (
            <div className="divide-y divide-slate-100">
              {reviewsList.map((rev) => (
                <div key={rev._id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center font-bold text-xs">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-charcoal">
                          {rev.user?.name || 'Fellow Traveler'}
                        </p>
                        {rev.visitDate && (
                          <p className="text-[10px] text-slate-400">Visited: {rev.visitDate}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= rev.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-10">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Block */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-brand-charcoal">Leave a Review</h3>

          {!isAuthenticated ? (
            <div className="p-6 bg-brand-sand/50 rounded-2xl border border-brand-sand flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-charcoal">
                  Have you visited {destination.name}?
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in with your account to rate the destination and help fellow travelers.
                </p>
              </div>
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-brand-mint" />
                <span>Log in to Review</span>
              </Link>
            </div>
          ) : hasUserReviewed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>You have already submitted a review for this destination. Thank you!</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-2xl">
              {reviewError && (
                <div
                  className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Rating
                </label>
                <div className="flex items-center gap-2" role="group" aria-label="Rating selection">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-amber-400 focus:outline-none transition cursor-pointer"
                      aria-label={`Select ${starVal} out of 5 stars`}
                      aria-pressed={rating === starVal}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          starVal <= rating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Approximate Visit Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-visit-date"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                >
                  Approximate Time of Visit (Optional)
                </label>
                <input
                  id="review-visit-date"
                  type="text"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  placeholder="e.g., Autumn 2026 or October 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-comment"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                >
                  Your Review &amp; Recommendations
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on road accessibility, local guides, seasonal conditions, and food highlights..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
                />
              </div>

              <button
                type="submit"
                disabled={addReviewMutation.isPending}
                className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 disabled:opacity-70 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                {addReviewMutation.isPending ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Review</span>
                    <Send className="w-3.5 h-3.5 text-brand-mint" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
