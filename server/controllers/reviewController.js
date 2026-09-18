const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * @desc    Add review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product'
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ product: productId });
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getProductReviews,
  deleteReview
};
