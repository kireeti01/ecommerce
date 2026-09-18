require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { users, categories, products } = require('./seedData');

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('❌ MONGO_URI is not set in environment or .env file!');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🧹 Purging existing collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();

    console.log('🌱 Seeding Users...');
    // Use User.create so pre-save hooks hash the passwords properly
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const customerUser = createdUsers.find((u) => u.role === 'user');

    console.log(`✅ Seeded ${createdUsers.length} users`);

    console.log('🌱 Seeding Categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Seeded ${createdCategories.length} categories`);

    // Map categories by slug for quick product linking
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('🌱 Seeding Products...');
    const preparedProducts = products.map((item) => {
      const { categorySlug, ...rest } = item;
      return {
        ...rest,
        category: categoryMap[categorySlug]
      };
    });

    const createdProducts = await Product.insertMany(preparedProducts);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    console.log('🌱 Seeding Sample Reviews...');
    const sampleReviews = [
      {
        product: createdProducts[0]._id,
        user: customerUser._id,
        rating: 5,
        comment: 'Outstanding sound stage and the active noise cancelling completely silences the train commute!'
      },
      {
        product: createdProducts[0]._id,
        user: adminUser._id,
        rating: 4,
        comment: 'Very premium build and materials. Extremely comfortable for long studio sessions.'
      },
      {
        product: createdProducts[1]._id,
        user: customerUser._id,
        rating: 5,
        comment: 'The tactile feedback on this mechanical keyboard is bliss. Solid aluminum construction.'
      },
      {
        product: createdProducts[4]._id,
        user: customerUser._id,
        rating: 5,
        comment: 'Tuscan wool feels exceptionally luxurious. Fits true to size with a sharp modern cut.'
      }
    ];

    for (const rev of sampleReviews) {
      const r = await Review.create(rev);
      await Review.calculateAverageRating(r.product);
    }
    console.log(`✅ Seeded ${sampleReviews.length} verified reviews`);

    console.log('🌱 Seeding Sample Orders for Analytics...');
    const sampleOrder1 = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          quantity: 1,
          price: 299.99,
          image: createdProducts[0].images[0].url
        },
        {
          product: createdProducts[9]._id,
          name: createdProducts[9].name,
          quantity: 1,
          price: 85.00,
          image: createdProducts[9].images[0].url
        }
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'Card',
      paymentStatus: 'completed',
      paymentDetails: {
        transactionId: `TXN_DEMO_${Date.now()}`,
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      orderStatus: 'delivered',
      itemsPrice: 384.99,
      taxPrice: 30.80,
      shippingPrice: 0.00,
      totalPrice: 415.79,
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const sampleOrder2 = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: createdProducts[3]._id,
          name: createdProducts[3].name,
          quantity: 1,
          price: 389.00,
          image: createdProducts[3].images[0].url
        }
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'Card',
      paymentStatus: 'completed',
      paymentDetails: {
        transactionId: `TXN_DEMO_${Date.now() + 1}`,
        paidAt: new Date()
      },
      orderStatus: 'processing',
      itemsPrice: 389.00,
      taxPrice: 31.12,
      shippingPrice: 0.00,
      totalPrice: 420.12
    });

    console.log('✅ Seeded sample completed orders');

    console.log('\n======================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('👑 Admin:    admin@ecommerce.com / Admin@123456');
    console.log('👤 Customer: user@ecommerce.com  / User@123456');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDB();
