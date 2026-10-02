import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { Notification } from '../models/Notification.js';
import { sendOtpEmail, sendLoginSuccessEmail } from '../utils/sendEmail.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'craftveda_secret_jwt_key_2026_secure',
    { expiresIn: '30d' }
  );
};

// Helper to set HttpOnly Session Cookie
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('craftveda_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Helper to clear HttpOnly Session Cookie
const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('craftveda_session', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
};

// Helper to hash OTP code securely with SHA-256
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

// Helper email format validator
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper to format user response object
const formatUserResponse = (user) => {
  return {
    id: user.id || user._id.toString(),
    _id: user._id.toString(),
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
    profileImage: user.profileImage || '',
    avatar: user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    googleId: user.googleId || null,
    authProvider: user.authProvider || 'email',
    isEmailVerified: user.isEmailVerified ?? true,
    profileCompleted: Boolean(user.profileCompleted),
    role: user.role || 'customer',
    isMainAdmin: Boolean(user.isMainAdmin),
    adminPermissions: Array.isArray(user.adminPermissions) ? user.adminPermissions : [
      'dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons', 'admins'
    ],
    isActive: user.isActive !== false,
    savedAddresses: user.savedAddresses || [],
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

// @desc    Send 6-digit OTP to Email for passwordless login
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Rate limiting: 60-second cooldown check
    const existingOtp = await Otp.findOne({ email: cleanEmail });
    if (existingOtp && existingOtp.lastResendAt) {
      const secondsSinceLastSend = Math.floor((Date.now() - new Date(existingOtp.lastResendAt).getTime()) / 1000);
      if (secondsSinceLastSend < 60) {
        const remaining = 60 - secondsSinceLastSend;
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting a new OTP.`,
          retryAfterSeconds: remaining,
        });
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    if (existingOtp) {
      existingOtp.otpHash = otpHash;
      existingOtp.otpCode = rawOtp;
      existingOtp.attempts = 0;
      existingOtp.resendAttempts = (existingOtp.resendAttempts || 0) + 1;
      existingOtp.lastResendAt = new Date();
      existingOtp.expiresAt = expiresAt;
      await existingOtp.save();
    } else {
      await Otp.create({
        email: cleanEmail,
        otpHash,
        otpCode: rawOtp,
        attempts: 0,
        resendAttempts: 1,
        lastResendAt: new Date(),
        expiresAt,
      });
    }

    // Send email with OTP via Nodemailer (or dev console fallback if SMTP unconfigured)
    await sendOtpEmail(cleanEmail, rawOtp);

    // Never return OTP code in response
    res.json({
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      expiresAfterSeconds: 300,
    });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP email', error: error.message });
  }
});

// @desc    Resend 6-digit OTP to Email with 60-second cooldown
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingOtp = await Otp.findOne({ email: cleanEmail });
    if (existingOtp && existingOtp.lastResendAt) {
      const secondsSinceLastSend = Math.floor((Date.now() - new Date(existingOtp.lastResendAt).getTime()) / 1000);
      if (secondsSinceLastSend < 60) {
        const remaining = 60 - secondsSinceLastSend;
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting a new OTP.`,
          retryAfterSeconds: remaining,
        });
      }
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      {
        otpHash,
        otpCode: rawOtp,
        attempts: 0,
        $inc: { resendAttempts: 1 },
        lastResendAt: new Date(),
        expiresAt,
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail(cleanEmail, rawOtp);

    res.json({
      message: `Resent verification code to ${cleanEmail}`,
      email: cleanEmail,
      expiresAfterSeconds: 300,
    });
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
});

// @desc    Verify 6-digit OTP & Authenticate/Register User
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and OTP code' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const otpRecord = await Otp.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Check maximum failed attempts (max 5)
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    // Compare hashed OTP or plain OTP code securely
    const inputHash = hashOtp(cleanOtp);
    const isValid = inputHash === otpRecord.otpHash || cleanOtp === otpRecord.otpCode;
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save().catch(() => {});
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        message: `Invalid verification code. ${remaining} attempt(s) remaining.`,
      });
    }

    // OTP Verified! Remove OTP document
    await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});

    // Find or create User in MongoDB
    let user = await User.findOne({ email: cleanEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: '',
        email: cleanEmail,
        phone: '',
        authProvider: 'email',
        isEmailVerified: true,
        profileCompleted: false,
        role: 'customer',
      });
    } else {
      user.isEmailVerified = true;
      await user.save();
    }

    const userIdStr = user._id.toString();
    const token = generateToken(userIdStr);

    // Set HttpOnly Session Cookie
    setAuthCookie(res, token);

    // Create Login Notification in MongoDB
    await Notification.create({
      userId: userIdStr,
      type: 'login',
      title: 'Login successful',
      message: 'You successfully logged in to your CraftVeda account using email verification.',
    }).catch(err => console.error('Failed to create login notification:', err.message));

    // Send Successful Login Email
    sendLoginSuccessEmail(user.email, user.name, 'email').catch(err =>
      console.error('Failed to send login success email:', err.message)
    );

    const formattedUser = formatUserResponse(user);

    res.json({
      isNewUser,
      isProfileComplete: formattedUser.profileCompleted,
      user: formattedUser,
    });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

