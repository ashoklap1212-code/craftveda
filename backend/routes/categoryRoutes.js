import express from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { protect, adminOrSeller } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer storage for category image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'categories');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `category_${Date.now()}_${Math.floor(Math.random() * 1000000000)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, WEBP images are allowed'));
    }
  },
});

// Seed initial categories if none exist in DB
const INITIAL_CATEGORIES_SEED = [
  { id: 'ceramic-pots', name: 'Ceramic Pots', description: 'Handcrafted glazed and patterned earthenware ceramic pots for homes & gardens.', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop', itemCount: 12 },
  { id: 'jadi', name: 'Jadi & Pickling Jars', description: 'Authentic traditional Indian ceramic storage jars for pickles, ghee, and preserves.', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop', itemCount: 8 },
  { id: 'handi', name: 'Traditional Handi', description: 'Handmade unglazed clay & terracotta cooking pots for nutrient-rich traditional meals.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop', itemCount: 9 },
  { id: 'clay-pots', name: 'Natural Clay Pots', description: 'Organic unglazed water pots (Matka) and cooling vessels crafted by rural artisans.', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop', itemCount: 11 },
  { id: 'traditional-decor', name: 'Traditional Decor', description: 'Cultural wall hangings, terracotta lamps, oil diyas, and heritage showpieces.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop', itemCount: 14 },
  { id: 'kitchen-home', name: 'Kitchen & Home', description: 'Earthen tableware, chai kulhads, clay serving bowls, and traditional coasters.', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800&auto=format&fit=crop', itemCount: 10 },
  { id: 'brass-copper', name: 'Brass & Copper Craft', description: 'Hand-hammered pure copper drinkware, antique brass urli bowls, and oil lamps.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop', itemCount: 7 },
  { id: 'home-art', name: 'Artisan Heritage & Toys', description: 'Channapatna eco wooden toys, Tanjore art wall plaques, and Indian folk art.', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', itemCount: 6 },
];

// @desc    Get all categories (with live item counts from products)
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });

    // Auto-seed if empty
    if (categories.length === 0) {
      categories = await Category.insertMany(INITIAL_CATEGORIES_SEED);
      console.log('✅ Seeded initial categories to MongoDB');
    }

    // Enrich with live product counts
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.id });
        return { ...cat.toObject(), itemCount: count };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// @desc    Upload category image
// @route   POST /api/categories/upload
// @access  Private (Admin)
router.post('/upload', protect, adminOrSeller, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const serverHost = `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${serverHost}/uploads/categories/${req.file.filename}`;
    res.json({
      message: 'Category image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('❌ Category image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
router.post('/', protect, adminOrSeller, async (req, res) => {
  try {
    const { id, name, description, image } = req.body;

    if (!id || !name || !image) {
      return res.status(400).json({ message: 'id, name and image are required' });
    }

    const existing = await Category.findOne({ id });
    if (existing) {
      return res.status(409).json({ message: `Category with id "${id}" already exists` });
    }

    const productCount = await Product.countDocuments({ category: id });

    const category = await Category.create({
      id,
      name,
      description: description || 'Handcrafted traditional Indian craft category.',
      image,
      itemCount: productCount,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(400).json({ message: 'Failed to create category', error: error.message });
  }
});

// @desc    Update a category by its slug id
// @route   PUT /api/categories/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOrSeller, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (image) category.image = image;

    // Recalculate live item count
    category.itemCount = await Product.countDocuments({ category: category.id });

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOrSeller, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

export default router;
