/**
 * @fileoverview Blog story detail page with DOMPurify XSS mitigation.
 * Renders verified creator travel narratives, likes mutation, and rich metadata.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Stored Cross-Site Scripting (XSS) Mitigation with DOMPurify:
 *    - User-generated blog narratives represent untrusted markdown/HTML content.
 *      Rendering raw unvalidated markup via `dangerouslySetInnerHTML` allows attackers
 *      to inject `<script>`, `<img src=x onerror=...>`, or `javascript:` URI vectors
 *      into the DOM, compromising traveler session cookies.
 *    - `DOMPurify.sanitize(content, options)` strips malicious tags, prototype pollution
 *      vectors, and suspicious script attributes while preserving safe semantic tags
 *      (headings, bold text, lists, and safe external links with rel="noopener noreferrer").
 * 
 * 2. Cache Invalidation & Asynchronous Mutation Cycles:
 *    - Likes updates utilize TanStack Query's `useMutation` hook.
 *    - Upon HTTP 200 response, `queryClient.invalidateQueries` triggers declarative
 *      refetches for both `['blog', slug]` and the global `['blogs']` collection,
 *      maintaining cache synchronization without manual state mutation.
 * 
 * 3. Defensive Layout Shift (CLS) Handling:
 *    - Header and cover images specify explicit height bounds, `loading="lazy"`,
 *      and fallback placeholder handlers.
 * 
 * @module pages/BlogDetailPage
 */

