import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category, CategoryId } from '../../types';
import { apiService } from '../../services/api';
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

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  const filteredCategories = categories.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setId('');
    setName('');
    setDescription('');
    setImage('');
    setSelectedFile(null);
    setImagePreview('');
    setUploadError('');
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
    setSelectedFile(null);
    setImagePreview('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5 MB maximum limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Only JPG, JPEG, PNG, and WEBP image files are allowed');
      return;
    }

    setUploadError('');
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    
    try {
      let finalImage = image.trim();

      if (selectedFile) {
        // Use category-specific image upload endpoint
        try {
          const uploadRes = await apiService.uploadCategoryImage(selectedFile);
          finalImage = uploadRes.imageUrl;
        } catch (uploadErr: any) {
          // Fallback to product upload endpoint
          const uploadRes = await apiService.uploadProductImage(selectedFile);
          finalImage = uploadRes.imageUrl;
        }
      }

      const fallbackImage = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop';
      if (!finalImage) {
        finalImage = fallbackImage;
      }

      const finalId = (id.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '') as CategoryId;
      const itemCount = products.filter(p => p.category === finalId).length;

      const categoryPayload: Category = {
        id: finalId,
        name: name.trim(),
        description: description.trim() || 'Handcrafted traditional Indian craft category.',
        image: finalImage,
        itemCount: editingCategory ? editingCategory.itemCount : itemCount,
      };

      if (editingCategory) {
        await updateCategory(categoryPayload);
      } else {
        await addCategory(categoryPayload);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save category');
    } finally {
      setUploading(false);
    }
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
          const liveItemCount = products.filter(p => {
            if (!p.category) return false;
            const pCat = p.category.toLowerCase().trim();
            const cId = cat.id.toLowerCase().trim();
            const cName = cat.name.toLowerCase().trim();
            return pCat === cId || pCat === cName || pCat.replace(/[^a-z0-9]/g, '') === cId.replace(/[^a-z0-9]/g, '');
          }).length;

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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center animate-fade-in">
          <div className="relative bg-earth-900 border border-earth-700 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] my-auto overflow-hidden">
            {/* Modal Header - always visible at top */}
            <div className="flex justify-between items-center border-b border-earth-800 px-6 py-4 shrink-0 bg-earth-900">
              <div>
                <h3 className="font-serif font-extrabold text-xl text-white">
                  {editingCategory ? 'Edit Category Details' : 'Create New Craft Category'}
                </h3>
                <p className="text-xs text-earth-400 mt-0.5">Upload image URL, name, and description</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-earth-400 hover:text-white p-2 rounded-xl hover:bg-earth-800 transition-colors shrink-0"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form wrapping scrollable body and sticky footer */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
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
                  <label className="block text-earth-300 font-bold mb-1">
                    Category Banner Image <span className="text-terracotta-400">*</span>
                  </label>

                  <div className="bg-earth-800 border border-earth-700 rounded-2xl p-4 space-y-3">
                    {uploadError && (
                      <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-2.5 rounded-xl text-xs flex items-center justify-between">
                        <span>{uploadError}</span>
                        <button type="button" onClick={() => setUploadError('')} className="underline font-bold">Dismiss</button>
                      </div>
                    )}

                    {imagePreview || image ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={imagePreview || image}
                          alt="Category Preview"
                          className="w-20 h-20 rounded-xl object-cover border border-earth-600 bg-earth-900 shrink-0"
                        />
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Image Selected
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-earth-700 hover:bg-earth-600 text-white rounded-xl text-xs font-bold transition-colors">
                              Change Image File
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setImagePreview('');
                                setImage('');
                              }}
                              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-earth-600 hover:border-terracotta-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                        <ImageIcon className="w-7 h-7 text-earth-400 group-hover:text-terracotta-400 mb-1.5" />
                        <span className="text-xs font-bold text-white">Click to Select Category Image from Device</span>
                        <span className="text-[10px] text-earth-400 mt-0.5">
                          Supported formats: JPG, JPEG, PNG, WEBP (Max 5 MB)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* Optional Fallback Web URL */}
                    <div className="pt-2 border-t border-earth-700/60">
                      <label className="block text-[11px] font-bold text-earth-400 mb-1">
                        Or Enter Image Web URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        className="w-full bg-earth-900 border border-earth-700 rounded-xl px-3 py-2 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-earth-300 font-bold mb-1">Description *</label>
                  <textarea
                    rows={3} required value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the craft origins, traditional methods, and products under this category..."
                    className="w-full bg-earth-800 border border-earth-700 rounded-xl p-3 text-white outline-none"
                  />
                </div>
              </div>

              {/* Submit button — sticky at bottom */}
              <div className="px-6 py-4 border-t border-earth-800 shrink-0 bg-earth-900">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl shadow-warm transition-all text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{uploading ? 'Uploading Image & Saving Category...' : editingCategory ? 'Save Category Changes' : 'Create Category & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
