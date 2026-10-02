import express from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Helper – recalculate & persist average rating + reviewCount on a product
 * after any review insert / delete / hide.
 */
async function syncProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isHidden: false } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating = stats.length ? Number(stats[0].avgRating.toFixed(1)) : 0;
  const reviewCount = stats.length ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { rating: avgRating, reviewCount });
}

// ---------------------------------------------------------------------------
// @desc    Get all reviews for a specific product (public)
// @route   GET /api/reviews/product/:productId
// @access  Public
// ---------------------------------------------------------------------------
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const reviews = await Review.find({ productId, isHidden: false })
      .sort({ createdAt: -1 })
      .lean();

    // Compute summary
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          )
        : 0;

    const mapped = reviews.map((r) => ({
      ...r,
      id: r._id.toString(),
      productId: r.productId.toString(),
      userId: r.userId.toString(),
      date: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
    }));

    res.json({ reviews: mapped, totalReviews, averageRating });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// @desc    Get all reviews (admin – includes hidden)
// @route   GET /api/reviews/admin
// @access  Admin only
// ---------------------------------------------------------------------------
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('productId', 'name images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = reviews.map((r) => ({
      ...r,
      id: r._id.toString(),
      productId: r.productId?._id?.toString() || r.productId?.toString() || '',
      productName: r.productId?.name || 'Deleted Product',
      productImage: r.productId?.images?.[0] || '',
      userId: r.userId?._id?.toString() || r.userId?.toString() || '',
      customerName: r.userId?.name || r.userName || 'Unknown',
      customerEmail: r.userId?.email || '',
      date: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
    }));

    res.json(mapped);
  } catch (error) {
    console.error('❌ Error fetching admin reviews:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews for admin', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// @desc    Submit a new review (authenticated customers only)
// @route   POST /api/reviews
// @access  Protected (customer)
// ---------------------------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validate required fields
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    if (!comment || comment.trim().length < 3)
      return res.status(400).json({ message: 'Review comment must be at least 3 characters' });

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // Ensure product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check for verified purchase (user must have a Delivered order containing this product)
    // Note: Order.userId and Order.items.productId are stored as strings in the Order model
    const verifiedOrder = await Order.findOne({
      userId: req.user._id.toString(),
      'items.productId': productId.toString(),
      currentStatus: 'Delivered',
    });
    const verifiedPurchase = Boolean(verifiedOrder);

    // Prevent duplicate: one review per user per product
    const existing = await Review.findOne({ productId, userId: req.user._id });
    if (existing) {
      return res.status(409).json({
        message: 'You have already submitted a review for this product',
      });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name || req.user.email,
      rating: Number(rating),
      comment: comment.trim(),
      verifiedPurchase,
    });

    // Recalculate product average rating
    await syncProductRating(productId);

    const reviewObj = review.toObject({ virtuals: true });
    res.status(201).json({
      ...reviewObj,
      id: review._id.toString(),
      productId: productId.toString(),
      userId: req.user._id.toString(),
      date: review.createdAt.toISOString().split('T')[0],
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }
    console.error('❌ Error creating review:', error.message);
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// @desc    Admin: Hide a review (soft-delete)
// @route   PATCH /api/reviews/:id/hide
// @access  Admin only
// ---------------------------------------------------------------------------
router.patch('/:id/hide', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isHidden = true;
    await review.save();

    await syncProductRating(review.productId);

    res.json({ message: 'Review hidden successfully', id: review._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to hide review', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// @desc    Admin: Unhide a review
// @route   PATCH /api/reviews/:id/unhide
// @access  Admin only
// ---------------------------------------------------------------------------
router.patch('/:id/unhide', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isHidden = false;
    await review.save();

    await syncProductRating(review.productId);

    res.json({ message: 'Review restored successfully', id: review._id.toString() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unhide review', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// @desc    Admin: Permanently delete a review
// @route   DELETE /api/reviews/:id
// @access  Admin only
// ---------------------------------------------------------------------------
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const productId = review.productId;
    await review.deleteOne();

    await syncProductRating(productId);

    res.json({ message: 'Review deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
});

export default router;
