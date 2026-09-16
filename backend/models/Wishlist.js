import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    productIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
