const express = require('express');
const { body } = require('express-validator');
const {
  addReview,
  getProductReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router({ mergeParams: true });

const reviewValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

router
  .route('/')
  .get(getProductReviews)
  .post(protect, reviewValidation, validateRequest, addReview);

router.delete('/:id', protect, deleteReview);

module.exports = router;
