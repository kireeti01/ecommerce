const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokens, clearTokenCookie } = require('../utils/generateTokens');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user, res);

    // Store hashed refreshToken in DB
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & issue access + refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Check for user (include password and refreshToken for validation)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // Generate tokens & set cookie
    const { accessToken, refreshToken } = generateTokens(user, res);

    // Hash and store refreshToken in user record
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using httpOnly cookie refresh token
 * @route   POST /api/auth/refresh
 * @access  Public (Cookie-based)
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided. Please log in again.'
      });
    }

    const jwtRefreshSecret =
      process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_ecommerce_key_32_bytes';

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(token, jwtRefreshSecret);
    } catch (err) {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.'
      });
    }

    // Find user by decoded ID
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken) {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session revoked or user not found.'
      });
    }

    // Hash the incoming cookie token and compare with stored hash
    const incomingTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    if (incomingTokenHash !== user.refreshToken) {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid session token reuse detected. Please log in again.'
      });
    }

    // Issue fresh access token (and keep or rotate refresh token)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, res);

    // Save rotated refresh token
    user.refreshToken = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & invalidate tokens
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Clear refresh token in database
      await User.findOneAndUpdate(
        { refreshToken: hashedToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - email reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address.'
      });
    }

    // Get reset token and save hashed version
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset.
Please click the link below to reset your password:
${resetUrl}

This link is valid for 15 minutes. If you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your Aura E-Commerce account. Click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this change, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Aura E-Commerce',
        message,
        html
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email.'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    // Hash url token to match DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Issue new tokens
    const { accessToken, refreshToken } = generateTokens(user, res);
    user.refreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
