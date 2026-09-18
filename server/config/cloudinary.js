const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload an image buffer or base64 data to Cloudinary.
 * Fallback to a data URI or placeholder if Cloudinary is not configured.
 * @param {Buffer|string} fileBuffer - The file buffer or base64 string
 * @param {string} folder - Target Cloudinary folder name
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToCloudinary = async (fileBuffer, folder = 'ecommerce_products') => {
  // If credentials are not configured, return a structured fallback
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn('⚠️ Cloudinary credentials missing. Using local/fallback media handling.');
    const timestamp = Date.now();
    return {
      url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80`,
      public_id: `mock_${timestamp}`
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('mock_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting image from Cloudinary (${publicId}):`, error.message);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
