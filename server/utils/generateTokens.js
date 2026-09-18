const jwt = require('jsonwebtoken');

/**
 * Generate access and refresh tokens and configure cookie settings
 * @param {Object} user - Mongoose User document
 * @param {Object} res - Express response object
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (user, res) => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_access_secret_ecommerce_key_32_bytes';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_ecommerce_key_32_bytes';

  // Issue short-lived access token (~15 minutes)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '15m' }
  );

  // Issue long-lived refresh token (~7 days)
  const refreshToken = jwt.sign(
    { id: user._id },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  // Set refresh token in secure, httpOnly cookie
  if (res) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS required when sameSite is none
      sameSite: isProduction ? 'none' : 'lax', // 'none' allows cookies across Vercel & Render
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  return { accessToken, refreshToken };
};

/**
 * Clear the refresh token cookie
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0)
  });
};

module.exports = {
  generateTokens,
  clearTokenCookie
};
