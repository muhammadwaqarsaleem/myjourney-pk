import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Star,
  Bookmark,
  Calendar,
  Users,
  Check,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  LogIn,
  BedDouble,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function HotelDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Active gallery image
  const [selectedImage, setSelectedImage] = useState(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // 1. Fetch hotel details by slug
  const {
    data: hotel,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: async () => {
      const response = await api.get(`/hotels/${slug}`);
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

  // Determine if this hotel is bookmarked
  const isBookmarked = Boolean(
    hotel?._id &&
      (bookmarksData?.hotels?.some(
        (h) => (h._id || h).toString() === hotel._id.toString()
      ) ||
        (Array.isArray(user?.bookmarks?.hotels) &&
          user.bookmarks.hotels.some(
            (id) => (id._id || id).toString() === hotel._id.toString()
          )))
  );

  // Bookmark toggle mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/bookmarks/toggle', {
        itemId: hotel._id,
        itemType: 'hotel',
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

  // Derive active room type from state or fallback to first listed room
  const effectiveRoomType = selectedRoomType || (hotel?.roomTypes?.[0]?.title ?? '');

  // Handle modal escape key listener and scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBookingModalOpen(false);
      }
    };

    if (isBookingModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBookingModalOpen]);

  // Open booking modal (or redirect guest to login)
  const openBookingModal = (roomTitle) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (roomTitle) {
      setSelectedRoomType(roomTitle);
    }
    setBookingError('');
    setBookingConfirmation(null);
    setIsBookingModalOpen(true);
  };

  // Booking inquiry mutation
  const bookingMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/bookings', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setBookingConfirmation(data.data || true);
      setBookingError('');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => {
      setBookingError(err.message || 'Failed to submit booking reservation.');
    },
  });

  // Calculate nights and price estimate
  const nightsCount = (() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const activeRoomObj = hotel?.roomTypes?.find(
    (r) => r.title.trim().toLowerCase() === effectiveRoomType.trim().toLowerCase()
  );

  const pricePerNight = activeRoomObj?.pricePerNight || hotel?.pricePerNightMin || 0;
  const estimatedTotalPrice = pricePerNight * (nightsCount || 1);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!checkInDate || !checkOutDate) {
      setBookingError('Please specify both check-in and check-out dates.');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setBookingError('Check-out date must be strictly after the check-in date.');
      return;
    }

    if (nightsCount < 1) {
      setBookingError('A booking must span at least 1 night.');
      return;
    }

    bookingMutation.mutate({
      hotel: hotel._id,
      roomType: effectiveRoomType,
      checkInDate,
      checkOutDate,
      guests: {
        adults: Math.max(1, Number(adults) || 1),
        children: Math.max(0, Number(childrenCount) || 0),
      },
      specialRequests: specialRequests.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-sm w-36" />
        <div className="h-80 bg-slate-200 rounded-3xl" />
        <div className="h-40 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-sm">
          {error?.message || 'Hotel property not found.'}
        </div>
        <Link
          to="/hotels"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Hotels Directory</span>
        </Link>
      </div>
    );
  }

  const allImages = [
    hotel.coverImage,
    ...(Array.isArray(hotel.images) ? hotel.images : []),
  ].filter(Boolean);

  const mainDisplayImage = selectedImage || allImages[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/hotels"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-emerald transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotels Directory</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-6">
        {/* Main Banner Image */}
        <div className="relative h-72 sm:h-96 bg-slate-900 overflow-hidden">
          <img
            src={mainDisplayImage}
            alt={hotel.name}
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Top Actions: Province Badge + Bookmark */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-emerald text-white shadow-xs">
              {hotel.destination?.province || 'Pakistan'}
            </span>

            <button
              type="button"
              onClick={handleBookmarkClick}
              disabled={toggleBookmarkMutation.isPending}
              className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition shadow-md cursor-pointer ${
                isBookmarked
                  ? 'bg-brand-emerald text-white hover:bg-emerald-800'
                  : 'bg-white/90 backdrop-blur-md text-brand-charcoal hover:bg-white'
              }`}
              aria-label={isBookmarked ? 'Remove hotel from bookmarks' : 'Bookmark this hotel'}
              aria-pressed={isBookmarked}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-brand-mint text-brand-mint' : 'text-slate-600'}`}
              />
              <span>{isBookmarked ? 'Saved' : 'Save Stay'}</span>
            </button>
          </div>

          {/* Bottom Title & Quick Rating */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{hotel.name}</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{Number(hotel.rating || 0).toFixed(1)}</span>
                <span className="text-white/80 font-normal">
                  ({hotel.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-mint shrink-0" />
              <span>{hotel.address}</span>
            </p>
          </div>
        </div>

        {/* Thumbnail Gallery (if multiple images present) */}
        {allImages.length > 1 && (
          <div className="px-6 sm:px-8 flex items-center gap-3 overflow-x-auto pb-2">
            {allImages.map((imgUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`h-16 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                  mainDisplayImage === imgUrl
                    ? 'border-brand-emerald scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Pricing Summary & Quick Booking Action Strip */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Nightly Rates Starting At
            </p>
            <p className="text-2xl font-black text-brand-emerald mt-0.5">
              PKR {Number(hotel.pricePerNightMin || 0).toLocaleString()}
              <span className="text-xs font-normal text-slate-500"> / night</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => openBookingModal()}
            className="min-h-[44px] min-w-[44px] px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-brand-mint" />
            <span>Book This Stay</span>
          </button>
        </div>
      </div>

      {/* Property Amenities */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-brand-charcoal">Property Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {hotel.amenities?.map((amenity, idx) => (
            <div
              key={idx}
              className="p-3 bg-brand-sand/50 rounded-2xl border border-brand-sand/80 flex items-center gap-2 text-xs font-medium text-brand-charcoal"
            >
              <Check className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room Categories & Rates */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Available Room Categories</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your preferred accommodation tier. Rates include applicable regional taxes.
          </p>
        </div>

        <div className="space-y-4">
          {hotel.roomTypes?.map((room, idx) => (
            <div
              key={room._id || idx}
              className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 hover:border-brand-mint/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-brand-emerald" />
                  <h3 className="text-base font-bold text-brand-charcoal">{room.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {room.description || 'Spacious, well-appointed room with modern amenities.'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-mint" />
                    <span>Max {room.capacity || 2} Guests</span>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right shrink-0 space-y-2">
                <div>
                  <p className="text-xl font-black text-brand-emerald">
                    PKR {Number(room.pricePerNight).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">per night</p>
                </div>

                <button
                  type="button"
                  onClick={() => openBookingModal(room.title)}
                  className="min-h-[44px] min-w-[44px] w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-brand-emerald text-white hover:bg-emerald-800 transition shadow-2xs cursor-pointer"
                >
                  Select &amp; Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Partner Contact Information */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-brand-charcoal">Direct Contact &amp; Inquiries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          {hotel.contactPhone && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <Phone className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>{hotel.contactPhone}</span>
            </div>
          )}
          {hotel.contactEmail && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <Mail className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>{hotel.contactEmail}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-emerald font-semibold pt-1">
          <ShieldCheck className="w-4 h-4 text-brand-mint" />
          <span>Accredited partner with verified health &amp; safety standards</span>
        </div>
      </div>

      {/* Booking Modal / Dialog */}
      {isBookingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBookingModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 id="booking-modal-title" className="text-lg font-black text-brand-charcoal">
                  Reserve at {hotel.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Submit a reservation inquiry directly to the hotel management
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                aria-label="Close booking modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If user is somehow not logged in */}
            {!isAuthenticated ? (
              <div className="text-center py-6 space-y-4">
                <LogIn className="w-10 h-10 text-brand-emerald mx-auto" />
                <h4 className="text-base font-bold text-brand-charcoal">Sign In Required</h4>
                <p className="text-xs text-slate-500">
                  Please log in with your myjourney.pk account to reserve accommodations.
                </p>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
                >
                  Go to Login
                </Link>
              </div>
            ) : bookingConfirmation ? (
              /* Success Confirmation View */
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-brand-mint mx-auto" />
                <h4 className="text-xl font-bold text-brand-charcoal">
                  Reservation Inquiry Submitted!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your reservation request for <strong>{effectiveRoomType}</strong> from{' '}
                  <strong>{checkInDate}</strong> to <strong>{checkOutDate}</strong> has been received
                  under status <span className="font-bold text-amber-600">Pending Confirmation</span>.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 text-left space-y-1 border border-slate-200">
                  <p>
                    <strong>Estimated Total:</strong> PKR {estimatedTotalPrice.toLocaleString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {nightsCount} night{nightsCount === 1 ? '' : 's'}
                  </p>
                  <p>
                    <strong>Guests:</strong> {adults} Adult(s), {childrenCount} Child(ren)
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                  >
                    Done
                  </button>
                  <Link
                    to="/my-plans"
                    className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    View My Itineraries
                  </Link>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4" noValidate>
                {bookingError && (
                  <div
                    className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Room Category Selection */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="booking-room-type"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                  >
                    Room Category
                  </label>
                  <select
                    id="booking-room-type"
                    value={effectiveRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald bg-white transition"
                  >
                    {hotel.roomTypes?.map((r, i) => (
                      <option key={r._id || i} value={r.title}>
                        {r.title} — PKR {Number(r.pricePerNight).toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates: Check-In & Check-Out */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-check-in"
                      className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                    >
                      Check-In Date
                    </label>
                    <input
                      id="booking-check-in"
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-check-out"
                      className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                    >
                      Check-Out Date
                    </label>
                    <input
                      id="booking-check-out"
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                    />
                  </div>
                </div>

                {/* Guest Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-adults"
                      className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                    >
                      Adults (18+)
                    </label>
                    <input
                      id="booking-adults"
                      type="number"
                      min={1}
                      max={10}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-children"
                      className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                    >
                      Children
                    </label>
                    <input
                      id="booking-children"
                      type="number"
                      min={0}
                      max={10}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="booking-special-requests"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="booking-special-requests"
                    rows={2}
                    maxLength={500}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Early check-in, ground floor room, airport pickup..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                  />
                </div>

                {/* Live Estimated Price Breakdown */}
                <div className="p-4 bg-brand-sand/60 rounded-2xl border border-brand-sand space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      PKR {pricePerNight.toLocaleString()} &times; {nightsCount} night
                      {nightsCount === 1 ? '' : 's'}
                    </span>
                    <span>PKR {estimatedTotalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-brand-charcoal pt-1 border-t border-slate-200">
                    <span>Estimated Total:</span>
                    <span className="text-brand-emerald">
                      PKR {estimatedTotalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 disabled:opacity-70 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                          aria-hidden="true"
                        />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Inquiry</span>
                        <Send className="w-3.5 h-3.5 text-brand-mint" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
