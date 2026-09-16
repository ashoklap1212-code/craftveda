import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Protect routes: Requires valid JWT token in Authorization header
 * Example: Authorization: Bearer <jwt_token>
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'craftveda_secret_jwt_key_2026_secure');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};

/**
 * Authorize Admin or Seller role
 */
export const adminOrSeller = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin or Seller role required' });
  }
};

/**
 * Authorize Admin role only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin permission required' });
  }
};
