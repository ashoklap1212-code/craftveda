import mongoose from 'mongoose';

/**
 * Category Model - Stores product categories in MongoDB Atlas
 * This replaces the hardcoded INITIAL_CATEGORIES in the frontend.
 */
const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: 'Handcrafted traditional Indian craft category.',
    },
    image: {
      type: String,
      required: true,
    },
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual('mongoId').get(function () {
  return this._id.toHexString();
});

export const Category = mongoose.model('Category', categorySchema);
