import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import { setCart } from '../store/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const guestCartItems = useSelector((state) => state.cart.items);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken
        })
      );

      // Merge guest cart if items exist
      if (guestCartItems && guestCartItems.length > 0) {
        try {
          const syncRes = await api.post('/cart/sync', { guestItems: guestCartItems });
          dispatch(setCart(syncRes.data.cart));
        } catch (syncErr) {
          console.error('Cart sync error:', syncErr);
        }
      } else {
        // Fetch existing DB cart
        try {
          const cartRes = await api.get('/cart');
          dispatch(setCart(cartRes.data.cart));
        } catch (cartErr) {
          console.error('Cart fetch error:', cartErr);
        }
      }

      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@ecommerce.com');
      setPassword('Admin@123456');
    } else {
      setEmail('user@ecommerce.com');
      setPassword('User@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your account.
          </p>
        </div>

        {/* Demo Fast Login Pill Buttons */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            ⚡ 1-Click Quick Demo Login:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Customer</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-slate-900/10 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In to Account</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          Don’t have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
