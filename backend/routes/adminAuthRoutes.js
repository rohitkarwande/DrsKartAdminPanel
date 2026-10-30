const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const authMiddleware = require('../middlewares/auth');

// 1. Identify & Request Dual 2FA OTPs
router.post('/identify', adminAuthController.requestDualOtp);
router.post('/request-dual-otp', adminAuthController.requestDualOtp);

// 2. Verify Dual OTPs & Receive Elevated Admin Token
router.post('/verify-dual-otp', adminAuthController.verifyDualOtp);

// 3. Verify Active 2FA Session Status
router.get('/session', authMiddleware, adminAuthController.checkAdminSession);

module.exports = router;
