import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowRight, ShoppingBag, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import CartItem from '../components/cart/CartItem';
import EmptyState from '../components/common/EmptyState';
import {
  setCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearCart
} from '../store/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleUpdateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.put(`/cart/item/${productId}`, { quantity });
        dispatch(setCart(data.cart));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update item');
      }
    } else {
      dispatch(updateGuestQuantity({ productId, quantity }));
    }
  };

  const handleRemoveItem = async (productId) => {
    if (isAuthenticated) {
      try {
        const { data } = await api.delete(`/cart/item/${productId}`);
        dispatch(setCart(data.cart));
        toast.success('Item removed from cart');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove item');
      }
    } else {
      dispatch(removeFromGuestCart(productId));
      toast.success('Item removed from cart');
    }
  };

  const handleClearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        dispatch(clearCart());
        toast.success('Cart cleared');
      } catch (err) {
        toast.error('Failed to clear cart');
      }
    } else {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="It looks like you haven't added any crafted artifacts to your bag yet."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - itemsPrice);
  const progressPercent = Math.min(100, (itemsPrice / freeShippingThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your selections before proceeding to checkout.
          </p>
        </div>

        <button
          onClick={handleClearCart}
          className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Bag</span>
        </button>
      </div>

      {/* Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <CartItem
              key={item.product?._id || item.productId || index}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Browsing Products</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 sticky top-28">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Free Shipping Progress Bar */}
            <div className="space-y-2 bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100/80">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-900">
                  {remainingForFreeShipping === 0
                    ? '🎉 You unlocked FREE Shipping!'
                    : `Add $${remainingForFreeShipping.toFixed(2)} for FREE delivery`}
                </span>
                <span className="text-indigo-600">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-slate-900">${itemsPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-600 uppercase text-xs font-bold">Free</span>
                  ) : (
                    `$${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${taxPrice.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-xl text-indigo-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm shadow-md shadow-slate-900/10 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
