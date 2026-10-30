const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const marketing = require('../services/adminMarketingFunctions');
const support = require('../services/adminSupportAndPlatformFunctions');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');
const auditLog = require('../middlewares/auditLog');

// All admin routes are protected with JWT & Admin 2FA role check
router.use(authMiddleware, isAdmin);

// 1. Dashboard Statistics
router.get('/dashboard', adminController.getDashboardStats);

// 1.5 Reports CSV Export
router.get('/reports/csv', auditLog('EXPORT_CSV', 'report'), adminController.getReportCsv);

// 2. User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', auditLog('UPDATE_USER_STATUS', 'user'), adminController.updateUserStatus);
router.patch('/users/:id/suspend', auditLog('SUSPEND_USER', 'user'), adminController.suspendUser);
router.patch('/users/:id/reactivate', auditLog('REACTIVATE_USER', 'user'), adminController.reactivateUser);
router.patch('/users/:id/paid-promotions', auditLog('TOGGLE_PAID_PROMOTIONS_ACCESS', 'user'), adminController.togglePaidPromotionsAccess);

// 3. Listing Moderation
router.get('/listings', adminController.getAllListings);
router.patch('/listings/:id/status', auditLog('UPDATE_LISTING_STATUS', 'listing'), adminController.updateListingStatus);

// 4. Category Management
router.get('/categories', adminController.getCategories);
router.post('/categories', auditLog('CREATE_CATEGORY', 'category'), adminController.createCategory);
router.put('/categories/:id', auditLog('UPDATE_CATEGORY', 'category'), adminController.updateCategory);
router.delete('/categories/:id', auditLog('DELETE_CATEGORY', 'category'), adminController.deleteCategory);

// 5. Inquiry Monitoring & Funnel
router.get('/inquiries', adminController.getAllInquiries);
router.get('/deals', async (req, res) => {
    try {
        const stats = await support.getAdminFunnelStats(req.query.period);
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 6. KYC Management
router.get('/kyc', adminController.getPendingKycApplications);
router.get('/kyc/:userId', adminController.getKycDetails);
router.post('/kyc/:userId/approve', auditLog('APPROVE_KYC', 'kyc_document'), adminController.approveKyc);
router.post('/kyc/:userId/reject', auditLog('REJECT_KYC', 'kyc_document'), adminController.rejectKyc);

// 7. Admin Notifications
router.get('/notifications', adminController.getAdminNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

// 8. Security, IP Blacklist & Audit Logs
router.get('/login-history', adminController.getLoginHistory);
router.get('/ip-blacklist', adminController.getIpBlacklist);
router.post('/ip-blacklist', auditLog('BLACKLIST_IP', 'security'), adminController.addIpToBlacklist);
router.delete('/ip-blacklist/:ip', auditLog('UNBLACKLIST_IP', 'security'), adminController.removeIpFromBlacklist);
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await support.getAuditLogs(req.query);
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 9. Hero Carousel & Banner Management
router.get('/banners', async (req, res) => {
    try {
        const banners = await marketing.getAllBanners();
        res.json({ banners });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/banners', upload.single('image'), auditLog('CREATE_BANNER', 'hero_banner'), async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
        const banner = await marketing.createBanner({ ...req.body, image_url: imageUrl });
        res.status(201).json({ banner });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

router.put('/banners/:id', upload.single('image'), auditLog('UPDATE_BANNER', 'hero_banner'), async (req, res) => {
    try {
        const banner = await marketing.updateBanner(req.params.id, { ...req.body, file: req.file });
        res.json({ banner });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

router.delete('/banners/:id', auditLog('DELETE_BANNER', 'hero_banner'), async (req, res) => {
    try {
        await marketing.deleteBanner(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

router.post('/banners/reorder', auditLog('REORDER_BANNERS', 'hero_banner'), async (req, res) => {
    try {
        await marketing.reorderBanners(req.body.bannerIds);
        res.json({ success: true });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

// 10. Promotions Moderation
router.get('/promotions', async (req, res) => {
    try {
        const promotions = await marketing.adminListPromotions(req.query.status);
        res.json({ promotions });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/promotions/:id/status', auditLog('UPDATE_PROMOTION_STATUS', 'promotion'), async (req, res) => {
    try {
        const result = await marketing.adminUpdatePromotionStatus(req.params.id, req.body);
        res.json(result);
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

// 11. Support Tickets Management
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await support.getAllTickets(req.query.status);
        res.json({ tickets });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/tickets/:id', auditLog('UPDATE_TICKET', 'ticket'), async (req, res) => {
    try {
        const ticket = await support.updateTicketStatus(req.params.id, req.body);
        res.json({ ticket });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

// 12. Service Requests Management
router.get('/services', async (req, res) => {
    try {
        const requests = await support.getAllServiceRequests();
        res.json({ requests });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/services/:id', auditLog('UPDATE_SERVICE_REQUEST', 'service_request'), async (req, res) => {
    try {
        const request = await support.updateServiceRequestStatus(req.params.id, req.body);
        res.json({ request });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

// 13. Feature Flags Management
router.get('/feature-flags', async (req, res) => {
    try {
        const data = await support.getFeatureFlags();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/feature-flags/:key', auditLog('UPDATE_FEATURE_FLAG', 'feature_flag'), async (req, res) => {
    try {
        const flag = await support.updateFeatureFlag(req.params.key, req.body.is_enabled);
        res.json({ flag });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
});

// 14. Fraud Reports Management
router.get('/reports', adminController.getFraudReports);
router.patch('/reports/:id/status', auditLog('UPDATE_REPORT_STATUS', 'fraud_report'), adminController.updateReportStatus);

module.exports = router;
