import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import StarRating from '../common/StarRating';
import { addToGuestCart, setCart } from '../../store/slices/cartSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!product) return null;

  const {
    _id,
    name,
    slug,
    price,
    discountPrice,
    images = [],
    ratings = 0,
    numReviews = 0,
    brand = 'Aura Premium',
    stock = 0,
    isFeatured
  } = product;

  const imageUrl =
    images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const hasDiscount = discountPrice && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const effectivePrice = hasDiscount ? discountPrice : price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      toast.error('Item is currently out of stock');
      return;
    }

    if (isAuthenticated) {
      try {
        const { data } = await api.post('/cart/add', {
          productId: _id,
          quantity: 1
        });
        dispatch(setCart(data.cart));
        toast.success(`Added ${name} to cart`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add item to cart');
      }
    } else {
      // Add to guest cart
      dispatch(
        addToGuestCart({
          product,
          quantity: 1
        })
      );
      toast.success(`Added ${name} to cart`);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          <Link to={`/products/${slug || _id}`} className="block w-full h-full">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-rose-500 text-white rounded-full shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
            {isFeatured && (
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full shadow-sm">
                Featured
              </span>
            )}
            {stock <= 5 && stock > 0 && (
              <span className="px-2.5 py-1 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full">
                Only {stock} left
              </span>
            )}
            {stock <= 0 && (
              <span className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 text-white rounded-full">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick Action Overlay (Desktop) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              to={`/products/${slug || _id}`}
              className="p-2.5 bg-white/90 backdrop-blur-xs text-slate-700 hover:text-indigo-600 rounded-full shadow-md hover:scale-110 transition-all"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            {brand}
          </p>

          <Link to={`/products/${slug || _id}`}>
            <h3 className="text-sm font-bold text-slate-800 hover:text-indigo-600 line-clamp-2 mb-2 transition-colors">
              {name}
            </h3>
          </Link>

          <div className="mb-3">
            <StarRating rating={ratings} numReviews={numReviews} size="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-slate-900">
            ${effectivePrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ${price.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`p-2.5 rounded-xl font-medium flex items-center justify-center transition-all ${
            stock > 0
              ? 'bg-slate-900 hover:bg-indigo-600 text-white shadow-sm hover:shadow-indigo-500/20 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
