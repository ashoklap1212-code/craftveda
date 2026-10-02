import express from 'express';
import { OrderCharges } from '../models/OrderCharges.js';
import { protect, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get current order charges configuration
// @route   GET /api/order-charges
// @access  Public (needed for cart/checkout calculation)
router.get('/', async (req, res) => {
  try {
    let charges = await OrderCharges.findOne();
    if (!charges) {
      // Create default charges document if none exists
      charges = await OrderCharges.create({
        shippingFee: 99,
        packagingFee: 0,
        freeShippingThreshold: 1499,
        safeFragileShippingLabel: 'Safe Fragile Shipping',
        isFreeShippingEnabled: true,
      });
    }
    res.json(charges);
  } catch (error) {
    console.error('❌ Error fetching order charges:', error);
    res.status(500).json({ message: 'Failed to fetch order charges', error: error.message });
  }
});

// @desc    Update order charges (Admin only)
// @route   PUT /api/order-charges
// @access  Private (Admin only)
router.put('/', protect, adminOrSeller, async (req, res) => {
  try {
    const {
      shippingFee,
      packagingFee,
      freeShippingThreshold,
      safeFragileShippingLabel,
      isFreeShippingEnabled,
    } = req.body;

    // Validate numeric values
    if (shippingFee !== undefined && (isNaN(shippingFee) || shippingFee < 0)) {
      return res.status(400).json({ message: 'Shipping fee must be a non-negative number' });
    }
    if (packagingFee !== undefined && (isNaN(packagingFee) || packagingFee < 0)) {
      return res.status(400).json({ message: 'Packaging fee must be a non-negative number' });
    }
    if (freeShippingThreshold !== undefined && (isNaN(freeShippingThreshold) || freeShippingThreshold < 0)) {
      return res.status(400).json({ message: 'Free shipping threshold must be a non-negative number' });
    }

    const updateData = {
      updatedBy: req.user.email || req.user.name || 'admin',
    };

    if (shippingFee !== undefined) updateData.shippingFee = Number(shippingFee);
    if (packagingFee !== undefined) updateData.packagingFee = Number(packagingFee);
    if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = Number(freeShippingThreshold);
    if (safeFragileShippingLabel !== undefined) updateData.safeFragileShippingLabel = safeFragileShippingLabel;
    if (isFreeShippingEnabled !== undefined) updateData.isFreeShippingEnabled = Boolean(isFreeShippingEnabled);

    // Upsert - create if doesn't exist, update if does
    const updated = await OrderCharges.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating order charges:', error);
    res.status(400).json({ message: 'Failed to update order charges', error: error.message });
  }
});

export default router;
