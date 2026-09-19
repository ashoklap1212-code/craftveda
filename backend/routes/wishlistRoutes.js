import express from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { protect, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all wishlists for Admin Management (Admin / Seller)
// @route   GET /api/wishlist/admin
// @access  Public / Admin
router.get('/admin', async (req, res) => {
  try {
    const wishlists = await Wishlist.find().sort({ updatedAt: -1 });

    const adminWishlistData = await Promise.all(
      wishlists.map(async (w) => {
        let user = null;
        if (w.userId && w.userId !== 'guest-user') {
          try {
            user = await User.findById(w.userId).select('name email phone');
          } catch (e) {
            user = await User.findOne({ email: w.userId });
          }
        }

        const products = await Product.find({ _id: { $in: w.productIds } });

        return {
          id: w.id || w._id,
          _id: w._id,
          userId: w.userId,
          userName: user ? (user.name || 'Registered Customer') : (w.userId.includes('@') ? w.userId : 'Craft Patron'),
          userEmail: user ? user.email : (w.userId.includes('@') ? w.userId : 'N/A'),
          productCount: w.productIds.length,
          productIds: w.productIds,
          products: products.map(p => ({
            id: p.id || p._id,
            name: p.name,
            price: p.price,
            image: p.images && p.images.length > 0 ? p.images[0] : '',
            categoryName: p.categoryName || '',
          })),
          updatedAt: w.updatedAt || new Date().toISOString(),
        };
      })
    );

    res.json(adminWishlistData);
  } catch (error) {
    console.error('❌ Error fetching admin wishlists:', error);
    res.status(500).json({ message: 'Failed to fetch admin wishlists', error: error.message });
  }
});

// @desc    Get user wishlist product IDs
// @route   GET /api/wishlist or GET /api/wishlist/:userId
// @access  Public / Protected
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || (req.user ? req.user.id : 'guest-user');
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
});

// @desc    Toggle item in user wishlist
// @route   POST /api/wishlist/toggle
// @access  Public / Protected
router.post('/toggle', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const targetUserId = userId || (req.user ? req.user.id : 'guest-user');

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required to toggle wishlist' });
    }

    let wishlist = await Wishlist.findOne({ userId: targetUserId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: targetUserId, productIds: [productId] });
    } else {
      const exists = wishlist.productIds.includes(productId);
      if (exists) {
        wishlist.productIds = wishlist.productIds.filter(id => id !== productId);
      } else {
        wishlist.productIds.push(productId);
      }
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ message: 'Failed to toggle wishlist item', error: error.message });
  }
});

export default router;
