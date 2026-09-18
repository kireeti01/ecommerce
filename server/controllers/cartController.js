const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Helper to ensure cart exists and populate product details
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock ratings brand'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} unit(s) available.`
      });
    }

    const itemPrice =
      product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    let cart = await getOrCreateCart(req.user._id);

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (product.stock < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Total in cart would exceed available stock (${product.stock}).`
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        price: itemPrice
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock ratings brand'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/item/:productId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (qty <= 0) {
      // Remove item if quantity is zero or less
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product no longer exists'
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      cart.items[itemIndex].quantity = qty;
      cart.items[itemIndex].price =
        product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock ratings brand'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/item/:productId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock ratings brand'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: { user: req.user._id, items: [], totalAmount: 0 }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge guest cart items upon user login
 * @route   POST /api/cart/sync
 * @access  Private
 */
const syncGuestCart = async (req, res, next) => {
  try {
    const { guestItems = [] } = req.body;

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      const existingCart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'name slug price discountPrice images stock ratings brand'
      });
      return res.status(200).json({
        success: true,
        cart: existingCart || { user: req.user._id, items: [], totalAmount: 0 }
      });
    }

    let cart = await getOrCreateCart(req.user._id);

    for (const guestItem of guestItems) {
      const product = await Product.findById(guestItem.productId || guestItem._id);
      if (!product || product.stock <= 0) continue;

      const itemPrice =
        product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
      );

      const addQty = Math.min(guestItem.quantity || 1, product.stock);

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          cart.items[existingIndex].quantity + addQty,
          product.stock
        );
        cart.items[existingIndex].price = itemPrice;
      } else {
        cart.items.push({
          product: product._id,
          quantity: addQty,
          price: itemPrice
        });
      }
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock ratings brand'
    });

    res.status(200).json({
      success: true,
      message: 'Cart synced successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncGuestCart
};
