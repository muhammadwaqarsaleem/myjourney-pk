/**
 * @fileoverview Blog controller handling community travelogues, drafting, publishing,
 * search filtering, view increments, ownership-guarded editing, and like toggling.
 * @module controllers/blogController
 */

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Blog, { slugify, calculateReadTime } from '../models/Blog.js';
import Destination from '../models/Destination.js';
import User from '../models/User.js';

/**
 * @desc    Get all published blogs with optional filters (tag, destination, search keyword, page, limit)
 * @route   GET /api/blogs
 * @access  Public
 *
 * Query Params:
 *  - tag: Filter by topic tag (e.g., 'NorthernPakistan', 'BudgetTravel')
 *  - destination: Destination ObjectId or slug to filter stories by region
 *  - search / q: Search keyword matched against title, excerpt, and tags
 *  - author: Filter blogs by specific author User ObjectId
 *  - sort: Sort field (default: '-createdAt', e.g., '-views', '-createdAt')
 *  - page: Page number (default: 1)
 *  - limit: Results per page (default: 10, max: 50)
 */
export const getPublishedBlogs = async (req, res) => {
  try {
    const { tag, destination, search, q, author, sort } = req.query;

    // Sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Filter to only published blogs for public discovery
    const filter = { status: 'published' };

    // 1. Tag filter (case-insensitive)
    if (tag) {
      filter.tags = { $regex: new RegExp(`^${tag.trim()}$`, 'i') };
    }

    // 2. Destination filter (supports either ObjectId or destination slug)
    if (destination) {
      if (mongoose.isValidObjectId(destination)) {
        filter.destination = destination;
      } else {
        const destDoc = await Destination.findOne({
          slug: destination.toLowerCase().trim(),
        }).select('_id');

        if (destDoc) {
          filter.destination = destDoc._id;
        } else {
          // Destination slug did not match any record; return empty collection gracefully
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            pagination: {
              page,
              limit,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
            data: [],
          });
        }
      }
    }

    // 3. Author filter
    if (author && mongoose.isValidObjectId(author)) {
      filter.author = author;
    }

    // 4. Keyword search across title, excerpt, and tags
    const keyword = (search || q || '').trim();
    if (keyword) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { excerpt: { $regex: escapedKeyword, $options: 'i' } },
        { tags: { $regex: escapedKeyword, $options: 'i' } },
      ];
    }

    // 5. Sorting
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    // Execute queries in parallel for efficiency
    const [total, blogs] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .populate('author', 'name avatar bio role')
        .populate('destination', 'name slug province bannerImage')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: blogs,
    });
  } catch (error) {
    console.error('💥 [getPublishedBlogs Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blog posts',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single blog by slug (or ObjectId) and atomically increment views
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Blog slug or ID parameter is required',
      });
    }

    // Check if identifier is an ObjectId or URL slug
    const isObjectId = mongoose.isValidObjectId(slug);
    const query = isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug };

    // Atomically increment views count and fetch populated blog
    const blog = await Blog.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio role')
      .populate('destination', 'name slug province bannerImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // If blog is currently a draft, allow view only for its author or an admin
    if (blog.status === 'draft') {
      let isAuthorizedViewer = false;

      // Extract token from cookie or header if present
      let token = req.cookies?.token;
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const requestingUser = await User.findById(decoded.id).select('role');
          if (
            requestingUser &&
            (requestingUser.role === 'admin' || blog.author._id.equals(requestingUser._id))
          ) {
            isAuthorizedViewer = true;
          }
        } catch {
          // Token invalid or expired; remain unauthorized
          isAuthorizedViewer = false;
        }
      }

      if (!isAuthorizedViewer) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('💥 [getBlogBySlug Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blog post',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all blogs (drafts + published) authored by current logged-in creator/admin
 * @route   GET /api/blogs/my-blogs
 * @access  Protected (creator, admin)
 */
export const getMyBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id };

    // Optional status filter (draft or published)
    if (req.query.status && ['draft', 'published'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Optional search keyword
    const keyword = (req.query.search || req.query.q || '').trim();
    if (keyword) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { excerpt: { $regex: escapedKeyword, $options: 'i' } },
        { tags: { $regex: escapedKeyword, $options: 'i' } },
      ];
    }

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .populate('destination', 'name slug province bannerImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: blogs,
    });
  } catch (error) {
    console.error('💥 [getMyBlogs Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user blogs',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new travelogue / blog post
 * @route   POST /api/blogs
 * @access  Protected (creator, admin)
 */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      coverImage,
      destination,
      tags,
      readTime,
      status,
      slug,
    } = req.body;

    // Field validations
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog title is required',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog content is required',
      });
    }

    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog excerpt is required',
      });
    }

    if (excerpt.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Excerpt cannot exceed 300 characters',
      });
    }

    if (!coverImage || !coverImage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cover image URL is required',
      });
    }

    // Optional destination validation
    let destinationId = null;
    if (destination) {
      if (mongoose.isValidObjectId(destination)) {
        const destExists = await Destination.exists({ _id: destination });
        if (!destExists) {
          return res.status(400).json({
            success: false,
            message: 'Provided destination ID does not exist',
          });
        }
        destinationId = destination;
      } else {
        const destDoc = await Destination.findOne({ slug: destination.toLowerCase().trim() });
        if (destDoc) {
          destinationId = destDoc._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Destination slug '${destination}' does not exist`,
          });
        }
      }
    }

    // Generate unique slug
    const baseSlug = slug ? slugify(slug) : slugify(title);
    let finalSlug = baseSlug || `travelogue-${Date.now()}`;
    let counter = 1;
    while (await Blog.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Parse tags array
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Calculate or accept readTime
    const finalReadTime =
      readTime && Number(readTime) > 0 ? Number(readTime) : calculateReadTime(content);

    // Create the blog post
    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      content,
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      author: req.user._id,
      destination: destinationId,
      tags: parsedTags,
      readTime: finalReadTime,
      status: status === 'draft' ? 'draft' : 'published',
    });

    // Populate references for client response
    await newBlog.populate('author', 'name avatar role');
    if (newBlog.destination) {
      await newBlog.populate('destination', 'name slug province bannerImage');
    }

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog,
    });
  } catch (error) {
    console.error('💥 [createBlog Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing blog post
 * @route   PUT /api/blogs/:id
 * @access  Protected (creator, admin - author ownership or admin role required)
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format',
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // Enforce ownership: creator can only edit their own blog; admin can edit any
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post. You can only edit your own content.',
      });
    }

    const {
      title,
      content,
      excerpt,
      coverImage,
      destination,
      tags,
      readTime,
      status,
      slug,
    } = req.body;

    // Update title and slug if modified
    if (title && title.trim()) {
      blog.title = title.trim();
    }

    if (slug || (title && title.trim() !== blog.title)) {
      const baseSlug = slug ? slugify(slug) : slugify(blog.title);
      let finalSlug = baseSlug;
      let counter = 1;
      while (await Blog.exists({ slug: finalSlug, _id: { $ne: blog._id } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter += 1;
      }
      blog.slug = finalSlug;
    }

    // Update content and recalculate readTime if necessary
    if (content !== undefined) {
      blog.content = content;
      if (!readTime) {
        blog.readTime = calculateReadTime(content);
      }
    }

    if (excerpt !== undefined) {
      if (excerpt.trim().length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Excerpt cannot exceed 300 characters',
        });
      }
      blog.excerpt = excerpt.trim();
    }

    if (coverImage !== undefined) {
      blog.coverImage = coverImage.trim();
    }

    if (readTime !== undefined && Number(readTime) > 0) {
      blog.readTime = Number(readTime);
    }

    if (status !== undefined && ['draft', 'published'].includes(status)) {
      blog.status = status;
    }

    // Update destination if provided
    if (destination !== undefined) {
      if (!destination) {
        blog.destination = null;
      } else if (mongoose.isValidObjectId(destination)) {
        const destExists = await Destination.exists({ _id: destination });
        if (!destExists) {
          return res.status(400).json({
            success: false,
            message: 'Provided destination ID does not exist',
          });
        }
        blog.destination = destination;
      } else {
        const destDoc = await Destination.findOne({ slug: destination.toLowerCase().trim() });
        if (destDoc) {
          blog.destination = destDoc._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Destination slug '${destination}' does not exist`,
          });
        }
      }
    }

    // Update tags
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        blog.tags = tags.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        blog.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    await blog.save();

    await blog.populate('author', 'name avatar role');
    if (blog.destination) {
      await blog.populate('destination', 'name slug province bannerImage');
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog,
    });
  } catch (error) {
    console.error('💥 [updateBlog Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Protected (creator, admin - author ownership or admin role required)
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format',
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    // Enforce ownership: creator can only delete their own blog; admin can delete any
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post. You can only remove your own content.',
      });
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
      data: {
        blogId: id,
      },
    });
  } catch (error) {
    console.error('💥 [deleteBlog Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle like on a blog post (like if unliked, unlike if liked)
 * @route   POST /api/blogs/:id/like
 * @access  Protected (all authenticated users)
 */
export const toggleLikeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format',
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = blog.likes.findIndex((userId) => userId.toString() === userIdStr);

    let isLiked = false;

    if (existingIndex > -1) {
      // User has already liked: remove like (unlike)
      blog.likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      // User has not liked: add like
      blog.likes.push(req.user._id);
      isLiked = true;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Blog post liked successfully' : 'Blog post unliked successfully',
      data: {
        blogId: blog._id,
        likesCount: blog.likes.length,
        isLiked,
      },
    });
  } catch (error) {
    console.error('💥 [toggleLikeBlog Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle blog like status',
      error: error.message,
    });
  }
};
