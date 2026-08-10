const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary using process.env credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage with Cloudinary (fallback to disk if env credentials pending)
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'shreyas-bakery-products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `product-${Date.now()}${path.extname(file.originalname)}`),
  });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Product update handler
 * Uploads incoming image files to Cloudinary using multer-storage-cloudinary
 * and saves/returns the returned Cloudinary URL.
 */
const handleProductUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, price, description, category } = req.body;

    let imageUrl = req.body.existingImage || req.body.image || '';

    // If an image file was uploaded via Multer
    if (req.file) {
      // multer-storage-cloudinary provides the Cloudinary URL in path or secure_url
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    }

    const updatedProduct = {
      id,
      name: title || name,
      title: title || name,
      price: Number(price),
      description: description || '',
      category: category || 'cake',
      image: imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully with Cloudinary image URL',
      product: updatedProduct,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Error updating product in Express API route:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error updating product with Cloudinary',
    });
  }
};

// Map PUT /api/admin/products/:id and fallback routes
router.put('/admin/products/:id', upload.single('image'), handleProductUpdate);
router.put('/:id/edit', upload.single('image'), handleProductUpdate);
router.put('/:id', upload.single('image'), handleProductUpdate);

module.exports = router;
