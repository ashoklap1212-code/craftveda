import mongoose from 'mongoose';

/**
 * OrderCharges - Admin-configurable order charges stored in MongoDB
 * Only one document exists (singleton pattern) - use upsert to update.
 */
const orderChargesSchema = new mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      default: 99,
      min: 0,
    },
    packagingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 1499,
      min: 0,
    },
    safeFragileShippingLabel: {
      type: String,
      default: 'Safe Fragile Shipping',
    },
    isFreeShippingEnabled: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderChargesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const OrderCharges = mongoose.model('OrderCharges', orderChargesSchema);