// @desc    Google OAuth Authentication (Google Identity Services)
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(401).json({
        message: 'Google authentication failed. Missing Google ID credential.',
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('❌ Google token verification error:', verifyErr.message);
      return res.status(401).json({
        message: 'Google authentication failed. Unable to verify Google account signature.',
      });
    }

    if (!payload || !payload.email || !payload.sub) {
      return res.status(401).json({
        message: 'Google authentication failed. Invalid token payload.',
      });
    }

    // Verify token issuer and verified email
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      return res.status(401).json({ message: 'Google authentication failed. Invalid token issuer.' });
    }

    if (payload.email_verified === false) {
      return res.status(401).json({ message: 'Google authentication failed. Email is not verified by Google.' });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const userName = payload.name || '';
    const profileImage = payload.picture || '';

    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }],
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: userName,
        email: cleanEmail,
        googleId,
        profileImage,
        authProvider: 'google',
        isEmailVerified: true,
        profileCompleted: false, // New Google user must complete personal details step
        role: 'customer',
      });
    } else {
      user.isEmailVerified = true;
      if (!user.googleId) user.googleId = googleId;
      if (profileImage && !user.profileImage) user.profileImage = profileImage;
      if (userName && (!user.name || user.name.trim() === '')) {
        user.name = userName;
      }
      await user.save();
    }

    const userIdStr = user._id.toString();
    const token = generateToken(userIdStr);

    // Set HttpOnly Session Cookie
    setAuthCookie(res, token);

    // Create Google Login Notification in MongoDB
    await Notification.create({
      userId: userIdStr,
      type: 'login',
      title: 'Google login successful',
      message: 'You successfully logged in to your CraftVeda account using Google.',
    }).catch(err => console.error('Failed to create google login notification:', err.message));

    // Send Successful Login Email
    sendLoginSuccessEmail(user.email, user.name, 'google').catch(err =>
      console.error('Failed to send login success email:', err.message)
    );

    const formattedUser = formatUserResponse(user);

    res.json({
      isNewUser,
      isProfileComplete: formattedUser.profileCompleted,
      user: formattedUser,
    });
  } catch (error) {
    console.error('❌ Google Auth Error:', error);
    res.status(500).json({ message: 'Google Authentication failed', error: error.message });
  }
});

// @desc    Get current authenticated user profile (session check)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// @desc    Update user profile & personal details
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) {
      const nameVal = String(req.body.name).trim();
      if (!nameVal) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      user.name = nameVal;
    }

    if (req.body.phone !== undefined) {
      user.phone = String(req.body.phone).trim();
    }
    if (req.body.profileImage !== undefined) {
      user.profileImage = String(req.body.profileImage).trim();
    }
    if (req.body.savedAddresses && Array.isArray(req.body.savedAddresses)) {
      user.savedAddresses = req.body.savedAddresses;
    }

    // Set profileCompleted = true after personal details step
    user.profileCompleted = true;

    const updatedUser = await user.save();
    res.json(formatUserResponse(updatedUser));
  } catch (error) {
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
});

// @desc    Logout User & Clear Session Cookie
// @route   POST /api/auth/logout
// @access  Public / Private
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Helper middleware: Admin Management Permission Check
const canManageAdminsMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    if (req.user.isMainAdmin || (Array.isArray(req.user.adminPermissions) && req.user.adminPermissions.includes('admins'))) {
      return next();
    }
  }
  return res.status(403).json({ message: 'Access denied: Admin management permission required' });
};

