import { createSlice } from '@reduxjs/toolkit';

// Retrieve guest cart from localStorage if available
const loadGuestCart = () => {
  try {
    const saved = localStorage.getItem('aura_guest_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const calculateTotals = (items) => {
  const itemsPrice = items.reduce((acc, item) => {
    const unitPrice = item.price || item.product?.effectivePrice || item.product?.price || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  const roundedItemsPrice = Math.round(itemsPrice * 100) / 100;
  const shippingPrice = roundedItemsPrice > 100 || roundedItemsPrice === 0 ? 0 : 15;
  const taxPrice = Math.round(roundedItemsPrice * 0.08 * 100) / 100;
  const totalPrice = Math.round((roundedItemsPrice + shippingPrice + taxPrice) * 100) / 100;

  return {
    itemsPrice: roundedItemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  };
};

const initialGuestItems = loadGuestCart();
const initialTotals = calculateTotals(initialGuestItems);

const initialState = {
  items: initialGuestItems,
  ...initialTotals,
  shippingAddress: JSON.parse(localStorage.getItem('aura_shipping_address') || '{}'),
  paymentMethod: 'Card',
  loading: false
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set cart from DB
    setCart: (state, action) => {
      const { items = [] } = action.payload || {};
      state.items = items;
      const totals = calculateTotals(items);
      state.itemsPrice = totals.itemsPrice;
      state.shippingPrice = totals.shippingPrice;
      state.taxPrice = totals.taxPrice;
      state.totalPrice = totals.totalPrice;
      // When logged in, clear guest cart
      localStorage.removeItem('aura_guest_cart');
    },

    // Guest add to cart
    addToGuestCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => (item.product?._id || item.product) === product._id
      );

      const unitPrice =
        product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          price: unitPrice
        });
      }

      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      localStorage.setItem('aura_guest_cart', JSON.stringify(state.items));
    },

    // Update guest quantity
    updateGuestQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(
        (item) => (item.product?._id || item.product) === productId
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
      }

      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      localStorage.setItem('aura_guest_cart', JSON.stringify(state.items));
    },

    // Remove from guest cart
    removeFromGuestCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => (item.product?._id || item.product) !== productId
      );

      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      localStorage.setItem('aura_guest_cart', JSON.stringify(state.items));
    },

    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      localStorage.removeItem('aura_guest_cart');
    },

    // Save shipping address
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('aura_shipping_address', JSON.stringify(action.payload));
    },

    // Save payment method
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    }
  }
});

export const {
  setCart,
  addToGuestCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearCart,
  saveShippingAddress,
  savePaymentMethod
} = cartSlice.actions;

export default cartSlice.reducer;
