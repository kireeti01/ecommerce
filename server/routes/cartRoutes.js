const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncGuestCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/add', addToCart);
router.post('/sync', syncGuestCart);
router
  .route('/item/:productId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
