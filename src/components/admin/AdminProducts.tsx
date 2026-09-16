import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryId } from '../../types';
import { api } from '../../services/api';
import { 
  Plus, Edit, Trash2, Search, Filter, Sparkles, CheckCircle2, 
  AlertTriangle, Package, X, ArrowUpDown, Image as ImageIcon 
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, updateProductStock } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('ceramic-pots');
  const [price, setPrice] = useState<number>(1200);
  const [originalPrice, setOriginalPrice] = useState<number>(1600);
  const [stockQuantity, setStockQuantity] = useState<number>(15);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('High Fired Terracotta Clay');
  const [dimensions, setDimensions] = useState('20cm x 20cm x 25cm');
  const [weight, setWeight] = useState('2.0 kg');
  const [color, setColor] = useState('Terracotta Red & Ochre');

  // Robust Filtering Logic with Null-Safety
  const filteredProducts = products.filter(p => {
    const productName = (p.name || '').toLowerCase();
    const catName = (p.categoryName || '').toLowerCase();
    const q = search.toLowerCase().trim();

    if (q && !productName.includes(q) && !catName.includes(q)) {
      return false;
    }

    if (categoryFilter !== 'all' && p.category !== categoryFilter) {
      return false;
    }

    if (stockFilter === 'instock' && (!p.inStock || p.stockQuantity < 1)) return false;
    if (stockFilter === 'lowstock' && (p.stockQuantity >= 10 || p.stockQuantity === 0)) return false;
    if (stockFilter === 'outofstock' && p.stockQuantity > 0) return false;

    return true;
  });

  const resetForm = () => {
    setName(''); 
    setSubtitle(''); 
    setPrice(1200); 
    setOriginalPrice(1600);
    setStockQuantity(15); 
    setImageUrl(''); 
    setSelectedFile(null);
    setImagePreview('');
    setUploadingImage(false);
    setUploadError('');
    setDescription('');
    setMaterial('High Fired Terracotta Clay'); 
    setDimensions('20cm x 20cm x 25cm');
    setWeight('2.0 kg');
    setColor('Terracotta Red & Ochre');
    setEditingProduct(null);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSubtitle(p.subtitle || '');
    setCategory(p.category || 'ceramic-pots');
    setPrice(p.price || 0);
    setOriginalPrice(p.originalPrice || p.price || 0);
    setStockQuantity(p.stockQuantity || 0);
    const existingImg = p.images && p.images.length > 0 ? p.images[0] : '';
    setImageUrl(existingImg);
    setImagePreview(existingImg);
    setSelectedFile(null);
    setUploadError('');
    setDescription(p.description || '');
    setMaterial(p.material || '');
    setDimensions(p.dimensions || '');
    setWeight(p.weight || '');
    setColor(p.color || '');
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds maximum limit of 5 MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    const catObj = categories.find(c => c.id === category);

    const safeOriginal = Number(originalPrice) || Number(price);
    const safeSelling = Number(price);
    const discountPercentage = safeOriginal > safeSelling ? Math.round(((safeOriginal - safeSelling) / safeOriginal) * 100) : 0;

    let finalImage = imageUrl.trim();

    if (selectedFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await api.uploadProductImage(selectedFile);
        finalImage = uploadRes.imageUrl;
      } catch (err: any) {
        console.error('❌ Failed to upload product image:', err);
        setUploadError(err.message || 'Failed to upload image file');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop';
    if (!finalImage) {
      finalImage = fallbackImg;
    }

    const productPayload = {
      name,
      subtitle: subtitle || name,
      category,
      categoryName: catObj ? catObj.name : 'Ceramic Pots',
      price: safeSelling,
      originalPrice: safeOriginal,
      discountPercentage,
      rating: editingProduct ? editingProduct.rating : 4.8,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      images: editingProduct && editingProduct.images.length > 1 ? [finalImage, ...editingProduct.images.slice(1)] : [finalImage],
      description: description || 'Handcrafted authentic traditional craft product.',
      shortDescription: subtitle || name,
      material: material || 'Traditional Fired Clay',
      dimensions: dimensions || 'Standard Craft Dimensions',
      weight: weight || '1.5 kg',
      color: color || 'Earthy Natural',
      manufacturingType: 'Potters Wheel & Artisanal Kiln',
      careInstructions: 'Clean with damp microfiber cloth.',
      suitableUsage: 'Home decor, kitchen & dining',
      packagingInfo: 'Triple cushioned eco impact box',
      inStock: Number(stockQuantity) > 0,
      stockQuantity: Math.max(0, Number(stockQuantity)),
      isFeatured: true,
      isNewArrival: true,
    };

    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...productPayload });
      } else {
        await addProduct(productPayload);
      }

      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('❌ Product save error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
              Inventory Manager
            </span>
            <span className="text-xs text-earth-400 font-medium">• Total ({products.length}) Products</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">Product Catalog Console</h2>
          <p className="text-xs text-earth-400 mt-1">Manage handicraft product listings, pricing, images, and live store availability.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-warm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search catalog by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-earth-900 border border-earth-800 rounded-2xl px-4 py-2.5 pl-10 text-xs text-white placeholder-earth-400 focus:border-terracotta-500 outline-none"
          />
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-earth-900 border border-earth-800 text-xs text-earth-200 rounded-2xl px-4 py-2.5 focus:border-terracotta-500 outline-none cursor-pointer"
        >
          <option value="all">All Craft Categories ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value as any)}
          className="bg-earth-900 border border-earth-800 text-xs text-earth-200 rounded-2xl px-4 py-2.5 focus:border-terracotta-500 outline-none cursor-pointer"
        >
          <option value="all">All Stock Statuses</option>
          <option value="instock">In Stock Only</option>
          <option value="lowstock">Low Stock (&lt; 10 pcs)</option>
          <option value="outofstock">Out of Stock (0 pcs)</option>
        </select>

        {/* Clear Filter Button */}
        {(search || categoryFilter !== 'all' || stockFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); setStockFilter('all'); }}
            className="bg-earth-800 hover:bg-earth-700 text-terracotta-400 text-xs font-bold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" /> Reset Filters
          </button>
        )}
      </div>

      {/* Catalog Products Table */}
      <div className="bg-earth-900 border border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/80 text-earth-400 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-earth-400 space-y-2">
                    <Package className="w-8 h-8 text-earth-600 mx-auto" />
                    <p className="font-bold text-white">No products found matching your catalog search.</p>
                    <p className="text-[11px]">Try clearing search filters or click "Add New Product" to create one.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-earth-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop'} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover bg-earth-800 border border-earth-700 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-earth-400 line-clamp-1">{p.subtitle || p.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-earth-200">
                      <span className="bg-earth-800 px-2.5 py-1 rounded-lg border border-earth-700 text-[11px]">
                        {p.categoryName || p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif font-extrabold text-sm text-terracotta-400">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-[10px] text-earth-500 line-through">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateProductStock(p.id, Math.max(0, p.stockQuantity - 1))}
                          className="w-6 h-6 rounded-md bg-earth-800 hover:bg-earth-700 text-white flex items-center justify-center font-bold text-xs"
                          title="Decrease stock by 1"
                        >
                          -
                        </button>
                        <span className="text-white min-w-[40px] text-center font-mono">{p.stockQuantity} pcs</span>
                        <button
                          onClick={() => updateProductStock(p.id, p.stockQuantity + 1)}
                          className="w-6 h-6 rounded-md bg-earth-800 hover:bg-earth-700 text-white flex items-center justify-center font-bold text-xs"
                          title="Increase stock by 1"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {p.inStock && p.stockQuantity > 0 ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 bg-earth-800 hover:bg-earth-700 text-earth-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5 text-terracotta-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-earth-950/80 backdrop-blur-md overflow-y-auto w-full h-full animate-fade-in">
          <div className="bg-earth-900 border border-earth-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[88vh] shadow-2xl relative my-auto border-t-4 border-t-terracotta-500">
            <div className="flex justify-between items-center border-b border-earth-800 pb-3">
              <div>
                <h3 className="font-serif font-extrabold text-xl text-white">
                  {editingProduct ? 'Edit Handicraft Product' : 'Add New Handicraft Product'}
                </h3>
                <p className="text-xs text-earth-400 mt-0.5">Fill out product details to publish to CraftVeda store catalog</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-earth-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-earth-300 font-bold mb-1">Product Title *</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Royal Jaipuri Floral Glazed Ceramic Pot"
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-earth-300 font-bold mb-1">Subtitle / Tagline</label>
                <input
                  type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. Hand-painted blue pottery decorative urn"
                  className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Category *</label>
                  <select
                    value={category} onChange={e => setCategory(e.target.value as CategoryId)}
                    className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white focus:border-terracotta-500 outline-none cursor-pointer"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Initial Stock Qty *</label>
                  <input
                    type="number" required min="0" value={stockQuantity} onChange={e => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white focus:border-terracotta-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number" required min="1" value={price} onChange={e => setPrice(Number(e.target.value))}
                    className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white focus:border-terracotta-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Original MRP (₹)</label>
                  <input
                    type="number" min="1" value={originalPrice} onChange={e => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white focus:border-terracotta-500 outline-none"
                  />
                </div>
              </div>

              {/* Product Image Upload Field */}
              <div>
                <label className="block text-earth-300 font-bold mb-1">
                  Product Image <span className="text-terracotta-400">*</span>
                </label>

                <div className="bg-earth-800 border border-earth-700 rounded-2xl p-4 space-y-3">
                  {uploadError && (
                    <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-2.5 rounded-xl text-xs flex items-center justify-between">
                      <span>{uploadError}</span>
                      <button type="button" onClick={() => setUploadError('')} className="underline font-bold">Dismiss</button>
                    </div>
                  )}

                  {imagePreview || imageUrl ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={imagePreview || imageUrl}
                        alt="Product Preview"
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
                            Change Image
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
                              setImageUrl('');
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
                      <span className="text-xs font-bold text-white">Click to Select Product Image from Device</span>
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

                  {/* Optional Fallback Image URL */}
                  <div className="pt-2 border-t border-earth-700/60">
                    <label className="block text-[10px] font-bold text-earth-400 mb-1">
                      Or enter Image URL (Optional Fallback)
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                          setSelectedFile(null);
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-earth-900 border border-earth-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Material Specification</label>
                  <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-earth-300 font-bold mb-1">Dimensions</label>
                  <input type="text" value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full bg-earth-800 border border-earth-700 rounded-xl px-3.5 py-2.5 text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-earth-300 font-bold mb-1">Full Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe craft origins, heritage, and techniques..." className="w-full bg-earth-800 border border-earth-700 rounded-xl p-3 text-white outline-none" />
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl shadow-warm transition-all text-xs disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading Image & Saving...' : (editingProduct ? 'Save Product Changes' : 'Publish Product to Store')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
