import express from 'express';
import { Wishlist } from '../models/Wishlist.js';

const router = express.Router();

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
