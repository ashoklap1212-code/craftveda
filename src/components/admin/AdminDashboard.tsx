import React from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { 
  TrendingUp, ShoppingCart, Users, Package, AlertTriangle, CheckCircle2, ArrowUpRight, DollarSign 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { orders, products, currentUser, setActiveAdminTab } = useStore();

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.currentStatus !== 'Delivered' && o.currentStatus !== 'Cancelled').length;
  const deliveredOrders = orders.filter(o => o.currentStatus === 'Delivered').length;

  const lowStock = products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0);
  const outOfStock = products.filter(p => p.stockQuantity === 0);

  return (
    <div className="space-y-6 animate-fade-in text-earth-100">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-earth-900 border border-earth-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-earth-400">
            <span>Total Sales Revenue</span>
            <div className="p-2 bg-terracotta-500/20 text-terracotta-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-white">
            ₹{totalSales.toLocaleString('en-IN')}
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% from last month
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-earth-900 border border-earth-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-earth-400">
            <span>Total Orders</span>
            <div className="p-2 bg-terracotta-500/20 text-terracotta-400 rounded-xl">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-white">
            {totalOrders}
          </h3>
          <span className="text-[10px] text-earth-400">
            {pendingOrders} active processing, {deliveredOrders} delivered
          </span>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-earth-900 border border-earth-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-earth-400">
            <span>Low / Out of Stock</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-amber-400">
            {lowStock.length + outOfStock.length} Products
          </h3>
          <button
            onClick={() => setActiveAdminTab('inventory')}
            className="text-[10px] text-amber-300 font-bold hover:underline"
          >
            Manage Stock Levels →
          </button>
        </div>

        {/* Total Registered Users */}
        <div className="bg-earth-900 border border-earth-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-earth-400">
            <span>Total Customers</span>
            <div className="p-2 bg-terracotta-500/20 text-terracotta-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-white">
            1,240
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold">+12 active today</span>
        </div>
      </div>

      {/* Visual Analytics Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart Visual */}
        <div className="lg:col-span-8 bg-earth-900 border border-earth-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Weekly Sales & Revenue Trend</h3>
              <p className="text-xs text-earth-400">Daily sales breakdown for traditional pottery & decor</p>
            </div>
            <span className="bg-terracotta-500/20 text-terracotta-400 text-xs font-bold px-3 py-1 rounded-full border border-terracotta-500/30">
              Sept 2026
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-56 w-full pt-4 flex items-end justify-between gap-2 border-b border-earth-800 pb-2">
            {[
              { day: 'Mon', sales: 4200, height: '40%' },
              { day: 'Tue', sales: 6800, height: '60%' },
              { day: 'Wed', sales: 8900, height: '78%' },
              { day: 'Thu', sales: 5400, height: '50%' },
              { day: 'Fri', sales: 11200, height: '95%' },
              { day: 'Sat', sales: 9800, height: '85%' },
              { day: 'Sun', sales: 7400, height: '65%' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-earth-400 group-hover:text-white font-bold transition-colors">
                  ₹{(bar.sales/1000).toFixed(1)}k
                </span>
                <div 
                  className="w-full max-w-[36px] bg-terracotta-500 hover:bg-terracotta-400 rounded-t-lg transition-all"
                  style={{ height: bar.height }}
                ></div>
                <span className="text-[10px] text-earth-500 uppercase font-bold">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-4 bg-earth-900 border border-earth-800 p-6 rounded-3xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-white">Order Pipeline Status</h3>
          
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-earth-300">
                <span>Order Placed & Confirmed</span>
                <span className="font-bold text-white">2</span>
              </div>
              <div className="w-full h-2 bg-earth-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[30%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-earth-300">
                <span>Packed & Shipped</span>
                <span className="font-bold text-white">1</span>
              </div>
              <div className="w-full h-2 bg-earth-800 rounded-full overflow-hidden">
                <div className="h-full bg-terracotta-500 w-[45%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-earth-300">
                <span>Out for Delivery / Delivered</span>
                <span className="font-bold text-white">8</span>
              </div>
              <div className="w-full h-2 bg-earth-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Add New Product Quick Form Section (Requirement 8 UI Fix) */}
      <div className="bg-earth-900 border border-earth-800 p-6 sm:p-8 rounded-3xl space-y-6 max-w-2xl mx-auto shadow-xl">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mb-1">
            <Package className="w-3.5 h-3.5" /> Quick Inventory Creator
          </div>
          <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-white">Add New Product</h3>
          <p className="text-xs text-earth-400 max-w-md mx-auto">Create and publish a new handicraft product listing directly to your MongoDB Atlas store database.</p>
        </div>

        <QuickAddProductForm />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-earth-900 border border-earth-800 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-lg text-white">Recent Customer Orders</h3>
          <button
            onClick={() => setActiveAdminTab('orders')}
            className="text-xs font-bold text-terracotta-400 hover:underline"
          >
            View All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-300">
            <thead className="bg-earth-800/60 text-earth-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items Count</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-800">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-earth-800/40">
                  <td className="p-3 font-bold text-white">{o.orderNumber}</td>
                  <td className="p-3 text-earth-200">{o.customerName}</td>
                  <td className="p-3">{o.items.length} item(s)</td>
                  <td className="p-3 font-bold text-terracotta-400">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3"><span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">{o.payment.paymentMethod}</span></td>
                  <td className="p-3">
                    <span className="bg-terracotta-950 text-terracotta-300 border border-terracotta-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {o.currentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveAdminTab('orders')}
                      className="text-terracotta-400 hover:underline font-bold"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Centered Add New Product Quick Form
const QuickAddProductForm: React.FC = () => {
  const { categories, addProduct, showToast } = useStore();
  const [productName, setProductName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [category, setCategory] = React.useState('ceramic-pots');
  const [productImage, setProductImage] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    if (!productName.trim() || !price) {
      showToast('Please enter product name and price', 'error');
      return;
    }

    try {
      setLoading(true);
      const catObj = categories.find(c => c.id === category);
      const numPrice = Number(price);

      let finalImage = productImage.trim();

      if (selectedFile) {
        try {
          const uploadRes = await api.uploadProductImage(selectedFile);
          finalImage = uploadRes.imageUrl;
        } catch (err: any) {
          console.error('❌ Upload error:', err);
          setUploadError(err.message || 'Image upload failed');
          setLoading(false);
          return;
        }
      }

      const fallbackImage = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop';
      if (!finalImage) {
        finalImage = fallbackImage;
      }

      await addProduct({
        name: productName.trim(),
        subtitle: 'Authentic Traditional Handicraft',
        category: category as any,
        categoryName: catObj ? catObj.name : 'Ceramic Pots',
        price: numPrice,
        originalPrice: Math.round(numPrice * 1.2),
        discountPercentage: 15,
        rating: 4.9,
        reviewCount: 1,
        images: [finalImage],
        description: `${productName} handcrafted by master artisans using traditional kilns and eco-friendly techniques.`,
        shortDescription: 'Handcrafted authentic traditional craft product.',
        material: 'High Fired Terracotta Clay',
        dimensions: '20cm x 20cm x 25cm',
        weight: '2.0 kg',
        color: 'Earthy Terracotta',
        manufacturingType: 'Potters Wheel & Artisanal Kiln',
        careInstructions: 'Clean with damp microfiber cloth.',
        suitableUsage: 'Home decor, kitchen & dining',
        packagingInfo: 'Triple cushioned eco impact box',
        inStock: true,
        stockQuantity: 20,
        isFeatured: true,
        isNewArrival: true,
      });

      setProductName('');
      setPrice('');
      setProductImage('');
      setSelectedFile(null);
      setImagePreview('');
    } catch (err: any) {
      console.error('❌ Failed to add product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block text-earth-300 font-bold mb-1">
          Product Name <span className="text-terracotta-400">*</span>
        </label>
        <input
          type="text"
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          className="w-full bg-earth-800 border border-earth-700 rounded-2xl px-4 py-3 text-white placeholder-earth-500 focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-earth-300 font-bold mb-1">
            Price (₹) <span className="text-terracotta-400">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full bg-earth-800 border border-earth-700 rounded-2xl px-4 py-3 text-white placeholder-earth-500 focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-earth-300 font-bold mb-1">
            Category <span className="text-terracotta-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-earth-800 border border-earth-700 rounded-2xl px-4 py-3 text-white focus:border-terracotta-500 outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Image File Picker & Preview */}
      <div>
        <label className="block text-earth-300 font-bold mb-1">
          Product Image
        </label>

        <div className="bg-earth-800 border border-earth-700 rounded-2xl p-4 space-y-3">
          {uploadError && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-2.5 rounded-xl text-xs flex items-center justify-between">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError('')} className="underline font-bold">Dismiss</button>
            </div>
          )}

          {imagePreview || productImage ? (
            <div className="flex items-center gap-4">
              <img
                src={imagePreview || productImage}
                alt="Product Preview"
                className="w-16 h-16 rounded-xl object-cover border border-earth-600 bg-earth-900 shrink-0"
              />
              <div className="space-y-1.5 min-w-0">
                <p className="text-xs font-bold text-white">Image Preview Selected</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-1 bg-earth-700 hover:bg-earth-600 text-white rounded-lg text-xs font-bold transition-colors">
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
                      setProductImage('');
                    }}
                    className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-earth-600 hover:border-terracotta-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
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

          <div className="pt-2 border-t border-earth-700/60">
            <label className="block text-[10px] font-bold text-earth-400 mb-1">
              Or enter Image URL (Optional Fallback)
            </label>
            <input
              type="url"
              value={productImage}
              onChange={(e) => {
                setProductImage(e.target.value);
                if (e.target.value) {
                  setImagePreview(e.target.value);
                  setSelectedFile(null);
                }
              }}
              placeholder="Upload Image URL (e.g. https://images.unsplash.com/...)"
              className="w-full bg-earth-900 border border-earth-700 rounded-xl px-3 py-2 text-xs text-white placeholder-earth-500 focus:border-terracotta-500 outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-warm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
      >
        <span>{loading ? 'Uploading Image & Adding Product...' : 'Add Product'}</span>
      </button>
    </form>
  );
};
