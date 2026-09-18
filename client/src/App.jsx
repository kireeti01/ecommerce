import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Public Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Pages
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';

import { setCredentials, setLoading } from './store/slices/authSlice';
import { setCart } from './store/slices/cartSlice';
import api from './api/axios';

function App() {
  const dispatch = useDispatch();

  // Check silent session restore on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken
          })
        );

        // Fetch user's cart
        const { data: cartData } = await api.get('/cart');
        if (cartData?.cart) {
          dispatch(setCart(cartData.cart));
        }
      } catch (err) {
        // No valid session cookie found; remains as guest
        dispatch(setLoading(false));
      }
    };

    restoreSession();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#ffffff'
            }
          }
        }}
      />

      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:identifier" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Restricted Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
