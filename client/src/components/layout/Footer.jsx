import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">Complimentary Delivery</h4>
              <p className="text-xs text-slate-400">Free priority shipping on all domestic orders over $100.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">Authenticity Guaranteed</h4>
              <p className="text-xs text-slate-400">100% genuine artisan and designer goods direct from creators.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400">30-day money-back guarantee with zero restocking fees.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">AURA</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Curating exceptional everyday luxury, industrial minimalism, and timeless artisanal artifacts.
          </p>
          <div className="pt-2 flex items-center space-x-2 text-xs text-slate-500">
            <span>Enterprise MERN Architecture</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Collections</h5>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/products?category=electronics-audio" className="hover:text-indigo-400 transition-colors">
                Electronics & Audio
              </Link>
            </li>
            <li>
              <Link to="/products?category=modern-fashion" className="hover:text-indigo-400 transition-colors">
                Modern Fashion
              </Link>
            </li>
            <li>
              <Link to="/products?category=home-living" className="hover:text-indigo-400 transition-colors">
                Home & Living
              </Link>
            </li>
            <li>
              <Link to="/products?category=fitness-gear" className="hover:text-indigo-400 transition-colors">
                Fitness & Gear
              </Link>
            </li>
            <li>
              <Link to="/products?category=books-stationery" className="hover:text-indigo-400 transition-colors">
                Books & Stationery
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Customer Care</h5>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/orders" className="hover:text-indigo-400 transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-indigo-400 transition-colors">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                Account Settings
              </Link>
            </li>
            <li>
              <span className="text-slate-400 cursor-pointer hover:text-indigo-400">Shipping Policies</span>
            </li>
            <li>
              <span className="text-slate-400 cursor-pointer hover:text-indigo-400">Privacy & Terms</span>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-wider text-white">Join The Circle</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            Subscribe for private releases, seasonal lookbooks, and exclusive 15% introductory vouchers.
          </p>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-slate-800 text-sm px-4 py-2.5 rounded-lg border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => alert('Thank you for subscribing!')}
              className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AURA E-Commerce Inc. All rights reserved. Built with MongoDB Atlas, Express, React, and Node.js.</p>
      </div>
    </footer>
  );
};

export default Footer;
