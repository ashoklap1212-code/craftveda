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
    // Reference details & specifications fields
    brand: {
      type: String,
      default: 'CraftVeda Artisans',
    },
    modelNumber: {
      type: String,
      default: '',
    },
    shape: {
      type: String,
      default: 'Round',
    },
    idealUsage: {
      type: String,
      default: 'Pickle Jar & Kitchen Storage',
    },
    isFragile: {
      type: String,
      default: 'Yes',
    },
    isAirtight: {
      type: String,
      default: 'Yes',
    },
    isDisposable: {
      type: String,
      default: 'No',
    },
    packOf: {
      type: String,
      default: '1',
    },
    capacity: {
      type: String,
      default: '1000 ml',
    },
    sellerName: {
      type: String,
      default: 'VsCeramics',
    },
    sellerRating: {
      type: Number,
      default: 4.8,
    },
    sellerYears: {
      type: String,
      default: '2 years with CraftVeda',
    },
    manufacturerInfo: {
      type: String,
      default: 'Handcrafted in Khurja / Jaipur craft clusters by generational potters. Marketed and packed by CraftVeda Handicrafts Pvt Ltd.',
    },
    importantNote: {
      type: String,
      default: 'Product information provided by the seller on the Website is not exhaustive, please read the label on the physical product carefully for complete information provided by the manufacturer. For additional information, please contact the manufacturer.',
    },
    highlights: {
      type: [String],
      default: [],
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
