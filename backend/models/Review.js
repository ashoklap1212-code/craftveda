import mongoose from 'mongoose';

/**
 * CraftVeda – Review Mongoose Model
 * Collection: reviews (MongoDB Atlas → craftdev database)
 */
const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [3, 'Comment must be at least 3 characters long'],
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map _id → id for frontend compatibility
reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Prevent duplicate reviews: one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
