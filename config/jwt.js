require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'fallback_super_secret_key_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
};
