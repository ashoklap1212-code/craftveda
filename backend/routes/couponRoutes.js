import express from 'express';
import { Coupon } from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seed initial coupons if none exist
const seedDefaultCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.create([
        {
          code: 'CRAFT10',
          description: '10% OFF on all traditional Indian handicrafts',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 499,
          isActive: true,
        },
        {
          code: 'WELCOME200',
          description: 'Flat ₹200 OFF for new customers',
          discountType: 'fixed',
          discountValue: 200,
          minOrderAmount: 999,
          isActive: true,
        },
        {
          code: 'FESTIVE15',
          description: '15% OFF on heritage terracotta & clay collections',
          discountType: 'percentage',
          discountValue: 15,
          minOrderAmount: 1499,
          isActive: true,
        },
      ]);
      console.log('✅ Initial default coupons seeded into MongoDB Atlas!');
    }
  } catch (err) {
    console.error('Failed to seed default coupons:', err.message);
  }
};
seedDefaultCoupons();

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
});

// @desc    Validate coupon code for customer checkout
// @route   POST /api/coupons/validate
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Please provide a coupon code' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ valid: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ valid: false, message: 'This coupon code has expired' });
    }

    const orderAmount = Number(subtotal) || 0;

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for code ${cleanCode}`,
      });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: `Coupon code ${coupon.code} applied successfully! 🎉`,
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Coupon validation failed', error: error.message });
  }
});

// @desc    Create new discount coupon
// @route   POST /api/coupons
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscountAmount, usageLimit, expiryDate, isActive
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ message: 'Coupon code and discount value are required' });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon code ${cleanCode} already exists` });
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      usageLimit: Number(usageLimit) || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create coupon', error: error.message });
  }
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (req.body.code) coupon.code = String(req.body.code).trim().toUpperCase();
    if (req.body.description !== undefined) coupon.description = req.body.description;
    if (req.body.discountType) coupon.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) coupon.discountValue = Number(req.body.discountValue);
    if (req.body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(req.body.maxDiscountAmount);
    if (req.body.usageLimit !== undefined) coupon.usageLimit = Number(req.body.usageLimit);
    if (req.body.expiryDate !== undefined) coupon.expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : undefined;
    if (req.body.isActive !== undefined) coupon.isActive = Boolean(req.body.isActive);

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update coupon', error: error.message });
  }
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ message: 'Coupon deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
});

export default router;
