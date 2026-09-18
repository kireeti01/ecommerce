import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import api from '../api/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <Package className="w-3 h-3 mr-1" />
            In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="No Order History"
          description="You haven't placed any orders yet. Discover our curated collection today."
          actionText="Explore Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review details and tracking status for past acquisitions.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs text-slate-400">Order ID:</span>
                <p className="font-mono font-bold text-sm text-slate-800">{order._id}</p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {getStatusBadge(order.orderStatus)}
              </div>
            </div>

            {/* Items Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 overflow-x-auto py-1">
                {order.items.slice(0, 4).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                    title={item.name}
                  />
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    +{order.items.length - 4} more
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Amount</span>
                  <span className="text-lg font-black text-slate-900">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
