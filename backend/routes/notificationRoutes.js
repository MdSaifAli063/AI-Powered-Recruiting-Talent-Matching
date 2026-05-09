const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/', notificationController.deleteAllNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
