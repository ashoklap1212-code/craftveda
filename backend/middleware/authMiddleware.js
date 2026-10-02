import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Helper to extract JWT token from cookies or Authorization header
 */
const extractToken = (req) => {
  if (req.cookies && req.cookies.craftveda_session) {
    return req.cookies.craftveda_session;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * Protect routes: Requires valid JWT token in HttpOnly cookie or Authorization header
 */
export const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'craftveda_secret_jwt_key_2026_secure'
    );

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account no longer exists or is inactive' });
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

/**
 * Optional Auth: Attaches req.user if valid JWT is present, without failing if absent
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'craftveda_secret_jwt_key_2026_secure'
      );
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token verification errors for optional auth
    }
  }

  next();
};
