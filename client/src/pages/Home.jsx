import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import api from '../api/axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories')
        ]);
        setFeaturedProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 rounded-3xl mx-4 sm:mx-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-6 sm:px-12 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated Artisan & Modern Collections</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Exceptional Design, <br className="hidden sm:inline" />
            <span className="text-gradient">Engineered For Living.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-light">
            Explore meticulously crafted electronics, minimalist luxury garments, and timeless lifestyle essentials direct to your door.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products?featured=true"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Featured Arrivals</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Curated Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-900 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <img
                src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80'}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-indigo-300 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-slate-300 mt-0.5">
                  {category.productCount ? `${category.productCount} items` : 'Explore items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Staff Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Perks Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-12 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Express Dispatch</h4>
              <p className="text-xs text-slate-500 mt-1">Orders processed and dispatched within 24 hours of placement.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">2-Year Warranty</h4>
              <p className="text-xs text-slate-500 mt-1">All hardware and mechanical products include comprehensive coverage.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Artisanal Curation</h4>
              <p className="text-xs text-slate-500 mt-1">Each edition is inspected for manufacturing and aesthetic precision.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
