import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Product category ID is required'],
      trim: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Category display name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: [arr => arr.length > 0, 'Product must have at least one image'],
    },
    description: {
      type: String,
      default: 'Handcrafted traditional Indian craft product.',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: 'High Fired Terracotta Clay',
    },
    dimensions: {
      type: String,
      default: 'Standard Craft Dimensions',
    },
    weight: {
      type: String,
      default: '1.5 kg',
    },
    color: {
      type: String,
      default: 'Natural Clay Earthware',
    },
    manufacturingType: {
      type: String,
      default: 'Potters Wheel & Artisanal Kiln',
    },
    careInstructions: {
      type: String,
      default: 'Clean with damp microfiber cloth.',
    },
    suitableUsage: {
      type: String,
      default: 'Home decor & kitchen storage',
    },
    packagingInfo: {
      type: String,
      default: 'Triple cushioned shockproof box',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 10,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
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

// Map _id to id in JSON output for React frontend compatibility
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const Product = mongoose.model('Product', productSchema);
