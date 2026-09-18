import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/product/ProductFilter';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import api from '../api/axios';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter states
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  useEffect(() => {
    // Fetch categories once for filter menu
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (queryParam) params.append('q', queryParam);
        if (categoryParam) params.append('category', categoryParam);
        if (sortParam) params.append('sort', sortParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        if (ratingParam) params.append('rating', ratingParam);
        if (inStockParam) params.append('inStock', 'true');
        params.append('page', page);
        params.append('limit', 12);

        const { data } = await api.get(`/products?${params.toString()}`);

        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    queryParam,
    categoryParam,
    sortParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    inStockParam,
    page
  ]);

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    newParams.set('page', '1'); // reset to page 1 on filter update
    setPage(1);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {queryParam ? `Search: "${queryParam}"` : 'All Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {products.length} of {totalProducts} items
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortParam}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-hidden focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1">
          <ProductFilter
            categories={categories}
            selectedCategory={categoryParam}
            onCategoryChange={(cat) => updateFilters({ category: cat })}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
            onPriceChange={(min, max) => updateFilters({ minPrice: min, maxPrice: max })}
            selectedRating={ratingParam}
            onRatingChange={(r) => updateFilters({ rating: r })}
            inStockOnly={inStockParam}
            onStockChange={(stock) => updateFilters({ inStock: stock ? 'true' : '' })}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Product Cards Grid */}
        <main className="md:col-span-3 space-y-8">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try broadening your search query or removing active price and category filters."
              actionText="Reset All Filters"
              actionLink="/products"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8 border-t border-slate-200">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filters */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilter
              categories={categories}
              selectedCategory={categoryParam}
              onCategoryChange={(cat) => {
                updateFilters({ category: cat });
                setIsMobileFilterOpen(false);
              }}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              onPriceChange={(min, max) => updateFilters({ minPrice: min, maxPrice: max })}
              selectedRating={ratingParam}
              onRatingChange={(r) => updateFilters({ rating: r })}
              inStockOnly={inStockParam}
              onStockChange={(stock) => updateFilters({ inStock: stock ? 'true' : '' })}
              onResetFilters={() => {
                handleResetFilters();
                setIsMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
