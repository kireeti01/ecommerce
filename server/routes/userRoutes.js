const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  getAllUsers,
  updateUserRole
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// User profile routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// User address routes
router
  .route('/address')
  .post(protect, addAddress);

router
  .route('/address/:addressId')
  .delete(protect, deleteAddress);

// Admin-only user management routes
router
  .route('/')
  .get(protect, authorize('admin'), getAllUsers);

router
  .route('/:id/role')
  .put(protect, authorize('admin'), updateUserRole);

module.exports = router;