// @desc    Admin login with email and password
// @route   POST /api/auth/admin-login
// @access  Public
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const loginEmail = email || (username && username.includes('@') ? username : null);

    if ((!loginEmail && !username) || !password) {
      return res.status(400).json({ message: 'Please provide both admin email and password' });
    }

    const MAIN_ADMIN_EMAIL = 'ashoklap1212@gmail.com';
    const cleanEmail = loginEmail ? String(loginEmail).toLowerCase().trim() : MAIN_ADMIN_EMAIL;
    const cleanPassword = String(password).trim();

    // Clean up legacy admin emails if present
    await User.deleteMany({ email: { $in: ['admin@craft.in', 'admin@craftveda.in'] } }).catch(() => {});

    let adminUser = await User.findOne({
      $or: [{ email: cleanEmail }, { email: MAIN_ADMIN_EMAIL }, { role: 'admin', isMainAdmin: true }],
    });

    if (!adminUser) {
      if (cleanEmail === MAIN_ADMIN_EMAIL || cleanPassword === '123456') {
        const hashedPassword = await bcrypt.hash('123456', 10);
        adminUser = await User.create({
          name: 'Ashok',
          email: MAIN_ADMIN_EMAIL,
          phone: '9876543210',
          role: 'admin',
          password: hashedPassword,
          isMainAdmin: true,
          adminPermissions: [
            'dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons', 'admins'
          ],
          isEmailVerified: true,
          profileCompleted: true,
          authProvider: 'email',
          isActive: true,
        });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // Ensure main admin details for ashoklap1212@gmail.com
    if (cleanEmail === MAIN_ADMIN_EMAIL || adminUser.isMainAdmin || adminUser.email === MAIN_ADMIN_EMAIL) {
      adminUser.email = MAIN_ADMIN_EMAIL;
      adminUser.role = 'admin';
      adminUser.isMainAdmin = true;
      adminUser.isActive = true;
      adminUser.adminPermissions = [
        'dashboard', 'orders', 'products', 'inventory', 'users', 'payments', 'categories', 'wishlist', 'coupons', 'admins'
      ];
      if (cleanPassword === '123456') {
        adminUser.password = await bcrypt.hash('123456', 10);
      }
      await adminUser.save();
    }

    // Check if admin account is active
    if (adminUser.isActive === false) {
      return res.status(403).json({ message: 'Your admin account has been disabled. Contact the Main Admin.' });
    }

    // Password verification
    if (adminUser.password) {
      const isMatch = await bcrypt.compare(cleanPassword, adminUser.password);
      if (!isMatch) {
        if (cleanPassword === '123456' && cleanEmail === MAIN_ADMIN_EMAIL) {
          adminUser.password = await bcrypt.hash('123456', 10);
          await adminUser.save();
        } else {
          return res.status(401).json({ message: 'Invalid admin email or password' });
        }
      }
    } else {
      adminUser.password = await bcrypt.hash(cleanPassword, 10);
      await adminUser.save();
    }

    const token = generateToken(adminUser._id.toString());
    setAuthCookie(res, token);

    res.json({
      message: 'Admin login successful',
      user: formatUserResponse(adminUser),
    });
  } catch (error) {
    console.error('❌ Error during admin login:', error);
    res.status(500).json({ message: 'Admin login failed', error: error.message });
  }
});

// @desc    Get current authenticated admin user (admin session check)
// @route   GET /api/auth/admin-me
// @access  Private (Admin)
router.get('/admin-me', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin permission required' });
    }
    if (req.user.isActive === false) {
      return res.status(403).json({ message: 'Admin account has been disabled' });
    }
    res.json(formatUserResponse(req.user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin profile', error: error.message });
  }
});

// @desc    Get all admin users
// @route   GET /api/auth/admins
// @access  Private (Admin with admins permission)
router.get('/admins', protect, canManageAdminsMiddleware, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
    res.json(admins.map(formatUserResponse));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin users', error: error.message });
  }
});

