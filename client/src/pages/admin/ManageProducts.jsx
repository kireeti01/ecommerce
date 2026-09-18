import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    brand: 'Aura Premium',
    isFeatured: false,
    tags: '',
    imageUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      params.append('page', page);
      params.append('limit', 10);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, page]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedProductId(null);
    setFormData({
      ...initialForm,
      category: categories[0]?._id || ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setSelectedProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category?._id || product.category || '',
      stock: product.stock,
      brand: product.brand || 'Aura Premium',
      isFeatured: product.isFeatured || false,
      tags: product.tags?.join(', ') || '',
      imageUrl: product.images?.[0]?.url || ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('discountPrice', formData.discountPrice || 0);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock || 0);
      submitData.append('brand', formData.brand);
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('tags', formData.tags);

      if (selectedFile) {
        submitData.append('images', selectedFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      if (isEditing) {
        await api.put(`/products/${selectedProductId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product removed');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, and manage inventory across your store catalog.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md relative">
        <input
          type="text"
          placeholder="Filter products by name, brand..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading catalog items...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                    No products found. Add your first item using the button above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[11px] text-indigo-600 font-semibold">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {p.category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ${p.price.toFixed(2)}
                      {p.discountPrice > 0 && (
                        <span className="text-[10px] text-emerald-600 block">
                          Sale: ${p.discountPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`font-bold ${
                          p.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      ⭐ {p.ratings} ({p.numReviews})
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Units *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="minimalist, titanium, wireless"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          {/* Image Upload or URL */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block font-semibold text-slate-700">Product Image</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Upload File to Cloudinary</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Or Direct Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700">
              Feature on Homepage Showcase
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Edition' : 'Create Edition'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageProducts;
