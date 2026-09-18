const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price must be greater than or equal to 0']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category']
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A product must have at least one image'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Number of reviews cannot be negative']
    },
    brand: {
      type: String,
      default: 'Aura Premium'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Slug auto-generation
productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    const cleanName = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${cleanName}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

// Virtual for calculating current effective selling price
productSchema.virtual('effectivePrice').get(function () {
  if (this.discountPrice && this.discountPrice > 0 && this.discountPrice < this.price) {
    return this.discountPrice;
  }
  return this.price;
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1, ratings: -1 });

module.exports = mongoose.model('Product', productSchema);
