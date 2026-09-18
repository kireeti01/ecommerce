import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import StarRating from '../common/StarRating';

const ProductFilter = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedRating,
  onRatingChange,
  inStockOnly,
  onStockChange,
  onResetFilters
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug || cat._id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.slug || selectedCategory === cat._id
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-xs text-slate-400 font-normal">
                  ({cat.productCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Price Range ($)
        </h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Customer Ratings Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => onRatingChange(selectedRating === stars ? '' : stars)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRating === stars
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <StarRating rating={stars} size="w-3.5 h-3.5" />
                <span className="text-xs">& above</span>
              </div>
              {selectedRating === stars && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onStockChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilter;
