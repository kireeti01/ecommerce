# AURA Marketplace — Production-Quality Full-Stack MERN E-Commerce Web Application

A full-stack, enterprise-grade e-commerce web platform built with the **MERN** stack (**MongoDB Atlas**, **Express.js**, **React 18**, **Node.js**). Organized as a clean monorepo with separate `client/` and `server/` architectures, strict JWT security (in-memory access tokens + `httpOnly` refresh cookie rotation), persistent and guest carts, real-time stock deduction, and a dedicated Administrator portal.

---

## 📑 Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Folder Structure](#folder-structure)
3. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Local Development Setup](#local-development-setup)
6. [Database Seeding](#database-seeding)
7. [REST API Documentation](#rest-api-documentation)
8. [Deployment Instructions](#deployment-instructions)
9. [Security & Best Practices](#security--best-practices)

---

## 🏗 Architectural Overview

- **Backend**: Node.js & Express.js with Mongoose ODM, Helmet security headers, CORS with credentials, cookie-parser, rate-limiting on authentication endpoints, express-validator schemas, and Multer with Cloudinary media storage.
- **Frontend**: Vite + React 18, Tailwind CSS v3.4, Redux Toolkit for state management, React Router DOM v6, Axios with automatic 401 token refresh queue, Lucide React icons, and React Hot Toast notifications.
- **Authentication**: Dual-token pattern:
  - **Access Token (15 mins)**: Kept strictly in frontend memory (Redux state), never written to `localStorage` or `sessionStorage` to eliminate XSS token theft.
  - **Refresh Token (7 days)**: Issued as an `httpOnly`, `secure`, `sameSite` cookie and validated against a SHA-256 hash in MongoDB.
  - **Silent Token Rotation**: Axios interceptor catches 401 status, queues incoming requests, calls `/api/auth/refresh`, updates access token in memory, and seamlessly replays original calls without interrupting user experience.
- **Cart Synchronization**: Unauthenticated users can browse and add items to a local guest cart. Upon logging in or registering, guest items are automatically synchronized and merged with their MongoDB cart.
- **Order & Payment Processing**: Interactive Mock Payment Gateway that verifies card inputs, simulates gateway latency, updates order status, and atomically decrements product inventory.

---

## 📁 Folder Structure

```
fsddeployproj/
├── package.json               # Root scripts (concurrently dev, install:all, seed)
├── .gitignore                 # Excludes .env, node_modules, build outputs
├── README.md                  # Complete documentation
│
├── server/
│   ├── package.json
│   ├── server.js              # Express app, security, middleware, route mounting
│   ├── .env.example
│   ├── .env                   # Local configuration (never commit to git)
│   ├── config/
│   │   ├── db.js              # Atlas connection with event listeners & graceful exit
│   │   └── cloudinary.js      # Cloudinary v2 setup with local/fallback support
│   ├── models/
│   │   ├── User.js            # User model (bcrypt, addresses, refreshToken, role)
│   │   ├── Category.js        # Category model (slug, parentCategory)
│   │   ├── Product.js         # Product model (ratings, stock, discounts, images)
│   │   ├── Cart.js            # Persistent Cart model with price calculations
│   │   ├── Order.js           # Order model (fulfillment tracking, snapshots)
│   │   └── Review.js          # Product reviews (1-review-per-user constraint)
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT Bearer token verification
│   │   ├── roleMiddleware.js  # Role-based access control (e.g. admin)
│   │   ├── errorHandler.js    # Centralized consistent JSON error responses
│   │   ├── validateRequest.js # express-validator validation result handler
│   │   ├── rateLimiter.js     # Brute-force protection for auth routes
│   │   └── uploadMiddleware.js# Multer memory storage with image file filtering
│   ├── utils/
│   │   ├── generateTokens.js  # JWT generation & httpOnly cookie configuration
│   │   └── sendEmail.js       # Nodemailer transporter with dev console fallback
│   ├── controllers/
│   │   ├── authController.js      # Register, login, refresh, logout, password reset
│   │   ├── productController.js   # Search, filter, pagination, sorting, CRUD
│   │   ├── categoryController.js  # Category management
│   │   ├── cartController.js      # Cart CRUD & guest merge
│   │   ├── orderController.js     # Stock deduction, user orders, admin status
│   │   ├── reviewController.js    # Review submission & rating aggregation
│   │   └── userController.js      # Profile, address book, admin user listing
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   └── seed/
│       ├── seedData.js        # 20 sample products across 5 categories + demo users
│       └── seeder.js          # Standalone seed runner (npm run seed)
│
└── client/
    ├── package.json
    ├── vite.config.js         # Dev proxy forwarding /api to http://localhost:5000
    ├── tailwind.config.js     # Luxury color system, animations, dark mode
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── index.css          # Tailwind directives, glassmorphism, scrollbars
        ├── main.jsx           # ReactDOM entry, Provider, BrowserRouter
        ├── App.jsx            # Route tree & silent session restore on mount
        ├── api/
        │   └── axios.js       # Axios client with JWT interceptor & refresh queue
        ├── store/
        │   ├── index.js       # Redux Toolkit store
        │   └── slices/
        │       ├── authSlice.js  # In-memory access token & auth state
        │       └── cartSlice.js  # Cart state & local storage guest persistence
        ├── routes/
        │   ├── ProtectedRoute.jsx # Requires authentication
        │   └── AdminRoute.jsx     # Requires admin privileges
        ├── components/
        │   ├── layout/        # Navbar, Footer
        │   ├── common/        # LoadingSkeleton, Modal, StarRating, EmptyState
        │   ├── product/       # ProductCard, ProductFilter
        │   └── cart/          # CartItem
        └── pages/
            ├── Home.jsx            # Hero showcase, categories, featured items
            ├── ProductListing.jsx  # Multi-filter search with pagination
            ├── ProductDetails.jsx  # Gallery, stock counter, reviews & form
            ├── Cart.jsx            # Bag review & free shipping calculator
            ├── Checkout.jsx        # 3-step checkout with Mock Card Terminal
            ├── OrderHistory.jsx    # Past orders with status pills
            ├── OrderDetails.jsx    # Order tracking timeline & invoice
            ├── Profile.jsx         # Profile settings & address book
            ├── Login.jsx           # Auth form with 1-click Demo buttons
            ├── Register.jsx        # Account registration
            ├── ForgotPassword.jsx  # Dispatches recovery link
            ├── ResetPassword.jsx   # Updates password using token
            └── admin/
                ├── AdminDashboard.jsx  # Revenue KPIs, orders, low stock
                ├── ManageProducts.jsx  # Product inventory CRUD & image uploads
                ├── ManageOrders.jsx    # Order fulfillment management
                └── ManageCategories.jsx# Department management
```

---

## 🌐 MongoDB Atlas Setup Guide

To connect the application to your MongoDB Atlas cloud database:

### 1. Create a Free Cluster
1. Sign in or register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Build a Database** and select the **M0 Free** shared tier.
3. Choose your preferred cloud provider (AWS/GCP) and closest region, then click **Create**.

### 2. Configure Database User Credentials
1. Go to **Security** &rarr; **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication, specify a username (e.g. `ecommerce_admin`) and a strong password.
4. Set **Database User Privileges** to `Read and write to any database`.
5. Click **Add User**.

### 3. Configure IP Whitelist (Network Access)
> [!IMPORTANT]
> Because cloud platforms like **Render**, **Railway**, and **Heroku** assign dynamic outgoing IP addresses to web services, you **must whitelist `0.0.0.0/0` (Allow Access from Anywhere)** in your Atlas Network Access settings. Without this, your deployed backend will fail to connect.

1. Go to **Security** &rarr; **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access From Anywhere** (which inserts `0.0.0.0/0`).
4. Click **Confirm**.

### 4. Retrieve Connection String
1. Go to **Deployments** &rarr; **Database**.
2. Click **Connect** on your cluster.
3. Choose **Drivers** (Node.js).
4. Copy the connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.
6. Set this value as `MONGO_URI` in `server/.env`.

---

## 🔑 Environment Variables Reference

### Backend (`server/.env`)
```ini
PORT=5000
NODE_ENV=development

# MongoDB Atlas URI (Never commit your real connection string to version control)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secrets (Use strong random strings at least 32 characters long)
JWT_SECRET=production_quality_secret_key_aura_ecommerce_jwt_2026_xyz
JWT_REFRESH_SECRET=production_quality_refresh_secret_key_aura_ecommerce_jwt_2026_abc

# Client URL (For CORS & secure cookie handling)
CLIENT_URL=http://localhost:5173

# Email configuration (Optional: defaults to dev console logger if unconfigured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary configuration (Optional: fallback placeholder images are used if blank)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`client/.env`)
```ini
# Base URL for API requests. In local development with Vite dev server proxy, '/api' is used.
# When deploying to Vercel/Netlify, point to your backend: https://your-backend.onrender.com/api
VITE_API_BASE_URL=/api
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- A free MongoDB Atlas cluster

### 1. Install All Dependencies
Run the unified installation script from the project root:
```bash
npm run install:all
```
*(This installs root dev dependencies, backend packages in `server/`, and frontend packages in `client/`)*.

### 2. Configure Environment Files
1. Copy `server/.env.example` to `server/.env` and update your `MONGO_URI`.
2. Ensure `client/.env` has `VITE_API_BASE_URL=/api`.

### 3. Seed Database with Initial Data
Populate 20 realistic products across 5 categories, sample reviews, orders, and demo accounts:
```bash
npm run seed
```

#### Demo User Credentials:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@ecommerce.com` | `Admin@123456` |
| **Customer** | `user@ecommerce.com` | `User@123456` |

*(Tip: The login page includes 1-click demo buttons that prefill these credentials automatically).*

### 4. Run Both Servers Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- **Frontend App**: `http://localhost:5173`

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user, issue tokens |
| `POST` | `/api/auth/login` | Public | Login with email & password, set refresh cookie |
| `POST` | `/api/auth/refresh` | Public (Cookie) | Read httpOnly refresh cookie, issue fresh access token |
| `POST` | `/api/auth/logout` | Public | Clear refresh cookie and invalidate token in database |
| `POST` | `/api/auth/forgot-password` | Public | Email password recovery link with short-lived token |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password using emailed token |
| `GET` | `/api/auth/me` | Private | Get authenticated user info |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (search `?q=`, filter `?category=`, `?minPrice=`, pagination) |
| `GET` | `/api/products/featured` | Public | Get featured products for homepage showcase |
| `GET` | `/api/products/:identifier` | Public | Get single product by MongoDB ID or slug |
| `POST` | `/api/products` | Private (Admin) | Create product with Multer + Cloudinary image uploads |
| `PUT` | `/api/products/:id` | Private (Admin) | Update product details or images |
| `DELETE` | `/api/products/:id` | Private (Admin) | Delete product and remove media from Cloudinary |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all categories with product counts |
| `GET` | `/api/categories/:identifier` | Public | Get category details |
| `POST` | `/api/categories` | Private (Admin) | Create new product category |
| `PUT` | `/api/categories/:id` | Private (Admin) | Update category details |
| `DELETE` | `/api/categories/:id` | Private (Admin) | Delete category (blocked if products linked) |

### Shopping Bag (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Private | Get current user's shopping bag |
| `POST` | `/api/cart/add` | Private | Add product to bag or increment quantity |
| `POST` | `/api/cart/sync` | Private | Merge guest cart items upon login |
| `PUT` | `/api/cart/item/:productId` | Private | Update line item quantity |
| `DELETE` | `/api/cart/item/:productId` | Private | Remove line item |
| `DELETE` | `/api/cart` | Private | Clear entire bag |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Create order from bag, verify stock, deduct inventory |
| `GET` | `/api/orders/my-orders` | Private | List current user's past orders |
| `GET` | `/api/orders/:id` | Private | Get order details and shipment tracking |
| `GET` | `/api/orders` | Private (Admin) | List all store orders with status filters |
| `PUT` | `/api/orders/:id/status` | Private (Admin) | Update order status (processing/shipped/delivered) |
| `GET` | `/api/orders/stats/summary` | Private (Admin) | Dashboard analytics (Revenue, orders, top sellers) |

### Reviews (`/api/products/:id/reviews` & `/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products/:id/reviews` | Private | Add review (1 per user per product, recalculates ratings) |
| `GET` | `/api/products/:id/reviews` | Public | List verified reviews for a product |
| `DELETE` | `/api/reviews/:id` | Private | Delete review (Author or Admin) |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Get user profile and saved addresses |
| `PUT` | `/api/users/profile` | Private | Update profile name or password |
| `POST` | `/api/users/address` | Private | Add new shipping destination |
| `DELETE` | `/api/users/address/:addressId`| Private | Remove saved address |
| `GET` | `/api/users` | Private (Admin) | List all registered accounts |
| `PUT` | `/api/users/:id/role` | Private (Admin) | Update user role (`user` / `admin`) |

---

## 🚢 Deployment Instructions

### Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. In **Render** or **Railway**, create a new **Web Service** pointing to your repository.
3. Configure the build & start commands:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. In the service's **Environment Variables** tab, add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: Random 32+ character string.
   - `JWT_REFRESH_SECRET`: Random 32+ character string.
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://your-aura-app.vercel.app`).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Verify in Atlas that your Network Access IP Whitelist has `0.0.0.0/0`.

### Frontend Deployment (Vercel / Netlify)
1. In **Vercel**, import your GitHub repository.
2. Configure project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed backend + `/api` (e.g. `https://aura-backend.onrender.com/api`).
4. Click **Deploy**.

---

## 🛡 Security & Best Practices

1. **In-Memory JWT Tokens**: Access tokens are kept in JavaScript memory inside Redux state and are never written to `localStorage` or `sessionStorage`.
2. **HttpOnly, Secure Cookies**: Refresh tokens are protected from client-side script inspection (`httpOnly: true`, `sameSite: 'strict'`, `secure: true` in production).
3. **Password Security**: Passwords are encrypted using `bcryptjs` with 10 salt rounds and excluded from default queries via Mongoose `select: false`.
4. **Brute Force Rate Limiting**: `express-rate-limit` enforces strict limits on all `/api/auth/*` endpoints (30 attempts per 15 minutes).
5. **Security Headers**: `helmet` is enabled to mitigate cross-site scripting and MIME sniffing.
6. **Input Validation**: `express-validator` rigorously sanitizes incoming request bodies and query parameters.
7. **Environment Safety**: Real `.env` files are ignored by git in `.gitignore`.
