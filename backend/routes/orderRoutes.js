import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Notification } from '../models/Notification.js';
import { protect, adminOrSeller, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Authenticated users only)
router.post('/', protect, async (req, res) => {
  try {
    const { 
      items, shippingAddress, subtotal, deliveryCharge, 
      discountAmount, couponCode, totalAmount, payment 
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobileNumber) {
      return res.status(400).json({ message: 'Shipping address details are incomplete' });
    }

    // Authenticated user ID MUST be used (never trust userId supplied from frontend body)
    const authenticatedUserId = req.user._id.toString();

    // Validate products and stock
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid product item format' });
      }
      const prod = await Product.findById(item.productId);
      if (!prod) {
        return res.status(400).json({ message: `Product not found: ${item.productName || item.productId}` });
      }
    }

    const orderNum = `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const newOrder = new Order({
      orderNumber: orderNum,
      userId: authenticatedUserId,
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email || req.user.email,
      customerPhone: shippingAddress.mobileNumber,
      items,
      shippingAddress: {
        ...shippingAddress,
        email: shippingAddress.email || req.user.email || 'customer@craftveda.in',
      },
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

    // Deduct stock safely for ordered products
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

    // Create Order Notification in MongoDB
    await Notification.create({
      userId: authenticatedUserId,
      type: 'order',
      title: 'Order confirmed',
      message: `Your order #${createdOrder.orderNumber} has been confirmed. Total: ₹${createdOrder.totalAmount.toLocaleString('en-IN')}`,
    }).catch(err => console.error('Failed to create order notification:', err.message));

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
});

// @desc    Get current logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
});

// @desc    Get orders (Admin sees all, Customer sees ONLY their own orders)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      if (req.query.userId) query.userId = req.query.userId;
    } else {
      query.userId = req.user._id.toString();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customer can only view their own order
    if (req.user.role !== 'admin' && req.user.role !== 'seller' && order.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot view another user\'s order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// @desc    Update order status timeline (Admin / Seller)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin / Seller)
router.put('/:id/status', protect, adminOrSeller, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const standardSequence = [
      'Order Placed',
      'Payment Confirmed',
      'Order Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    order.currentStatus = status;

    if (status === 'Cancelled') {
      const exists = order.statusTimeline.some(step => step.status === 'Cancelled');
      if (!exists) {
        order.statusTimeline.push({
          status: 'Cancelled',
          timestamp: nowStr,
          completed: true,
          notes: notes || 'Order cancelled',
        });
      } else {
        order.statusTimeline = order.statusTimeline.map(step =>
          step.status === 'Cancelled'
            ? { ...step, completed: true, timestamp: nowStr, notes: notes || step.notes || 'Order cancelled' }
            : step
        );
      }
    } else {
      const targetIndex = standardSequence.indexOf(status);
      order.statusTimeline = order.statusTimeline.map(step => {
        const stepIndex = standardSequence.indexOf(step.status);
        if (stepIndex !== -1 && targetIndex !== -1 && stepIndex <= targetIndex) {
          return {
            ...step,
            completed: true,
            timestamp: step.timestamp || nowStr,
            notes: step.status === status ? (notes || step.notes || `Updated to ${status}`) : step.notes,
          };
        }
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
    }

    const updatedOrder = await order.save();

    // Notify customer about status update in MongoDB
    if (order.userId) {
      await Notification.create({
        userId: order.userId,
        type: 'order',
        title: `Order Status: ${status}`,
        message: `Your order #${order.orderNumber} status is now: ${status}.`,
      }).catch(err => console.error('Failed to send status update notification:', err.message));
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(400).json({ message: 'Failed to update order status', error: error.message });
  }
});

export default router;
