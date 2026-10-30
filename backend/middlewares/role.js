const requireRole = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        if (roles.includes('admin') && req.user.role === 'admin' && !req.user.admin2Fa) {
            return res.status(403).json({
                error: 'Admin 2FA verification required. Please verify via the secret admin portal.',
                require2Fa: true
            });
        }
        return next();
    }
    return res.status(403).json({ error: `Access denied. Required role(s): ${roles.join(', ')}.` });
};

const isAdmin = requireRole('admin');

module.exports = { requireRole, isAdmin };
