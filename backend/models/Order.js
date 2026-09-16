import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
});

const orderStatusStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
});

const paymentDetailsSchema = new mongoose.Schema({
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Card', 'NetBanking', 'COD'], 
    required: true 
  },
  transactionId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'], 
    default: 'SUCCESS' 
  },
  amount: { type: Number, required: true },
  upiHandle: { type: String, default: '' },
  timestamp: { type: String, default: () => new Date().toLocaleString('en-IN') },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      mobileNumber: { type: String, required: true },
      email: { type: String, required: true },
      houseFlat: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, default: '' },
      city: { type: String, required: true },
      district: { type: String, default: '' },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currentStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Payment Confirmed',
        'Order Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Order Placed',
    },
    statusTimeline: [orderStatusStepSchema],
    payment: paymentDetailsSchema,
    estimatedDeliveryDate: {
      type: String,
      default: () => new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map _id to id in JSON output
orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const Order = mongoose.model('Order', orderSchema);
