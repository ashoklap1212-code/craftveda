import express from 'express';
import { Notification } from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// @desc    Get authenticated user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notification = await Notification.findOne({ _id: req.params.id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    res.status(400).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// @desc    Mark all notifications for authenticated user as read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch('/read-all', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    const updatedNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(updatedNotifications);
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
});

export default router;