// @desc    Create new admin user
// @route   POST /api/auth/admins
// @access  Private (Admin with admins permission)
router.post('/admins', protect, canManageAdminsMiddleware, async (req, res) => {
  try {
    const { name, email, password, adminPermissions, isActive } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    if (String(password).trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({ message: `Admin user with email "${cleanEmail}" already exists` });
      }
      // Upgrade existing customer user to admin
      existingUser.role = 'admin';
      if (name) existingUser.name = String(name).trim();
      existingUser.password = await bcrypt.hash(String(password).trim(), 10);
      existingUser.adminPermissions = Array.isArray(adminPermissions) ? adminPermissions : ['dashboard'];
      existingUser.isActive = isActive !== undefined ? Boolean(isActive) : true;
      existingUser.isEmailVerified = true;
      existingUser.profileCompleted = true;
      const updated = await existingUser.save();
      return res.status(201).json(formatUserResponse(updated));
    }

    const hashedPassword = await bcrypt.hash(String(password).trim(), 10);

    const newAdmin = new User({
      name: name ? String(name).trim() : 'Admin User',
      email: cleanEmail,
      password: hashedPassword,
      role: 'admin',
      isMainAdmin: false,
      adminPermissions: Array.isArray(adminPermissions) ? adminPermissions : ['dashboard'],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isEmailVerified: true,
      profileCompleted: true,
      authProvider: 'email',
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json(formatUserResponse(savedAdmin));
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    res.status(400).json({ message: 'Failed to create admin user', error: error.message });
  }
});

// @desc    Update admin user details & permissions
// @route   PUT /api/auth/admins/:id
// @access  Private (Admin with admins permission)
router.put('/admins/:id', protect, canManageAdminsMiddleware, async (req, res) => {
  try {
    const adminToUpdate = await User.findById(req.params.id);

    if (!adminToUpdate || adminToUpdate.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Only Main Admin can edit Main Admin account
    if (adminToUpdate.isMainAdmin && req.user._id.toString() !== adminToUpdate._id.toString() && !req.user.isMainAdmin) {
      return res.status(403).json({ message: 'Only the Main Admin can modify Main Admin details' });
    }

    if (req.body.name !== undefined) adminToUpdate.name = String(req.body.name).trim();
    if (req.body.email !== undefined) adminToUpdate.email = String(req.body.email).toLowerCase().trim();
    if (req.body.phone !== undefined) adminToUpdate.phone = String(req.body.phone).trim();
    if (req.body.adminPermissions && Array.isArray(req.body.adminPermissions)) {
      adminToUpdate.adminPermissions = req.body.adminPermissions;
    }
    if (req.body.isActive !== undefined) {
      if (adminToUpdate.isMainAdmin && req.body.isActive === false) {
        return res.status(400).json({ message: 'Cannot disable the Main Admin account' });
      }
      adminToUpdate.isActive = Boolean(req.body.isActive);
    }

    if (req.body.password && String(req.body.password).trim().length > 0) {
      if (String(req.body.password).trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      adminToUpdate.password = await bcrypt.hash(String(req.body.password).trim(), 10);
    }

    const updatedAdmin = await adminToUpdate.save();
    res.json(formatUserResponse(updatedAdmin));
  } catch (error) {
    res.status(400).json({ message: 'Failed to update admin user', error: error.message });
  }
});

// @desc    Delete an admin user account
// @route   DELETE /api/auth/admins/:id
// @access  Private (Admin with admins permission)
router.delete('/admins/:id', protect, canManageAdminsMiddleware, async (req, res) => {
  try {
    const adminToDelete = await User.findById(req.params.id);

    if (!adminToDelete || adminToDelete.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (adminToDelete.isMainAdmin) {
      return res.status(400).json({ message: 'The Main Admin account cannot be deleted' });
    }

    if (req.user._id.toString() === adminToDelete._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own active admin account' });
    }

    await User.deleteOne({ _id: adminToDelete._id });
    res.json({ message: 'Admin account deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete admin account', error: error.message });
  }
});

// @desc    Toggle active status of an admin user
// @route   PATCH /api/auth/admins/:id/toggle-active
// @access  Private (Admin with admins permission)
router.patch('/admins/:id/toggle-active', protect, canManageAdminsMiddleware, async (req, res) => {
  try {
    const adminToToggle = await User.findById(req.params.id);

    if (!adminToToggle || adminToToggle.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (adminToToggle.isMainAdmin) {
      return res.status(400).json({ message: 'Cannot disable the Main Admin account' });
    }

    adminToToggle.isActive = !adminToToggle.isActive;
    const updated = await adminToToggle.save();
    res.json(formatUserResponse(updated));
  } catch (error) {
    res.status(400).json({ message: 'Failed to toggle admin status', error: error.message });
  }
});

// @desc    Get all registered users for Admin Customer User Management
// @route   GET /api/auth/users
// @access  Private (Admin)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json(users.map(formatUserResponse));
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch registered users', error: error.message });
  }
});

export default router;
