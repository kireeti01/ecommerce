const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @desc    Get all categories with product count
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).populate('parentCategory', 'name slug');

    // Aggregate product counts per category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:identifier
 * @access  Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = identifier.match(/^[0-9a-fA-F]{24}$/);

    const category = isId
      ? await Category.findById(identifier).populate('parentCategory', 'name slug')
      : await Category.findOne({ slug: identifier }).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      parentCategory: parentCategory || null
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image || category.image;
    category.parentCategory = parentCategory !== undefined ? (parentCategory || null) : category.parentCategory;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any product references this category
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${productsCount} product(s) linked to it.`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
