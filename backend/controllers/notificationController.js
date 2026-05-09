const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(20);
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};
