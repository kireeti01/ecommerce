const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'Card',
      paymentDetails = {}
    } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address (street, city, state, postal code).'
      });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Cannot place an order.'
      });
    }

    const orderItems = [];
    let itemsPrice = 0;

    // Validate stock and prepare snapshot items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `A product in your cart is no longer available.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        });
      }

      const activePrice =
        product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: activePrice,
        image: product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
      });

      itemsPrice += activePrice * item.quantity;
    }

    // Calculate tax & shipping
    const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100; // 8% sales tax
    const shippingPrice = itemsPrice > 100 ? 0 : 15; // Free shipping above $100
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    // Determine payment status (auto-complete mock card payments)
    const isMockCompleted = paymentMethod === 'Card' || paymentMethod === 'Stripe';
    const paymentStatus = isMockCompleted ? 'completed' : 'pending';

    // Create the Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        transactionId: paymentDetails.transactionId || `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        paidAt: isMockCompleted ? new Date() : null
      },
      orderStatus: 'processing',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    // Reduce product stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'slug brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership or admin privileges
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this order.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order updated to ${order.orderStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard analytics summary
 * @route   GET /api/orders/stats/summary
 * @access  Private/Admin
 */
const getAdminStats = async (req, res, next) => {
  try {
    // Total Revenue & Total Orders
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalOrdersCount = await Order.countDocuments();
    const totalUsersCount = await User.countDocuments({ role: 'user' });
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

    // Top 5 products by quantity sold
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalSalesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 }
    ]);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        completedOrdersCount: revenueStats[0]?.totalOrders || 0,
        totalOrdersCount,
        totalUsersCount,
        lowStockCount,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
};
