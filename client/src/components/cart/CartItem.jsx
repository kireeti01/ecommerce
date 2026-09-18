import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  if (!item) return null;

  const product = item.product || {};
  const productId = product._id || item.productId;
  const name = product.name || item.name || 'Product';
  const slug = product.slug || productId;
  const brand = product.brand || 'Aura Premium';
  const quantity = item.quantity || 1;
  const price = item.price || product.effectivePrice || product.price || 0;
  const stock = product.stock !== undefined ? product.stock : 99;

  const imageUrl =
    product.images?.[0]?.url ||
    item.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  const lineTotal = price * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all gap-4">
      {/* Thumbnail & Title */}
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <Link
          to={`/products/${slug}`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100"
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform"
          />
        </Link>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            {brand}
          </span>
          <Link
            to={`/products/${slug}`}
            className="text-sm sm:text-base font-bold text-slate-800 hover:text-indigo-600 line-clamp-2 transition-colors"
          >
            {name}
          </Link>
          <span className="text-xs text-slate-500 mt-1">
            ${price.toFixed(2)} each
          </span>
        </div>
      </div>

      {/* Quantity & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controller */}
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button
            onClick={() => onUpdateQuantity(productId, quantity - 1)}
            disabled={quantity <= 1}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-slate-800">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(productId, quantity + 1)}
            disabled={quantity >= stock}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Price */}
        <div className="w-24 text-right">
          <span className="text-base font-extrabold text-slate-900">
            ${lineTotal.toFixed(2)}
          </span>
        </div>

        {/* Delete Item */}
        <button
          onClick={() => onRemove(productId)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          title="Remove from cart"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
