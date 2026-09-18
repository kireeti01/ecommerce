const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router
  .route('/')
  .post(createOrder)
  .get(authorize('admin'), getAllOrders);

router.get('/my-orders', getMyOrders);
router.get('/stats/summary', authorize('admin'), getAdminStats);

router
  .route('/:id')
  .get(getOrderById);

router
  .route('/:id/status')
  .put(authorize('admin'), updateOrderStatus);

module.exports = router;
