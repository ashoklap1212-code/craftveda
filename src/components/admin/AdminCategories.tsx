import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category, CategoryId } from '../../types';
import { 
  Layers, Plus, Edit, Trash2, Search, Image as ImageIcon, X, 
  Sparkles, CheckCircle2, Package, Eye 
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [id, setId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const filteredCategories = categories.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setId('');
    setName('');
    setDescription('');
    setImage('');
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate clean ID slug if empty
    const finalId = (id.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '') as CategoryId;
    const fallbackImage = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop';
    const finalImage = image.trim() ? image.trim() : fallbackImage;

    const itemCount = products.filter(p => p.category === finalId).length;

    const categoryPayload: Category = {
      id: finalId,
      name: name.trim(),
      description: description.trim() || 'Handcrafted traditional Indian craft category.',
      image: finalImage,
      itemCount: editingCategory ? editingCategory.itemCount : itemCount,
    };

    if (editingCategory) {
      updateCategory(categoryPayload);
    } else {
      addCategory(categoryPayload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
              Taxonomy Manager
            </span>
            <span className="text-xs text-earth-400 font-medium">• Total ({categories.length}) Categories</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">Category & Taxonomy Console</h2>
          <p className="text-xs text-earth-400 mt-1">Upload image banners, update category titles, descriptions, and manage store taxonomies.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Controls & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search category by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-earth-900 border border-earth-800 rounded-2xl px-4 py-2.5 pl-10 text-xs text-white placeholder-earth-400 focus:border-terracotta-500 outline-none"
          />
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs font-bold text-terracotta-400 hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Category Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const liveItemCount = products.filter(p => p.category === cat.id).length;

          return (
            <div 
              key={cat.id} 
              className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm hover:border-earth-700 transition-all flex flex-col justify-between"
            >
              {/* Image Banner */}
              <div className="h-44 relative bg-earth-800 overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/20 to-transparent"></div>
                
                <span className="absolute top-3 right-3 bg-earth-950/80 backdrop-blur-md text-terracotta-300 border border-earth-700 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                  {liveItemCount} Items Listed
                </span>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] text-earth-400 uppercase font-mono block">ID: {cat.id}</span>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p className="text-earth-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Actions */}
                <div className="pt-3 border-t border-earth-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-earth-500 font-medium">
                    Store Category
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="px-3 py-1.5 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                      title="Edit Category Details"
                    >
                      <Edit className="w-3.5 h-3.5 text-terracotta-400" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-earth-900 border border-earth-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-earth-800 pb-3">
              <div>
                <h3 className="font-serif font-extrabold text-xl text-white">
                  {editingCategory ? 'Edit Category Details' : 'Create New Craft Category'}
                </h3>
                <p className="text-xs text-earth-400 mt-0.5">Upload image URL, name, and description</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-earth-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-earth-300 font-bold mb-1">Category Title *</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Royal Tanjore Wall Art"
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-earth-300 font-bold mb-1">Category ID / Slug</label>
                <input
                  type="text" value={id} onChange={e => setId(e.target.value)}
                  disabled={!!editingCategory}
                  placeholder="e.g. tanjore-art (auto-generated if blank)"
                  className="w-full bg-earth-800 disabled:bg-earth-800/50 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-earth-300 font-bold mb-1">Category Banner Image URL *</label>
                <input
                  type="text" required value={image} onChange={e => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
                />
                {image && (
                  <div className="mt-2 flex items-center gap-3 bg-earth-800 p-2 rounded-xl border border-earth-700">
                    <img src={image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[10px] text-earth-400">Live Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-earth-300 font-bold mb-1">Description *</label>
                <textarea 
                  rows={3} required value={description} onChange={e => setDescription(e.target.value)} 
                  placeholder="Describe the craft origins, traditional methods, and products under this category..." 
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl p-3 text-white outline-none" 
                />
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl shadow-warm transition-all text-xs"
              >
                {editingCategory ? 'Save Category Changes' : 'Create Category & Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
