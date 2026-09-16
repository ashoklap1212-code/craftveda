import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { protect, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public / Protected
router.post('/', async (req, res) => {
  try {
    const { 
      items, shippingAddress, subtotal, deliveryCharge, 
      discountAmount, couponCode, totalAmount, payment, userId 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobileNumber) {
      return res.status(400).json({ message: 'Shipping address details are incomplete' });
    }

    const orderNum = `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const newOrder = new Order({
      orderNumber: orderNum,
      userId: userId || (req.user ? req.user.id : 'guest-user'),
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email,
      customerPhone: shippingAddress.mobileNumber,
      items,
      shippingAddress,
      subtotal,
      deliveryCharge: deliveryCharge || 0,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || '',
      totalAmount,
      currentStatus: 'Order Placed',
      statusTimeline: [
        { status: 'Order Placed', timestamp: nowStr, completed: true, notes: 'Order placed successfully' },
        { status: 'Payment Confirmed', timestamp: nowStr, completed: true, notes: `Payment confirmed via ${payment?.paymentMethod || 'UPI'}` },
        { status: 'Order Processing', timestamp: '', completed: false },
        { status: 'Packed', timestamp: '', completed: false },
        { status: 'Shipped', timestamp: '', completed: false },
        { status: 'Out for Delivery', timestamp: '', completed: false },
        { status: 'Delivered', timestamp: '', completed: false },
      ],
      payment: payment || {
        paymentMethod: 'UPI',
        transactionId: `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'SUCCESS',
        amount: totalAmount,
        upiHandle: 'customer@upi',
        timestamp: nowStr,
      },
    });

    const createdOrder = await newOrder.save();

    // Deduct stock for ordered products asynchronously
    for (const item of items) {
      try {
        const prod = await Product.findById(item.productId);
        if (prod) {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
          prod.inStock = prod.stockQuantity > 0;
          await prod.save();
        }
      } catch (err) {
        console.error(`Failed to update stock for product ${item.productId}:`, err.message);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
});

// @desc    Get all orders (Admin / Seller) or query by userId
// @route   GET /api/orders
// @access  Public / Protected
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// @desc    Get current user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
});

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Public / Protected
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// @desc    Update order status timeline (Admin / Seller)
// @route   PUT /api/orders/:id/status
// @access  Public / Protected
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    order.currentStatus = status;
    order.statusTimeline = order.statusTimeline.map(step => {
      if (step.status === status) {
        return {
          ...step,
          completed: true,
          timestamp: nowStr,
          notes: notes || step.notes || `Updated to ${status}`,
        };
      }
      return step;
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order status', error: error.message });
  }
});

export default router;
