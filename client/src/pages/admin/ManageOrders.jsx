import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, Clock, Truck, AlertCircle, Eye } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 15);

      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer shipments, process orders, and manage fulfillment.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st || 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Items</th>
                <th className="py-3.5 px-6">Total</th>
                <th className="py-3.5 px-6">Payment</th>
                <th className="py-3.5 px-6">Fulfillment Status</th>
                <th className="py-3.5 px-6 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                    No customer orders found under this filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-700">
                      {ord._id.slice(-8)}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400">{ord.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {ord.items.length} item(s)
                    </td>
                    <td className="py-3.5 px-6 font-black text-slate-900">
                      ${ord.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`capitalize font-bold text-[11px] ${
                          ord.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden capitalize cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="p-1 text-slate-400 hover:text-indigo-600 inline-block"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
