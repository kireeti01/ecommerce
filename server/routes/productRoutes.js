const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const upload = require('../middleware/uploadMiddleware');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRoutes);

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category ID is required')
];

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('admin'),
    upload.array('images', 5),
    productValidation,
    validateRequest,
    createProduct
  );

router.get('/featured', getFeaturedProducts);

router
  .route('/:identifier')
  .get(getProductByIdOrSlug);

router
  .route('/:id')
  .put(
    protect,
    authorize('admin'),
    upload.array('images', 5),
    updateProduct
  )
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
