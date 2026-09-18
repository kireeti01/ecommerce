import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  Tag,
  CheckCircle2
} from 'lucide-react';
import StarRating from '../components/common/StarRating';
import { addToGuestCart, setCart } from '../store/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { identifier } = useParams();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review form states
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        const { data: prodData } = await api.get(`/products/${identifier}`);
        setProduct(prodData.product);

        // Fetch product reviews
        if (prodData.product?._id) {
          const { data: revData } = await api.get(`/products/${prodData.product._id}/reviews`);
          setReviews(revData.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading product craftsmanship...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500">The product you are looking for does not exist or has been retired.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const {
    _id,
    name,
    description,
    price,
    discountPrice,
    images = [],
    stock = 0,
    ratings = 0,
    numReviews = 0,
    brand = 'Aura Premium',
    category,
    tags = []
  } = product;

  const hasDiscount = discountPrice && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const effectivePrice = hasDiscount ? discountPrice : price;

  const handleAddToCart = async () => {
    if (stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    if (isAuthenticated) {
      try {
        const { data } = await api.post('/cart/add', {
          productId: _id,
          quantity
        });
        dispatch(setCart(data.cart));
        toast.success(`Added ${quantity} item(s) to cart`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add item to cart');
      }
    } else {
      dispatch(
        addToGuestCart({
          product,
          quantity
        })
      );
      toast.success(`Added ${quantity} item(s) to cart`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const { data } = await api.post(`/products/${_id}/reviews`, {
        rating: ratingInput,
        comment: commentInput
      });

      setReviews([data.review, ...reviews]);
      setCommentInput('');
      setRatingInput(5);
      toast.success('Thank you! Your review was submitted successfully.');

      // Refresh product data for updated average ratings
      const { data: updatedProd } = await api.get(`/products/${_id}`);
      setProduct(updatedProd.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img
              src={
                images[selectedImageIndex]?.url ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
              }
              alt={name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 scale-95 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {brand}
              </span>
              {category && (
                <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {name}
            </h1>

            <div className="mt-3 flex items-center space-x-3">
              <StarRating rating={ratings} numReviews={numReviews} size="w-4 h-4" />
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Stock</span>
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 pb-4 border-b border-slate-200">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              ${effectivePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  ${price.toFixed(2)}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded-full">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {description}
          </p>

          {/* Stock & Quantity Controller */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Availability:</span>
              <span
                className={`font-bold ${
                  stock > 5
                    ? 'text-emerald-600'
                    : stock > 0
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {stock > 5
                  ? `In Stock (${stock} units)`
                  : stock > 0
                  ? `Low Stock - Only ${stock} units remaining`
                  : 'Currently Out of Stock'}
              </span>
            </div>

            {stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                    disabled={quantity >= stock}
                    className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart CTA */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className={`flex-1 py-4 px-8 rounded-xl font-bold text-base flex items-center justify-center space-x-3 transition-all shadow-lg ${
                stock > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-slate-600 text-xs">
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <Truck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="font-semibold text-slate-800">Free Delivery</span>
              <span className="text-[10px] text-slate-400">On orders over $100</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="font-semibold text-slate-800">Authenticity</span>
              <span className="text-[10px] text-slate-400">Direct from studio</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
              <RefreshCw className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="font-semibold text-slate-800">30-Day Returns</span>
              <span className="text-[10px] text-slate-400">Hassle-free guarantee</span>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="pt-2 flex items-center space-x-2 flex-wrap gap-1.5">
              <Tag className="w-4 h-4 text-slate-400" />
              {tags.map((t, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-12 border-t border-slate-200 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Customer Feedback ({reviews.length})
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read authentic evaluations from verified collectors.
            </p>
          </div>
        </div>

        {/* Review Submission Form */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {isAuthenticated ? 'Leave a Verified Review' : 'Sign in to write a review'}
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Your Overall Rating:
                </label>
                <StarRating
                  rating={ratingInput}
                  interactive={true}
                  onRatingChange={(r) => setRatingInput(r)}
                  size="w-6 h-6"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Your Thoughts & Observations:
                </label>
                <textarea
                  rows="3"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share details of your experience with materials, build quality, and usability..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="flex items-center space-x-4">
              <p className="text-sm text-slate-600">
                You must be authenticated with an account to share feedback.
              </p>
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                      alt={rev.user?.name || 'Customer'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {rev.user?.name || 'Aura Customer'}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} size="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-slate-600 pt-1 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
