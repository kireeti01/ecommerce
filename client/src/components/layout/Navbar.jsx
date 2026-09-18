import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalCartCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      setIsProfileOpen(false);
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                  AURA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <Link to="/products" className="hover:text-indigo-600 transition-colors">
                All Products
              </Link>
              <Link to="/products?featured=true" className="hover:text-indigo-600 transition-colors">
                Featured
              </Link>
              <Link to="/products?category=electronics-audio" className="hover:text-indigo-600 transition-colors">
                Electronics
              </Link>
              <Link to="/products?category=modern-fashion" className="hover:text-indigo-600 transition-colors">
                Fashion
              </Link>
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 text-sm rounded-full border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-subtle shadow-md shadow-indigo-600/30">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login Link */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    onMouseLeave={() => setIsProfileOpen(false)}
                    className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-xl py-2 z-50 border border-slate-200/90 text-sm animate-fade-in"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-full">
                          Administrator
                        </span>
                      )}
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-indigo-600 font-medium hover:bg-indigo-50/70"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 mr-3 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 mr-3 text-slate-400" />
                      My Orders
                    </Link>

                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 bg-white shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-lg border border-slate-200"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </form>

          <nav className="flex flex-col space-y-2 text-base font-medium text-slate-700">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              All Products
            </Link>
            <Link
              to="/products?featured=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Featured Products
            </Link>
            <Link
              to="/products?category=electronics-audio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Electronics & Audio
            </Link>
            <Link
              to="/products?category=modern-fashion"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Modern Fashion
            </Link>
            <Link
              to="/products?category=home-living"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Home & Living
            </Link>

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
