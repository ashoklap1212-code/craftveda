import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Product } from '../models/Product.js';
import { protect, adminOrSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for product image uploads
const productUploadDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, productUploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `product_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  const allowedExts = /^\.(jpg|jpeg|png|webp)$/i;
  const allowedMime = /^image\/(jpeg|jpg|png|webp)$/i;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.test(ext) && allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed!'), false);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter,
});

// @desc    Upload product image file
// @route   POST /api/products/upload
// @access  Public / Admin
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5 MB maximum limit' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    console.log(`📸 Product image uploaded successfully: ${imageUrl}`);
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    });
  });
});

// @desc    Get all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy, minPrice, maxPrice } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price-asc') sortOptions = { price: 1 };
    if (sortBy === 'price-desc') sortOptions = { price: -1 };
    if (sortBy === 'rating') sortOptions = { rating: -1 };
    if (sortBy === 'popularity') sortOptions = { reviewCount: -1 };

    const products = await Product.find(query).sort(sortOptions);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Public / Protected
router.post('/', async (req, res) => {
  try {
    const { name, category, categoryName, price, images } = req.body;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ message: 'Please provide product name, category, and price' });
    }

    const defaultCategoryName = categoryName || category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const product = new Product({
      ...req.body,
      categoryName: defaultCategoryName,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop'],
    });

    const createdProduct = await product.save();
    console.log(`✅ Product created in MongoDB (craftdev.products): ${createdProduct.name} (${createdProduct._id})`);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});


// @desc    Update existing product
// @route   PUT /api/products/:id
// @access  Public / Protected
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public / Protected
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product successfully deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

export default router;
