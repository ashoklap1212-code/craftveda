import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  houseFlat: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    default: '',
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'seller'],
      default: 'customer',
    },
    password: {
      type: String,
    },
    isMainAdmin: {
      type: Boolean,
      default: false,
    },
    adminPermissions: {
      type: [String],
      default: ['dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons', 'admins'],
    },
    savedAddresses: [shippingAddressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map MongoDB _id to virtual "id"
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const User = mongoose.model('User', userSchema);