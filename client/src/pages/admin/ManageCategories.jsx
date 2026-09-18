import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

  const initialForm = { name: '', description: '', image: '' };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedCatId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setIsEditing(true);
    setSelectedCatId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put(`/categories/${selectedCatId}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Are you sure you want to remove this category?')) return;
    try {
      await api.delete(`/categories/${catId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize and classify product departments across the store.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Slug</th>
              <th className="py-3.5 px-6">Products</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=80'}
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{cat.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-6 font-mono text-slate-600">
                  {cat.slug}
                </td>
                <td className="py-3.5 px-6 font-semibold text-slate-800">
                  {cat.productCount || 0} product(s)
                </td>
                <td className="py-3.5 px-6 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
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
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategories;
