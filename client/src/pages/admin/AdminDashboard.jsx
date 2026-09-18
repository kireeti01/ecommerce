import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Layers
} from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/stats/summary');
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading store intelligence analytics...</p>
        </div>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalOrdersCount = 0,
    completedOrdersCount = 0,
    totalUsersCount = 0,
    lowStockCount = 0,
    topProducts = [],
    recentOrders = []
  } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Control Center
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
        </div>

        {/* Quick Links */}
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </Link>
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(2)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            From {completedOrdersCount} paid transaction(s)
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Orders Placed
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalOrdersCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">All lifecycle statuses</span>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Accounts
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalUsersCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Registered members</span>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{lowStockCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Items with &le; 5 units in stock</span>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {ord.user?.name || 'Customer'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${ord.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Products by Sales (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
            Top Performing Editions
          </h3>

          <div className="space-y-3">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs">
                <img
                  src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                  alt={prod.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                  <p className="text-[11px] text-slate-500">{prod.totalQuantitySold} units sold</p>
                </div>
                <span className="font-bold text-emerald-600">
                  ${prod.totalSalesAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
