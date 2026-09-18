const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get products with search, filtering, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      featured,
      inStock,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Text Search
    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { brand: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    // Category Filter (ID or Slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          query.category = catDoc._id;
        }
      }
    }

    // Price Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (rating) {
      query.ratings = { $gte: Number(rating) };
    }

    // Featured Filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // In-Stock Filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { ratings: -1, numReviews: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOptions = { numReviews: -1 };
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNumber - 1) * pageSize;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:identifier
 * @access  Public
 */
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = identifier.match(/^[0-9a-fA-F]{24}$/);

    const product = isId
      ? await Product.findById(identifier).populate('category', 'name slug')
      : await Product.findOne({ slug: identifier }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product with image uploads
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      isFeatured,
      tags,
      imageUrl
    } = req.body;

    const images = [];

    // Process uploaded files if present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, 'ecommerce_products');
        images.push({
          url: uploadResult.url,
          public_id: uploadResult.public_id
        });
      }
    } else if (imageUrl) {
      // Support direct image URL
      images.push({
        url: imageUrl,
        public_id: `url_${Date.now()}`
      });
    } else {
      // Default high quality placeholder
      images.push({
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        public_id: 'default_product'
      });
    }

    const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      stock: Number(stock) || 0,
      brand: brand || 'Aura Premium',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      tags: parsedTags || [],
      images
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details and/or images
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      isFeatured,
      tags,
      imageUrl
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (brand) product.brand = brand;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (tags) {
      product.tags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
    }

    // Process new image uploads if supplied
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, 'ecommerce_products');
        newImages.push({
          url: uploadResult.url,
          public_id: uploadResult.public_id
        });
      }
      product.images = [...product.images, ...newImages];
    } else if (imageUrl) {
      product.images.push({
        url: imageUrl,
        public_id: `url_${Date.now()}`
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product and associated images
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary in background
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          deleteFromCloudinary(img.public_id).catch((e) =>
            console.error('Failed to delete image:', e.message)
          );
        }
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
};
