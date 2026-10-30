const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'DKart Admin Panel API Server', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  DKart Admin Panel API Server`);
    console.log(`📡  Listening on port: ${PORT}`);
    console.log(`🔗  Admin Auth: http://localhost:${PORT}/api/admin/auth`);
    console.log(`🔗  Admin API:  http://localhost:${PORT}/api/admin`);
    console.log(`======================================================\n`);
});
