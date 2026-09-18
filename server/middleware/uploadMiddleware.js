const multer = require('multer');

// Store file in memory as buffer for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// File filter to allow only image mime types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Please upload only image files (JPEG, PNG, WEBP).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max per file
  }
});

module.exports = upload;
