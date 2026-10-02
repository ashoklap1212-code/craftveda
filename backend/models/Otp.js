import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpCode: {
      type: String,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAttempts: {
      type: Number,
      default: 1,
    },
    lastResendAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model('Otp', otpSchema);
