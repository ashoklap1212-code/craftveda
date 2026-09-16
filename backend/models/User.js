import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

const userSchema = new mongoose.Schema({
    // User name
    name: {
        type: String,
        default: '',
        trim: true,
    },

    // Email address
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },

    // Phone number
    // Google users can add this later from Personal Details
    phone: {
        type: String,
        default: '',
        trim: true,
    },

    // Password
    // Optional because Google authentication does not require a password
    password: {
        type: String,
        required: false,
        select: false,
    },

    // Profile avatar
    avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },

    // Profile image
    profileImage: {
        type: String,
        default: '',
    },

    // Authentication provider
    authProvider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email',
    },

    // Email verification status
    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    // User role
    role: {
        type: String,
        enum: ['user', 'customer', 'admin', 'seller'],
        default: 'customer',
    },

    // Saved shipping addresses
    savedAddresses: [shippingAddressSchema],

    // Account active status
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,

    toJSON: {
        virtuals: true,
    },

    toObject: {
        virtuals: true,
    },
});

// ======================================================
// Map MongoDB _id to a simple "id"
// ======================================================

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// ======================================================
// Password Hashing
// ======================================================
//
// Important:
// Google users do NOT have a password.
//
// Therefore:
// - Google user → skip password hashing
// - Email/password user → hash password before saving
//
// This fixes:
// "TypeError: next is not a function"
// ======================================================

userSchema.pre('save', async function() {
    // No password or password was not changed
    if (!this.isModified('password') || !this.password) {
        return;
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
});

// ======================================================
// Compare Password
// ======================================================

userSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) {
        return false;
    }

    return await bcrypt.compare(enteredPassword, this.password);
};

// ======================================================
// Export User Model
// ======================================================

export const User = mongoose.model('User', userSchema);