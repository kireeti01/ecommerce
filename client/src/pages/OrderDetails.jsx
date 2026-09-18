import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  CreditCard,
  MapPin
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error('Error fetching order:', err);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading invoice & tracking...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  // Stepper tracker states
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order #{order._id}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 self-start sm:self-auto">
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Shipment Tracker Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Shipment Progress
        </h3>

        <div className="flex items-center justify-between relative">
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStatusIndex >= 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Order Placed</span>
          </div>

          <div className={`flex-1 h-1 mx-2 -mt-6 ${currentStatusIndex >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStatusIndex >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Processing</span>
          </div>

          <div className={`flex-1 h-1 mx-2 -mt-6 ${currentStatusIndex >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStatusIndex >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Shipped</span>
          </div>

          <div className={`flex-1 h-1 mx-2 -mt-6 ${currentStatusIndex >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStatusIndex >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Delivered</span>
          </div>
        </div>
      </div>

      {/* Two-Column Details: Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Delivery Destination</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {order.shippingAddress.street} <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode} <br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Summary</span>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Method: <span className="font-semibold text-slate-800">{order.paymentMethod}</span></p>
            <p>
              Status:{' '}
              <span
                className={`font-bold capitalize ${
                  order.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentDetails?.transactionId && (
              <p className="text-xs text-slate-400 font-mono truncate">
                Ref: {order.paymentDetails.transactionId}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Ordered Items</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <span className="font-extrabold text-sm text-slate-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-semibold text-slate-900">${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">
              {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Sales Tax</span>
            <span className="font-semibold text-slate-900">${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
            <span>Grand Total</span>
            <span className="text-lg text-indigo-600">${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
