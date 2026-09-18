import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Lock, MapPin, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { updateUserProfile } from '../store/slices/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA'
  });

  const handleUpdateName = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const { data } = await api.put('/users/profile', { name });
      dispatch(updateUserProfile(data.user));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await api.put('/users/profile', {
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.postalCode) {
      toast.error('Please fill in required address fields');
      return;
    }

    try {
      const { data } = await api.post('/users/address', newAddress);
      setAddresses(data.addresses);
      dispatch(updateUserProfile({ addresses: data.addresses }));
      setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'USA' });
      setShowAddressForm(false);
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/users/address/${addressId}`);
      setAddresses(data.addresses);
      dispatch(updateUserProfile({ addresses: data.addresses }));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="flex items-center space-x-5 pb-6 border-b border-slate-200">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
        />
        <div>
          <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-full">
            {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Personal Details</span>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Details'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>Security & Password</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Delivery Addresses */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <span>Saved Shipping Addresses</span>
          </div>

          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Add Address Form */}
        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Street Address *"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="State *"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Postal Code *"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <p className="text-xs text-slate-400 italic col-span-2">No saved addresses yet.</p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between"
              >
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-800">{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
