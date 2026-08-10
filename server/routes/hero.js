const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'shreyas-hero-slides',
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
    filename: (req, file, cb) => cb(null, `hero-${Date.now()}${path.extname(file.originalname)}`),
  });
}

const upload = multer({ storage });

router.put('/admin/hero', upload.single('image'), async (req, res) => {
  try {
    const { id, name, note, price, mainTitle, subDescription } = req.body;
    let imageUrl = req.body.existingImage || req.body.image || '';

    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    }

    const updatedSlide = {
      id,
      name,
      note,
      price,
      mainTitle,
      subDescription,
      image: imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      slide: updatedSlide,
      imageUrl,
    });
  } catch (error) {
    console.error('Error in Express hero route:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error updating hero slide',
    });
  }
});

module.exports = router;