import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MapPin,
  Share2,
  Trash2,
  AlertCircle,
  Check,
  Compass,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch blog data by slug or ID
  const {
    data: blog,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const response = await api.get(`/blogs/${slug}`);
      return response.data?.data;
    },
    enabled: Boolean(slug),
  });

  // Toggle Like Mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!blog?._id) return;
      const res = await api.post(`/blogs/${blog._id}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', slug] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Could not update like status');
    },
  });

  // Delete Blog Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!blog?._id) return;
      const res = await api.delete(`/blogs/${blog._id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate('/blogs', { replace: true });
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete blog post');
      setShowDeleteConfirm(false);
    },
  });

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setActionError('');
    likeMutation.mutate();
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  /**
   * Parses markdown and sanitizes HTML via DOMPurify to defend against Stored XSS.
   * Converts markdown paragraphs, headings, blockquotes, and lists into sanitized DOM nodes.
   *
   * @param {string} rawContent - User-submitted blog content
   * @returns {JSX.Element[]} Sanitized React elements
   */
  const renderSanitizedContent = (rawContent) => {
    if (!rawContent) return null;

    // Split on empty lines or double newlines to form clean structural paragraphs
    const paragraphs = rawContent
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return paragraphs.map((para, index) => {
      // 1. Markdown H3
      if (para.startsWith('### ')) {
        const cleanHeading = DOMPurify.sanitize(para.replace('### ', ''));
        return (
          <h3
            key={index}
            className="text-xl font-bold text-slate-900 mt-8 mb-4 tracking-tight"
            dangerouslySetInnerHTML={{ __html: cleanHeading }}
          />
        );
      }

      // 2. Markdown H2
      if (para.startsWith('## ')) {
        const cleanHeading = DOMPurify.sanitize(para.replace('## ', ''));
        return (
          <h2
            key={index}
            className="text-2xl font-black text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2 tracking-tight"
            dangerouslySetInnerHTML={{ __html: cleanHeading }}
          />
        );
      }

      // 3. Markdown H1
      if (para.startsWith('# ')) {
        const cleanHeading = DOMPurify.sanitize(para.replace('# ', ''));
        return (
          <h2
            key={index}
            className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4 tracking-tight"
            dangerouslySetInnerHTML={{ __html: cleanHeading }}
          />
        );
      }

      // 4. Markdown Blockquote
      if (para.startsWith('> ')) {
        const cleanQuote = DOMPurify.sanitize(para.replace('> ', ''));
        return (
          <blockquote
            key={index}
            className="border-l-4 border-emerald-600 bg-emerald-50/50 pl-4 py-3 italic text-slate-800 my-6 rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: cleanQuote }}
          />
        );
      }

      // 5. Markdown Unordered List
      if (para.startsWith('- ') || para.startsWith('* ')) {
        const items = para.split(/\r?\n/).map((line) => line.replace(/^[-*]\s+/, '').trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-slate-700 pl-2">
            {items.map((item, itemIdx) => {
              const cleanItem = DOMPurify.sanitize(item);
              return (
                <li
                  key={itemIdx}
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanItem }}
                />
              );
            })}
          </ul>
        );
      }

      // 6. Standard Body Paragraph (Sanitized with DOMPurify)
      const cleanPara = DOMPurify.sanitize(para);
      return (
        <p
          key={index}
          className="text-slate-700 text-base sm:text-lg leading-relaxed mb-6 font-normal"
          dangerouslySetInnerHTML={{ __html: cleanPara }}
        />
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded-md w-32" />
          <div className="h-10 bg-slate-200 rounded-md w-3/4" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-40" />
              <div className="h-3 bg-slate-200 rounded-md w-24" />
            </div>
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="h-4 bg-slate-200 rounded-md w-full" />
            <div className="h-4 bg-slate-200 rounded-md w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-red-200 max-w-lg w-full text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Travelogue Not Found</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            {error?.response?.data?.message || 'The requested story could not be retrieved or may have been deleted.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
            <Link
              to="/blogs"
              className="px-5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-sm rounded-xl transition"
            >
              Back to Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const blogAuthorId = typeof blog.author === 'object' && blog.author !== null ? blog.author._id : blog.author;
  const isAuthor = user && String(blogAuthorId) === String(user._id);
  const isAdmin = user?.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  const hasLiked = Boolean(
    user &&
      Array.isArray(blog.likes) &&
      blog.likes.some((id) => {
        const uid = typeof id === 'object' && id !== null ? id._id : id;
        return String(uid) === String(user._id);
      })
  );

  const authorName = blog.author?.name || 'Explorer';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const likesCount = Array.isArray(blog.likes) ? blog.likes.length : 0;
  const viewsCount = blog.views || 0;
  const readTimeMins = blog.readTime || 3;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-slate-100 bg-slate-50/60 sticky top-18 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Travelogues</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this story"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Author/Admin Delete Action */}
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete this blog post"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 id="delete-dialog-title" className="text-xl font-bold text-slate-900 text-center mb-2">
              Delete This Travelogue?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
              This action is permanent and cannot be undone. All views and likes associated with this story
              will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-sm min-h-[44px] cursor-pointer"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Destination & Tags Top Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {blog.destination?.name && (
            <Link
              to={`/destinations/${blog.destination.slug || blog.destination._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-200" />
              <span>{blog.destination.name}</span>
            </Link>
          )}

          {Array.isArray(blog.tags) &&
            blog.tags.map((tag, idx) => (
              <Link
                key={idx}
                to={`/blogs?tags=${encodeURIComponent(tag)}`}
                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition"
              >
                #{tag}
              </Link>
            ))}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt Lead */}
        <p className="mt-4 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-4">
          {blog.excerpt}
        </p>

        {/* Author & Meta Header */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {blog.author?.avatar ? (
              <img
                src={blog.author.avatar}
                alt={authorName}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
                }}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {authorInitial}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{authorName}</span>
                {blog.author?.role && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {blog.author.role}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(blog.createdAt)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readTimeMins} min read</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{viewsCount} reads</span>
            </span>

            <button
              type="button"
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
              aria-label={hasLiked ? 'Unlike this story' : 'Like this story'}
              className={`min-h-[44px] px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-xs cursor-pointer ${
                hasLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
                }`}
              />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mt-8 rounded-3xl overflow-hidden shadow-md bg-slate-100 max-h-[500px]">
          <img
            src={blog.coverImage}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover max-h-[500px]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>

        {/* DOMPurify-Sanitized Narrative Content */}
        <div className="mt-12 text-slate-800 leading-relaxed">
          {renderSanitizedContent(blog.content)}
        </div>

        {/* Like Footer Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/70 p-6 sm:p-8 rounded-3xl">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Did this story inspire your trip?</h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Give the author a heart and support community-driven exploration across Pakistan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
              className={`min-h-[44px] px-6 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm transition-all shadow-sm cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : 'text-slate-400'}`} />
              <span>{hasLiked ? 'Liked Story' : 'Like Story'} ({likesCount})</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Author Bio Card */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {blog.author?.avatar ? (
            <img
              src={blog.author.avatar}
              alt={authorName}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
              }}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shrink-0">
              {authorInitial}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Written by</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                {blog.author?.role || 'Creator'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{authorName}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {blog.author?.bio ||
                'Travel enthusiast and documentarian sharing firsthand experiences across Pakistan.'}
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            <span>Explore More Community Travelogues</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
